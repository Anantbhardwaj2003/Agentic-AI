import React, { useState, useRef, useEffect } from 'react';
import { ChatInput } from './components/ChatInput';
import { WelcomeScreen } from './components/WelcomeScreen';
import { PlanVisualizer } from './components/PlanVisualizer';
import { FinalResponse } from './components/FinalResponse';
import { Icon } from './components/Icon';
import { SettingsModal } from './components/SettingsModal';
import { OrchestrationPlan, AgentStep, AgentType, AppSettings } from './types';
import * as geminiService from './services/geminiService';
import * as ollamaService from './services/ollamaService';

const App: React.FC = () => {
  // Application State
  const [query, setQuery] = useState<string | null>(null);
  const [selectedAgents, setSelectedAgents] = useState<AgentType[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [plan, setPlan] = useState<OrchestrationPlan | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [finalAnswer, setFinalAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'quota' | 'general' | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    provider: 'gemini',
    ollamaModel: 'gemma3:1b',
    ollamaBaseUrl: 'http://localhost:11434'
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Configure Ollama service whenever settings change
  useEffect(() => {
    ollamaService.configureOllama(settings.ollamaModel, settings.ollamaBaseUrl);
  }, [settings]);

  // Auto scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [plan, currentStepIndex, finalAnswer, statusMessage, error]);

  const handleSend = async (userQuery: string, agents: AgentType[]) => {
    if (isProcessing) return;

    // Reset state
    setQuery(userQuery);
    setSelectedAgents(agents); 
    setIsProcessing(true);
    setPlan(null);
    setCurrentStepIndex(-1);
    setFinalAnswer(null);
    setError(null);
    setErrorType(null);
    setStatusMessage("Initializing Orchestrator...");

    // Select the correct service based on settings
    const activeService = settings.provider === 'ollama' ? ollamaService : geminiService;
    const providerName = settings.provider === 'ollama' ? `Ollama (${settings.ollamaModel})` : 'Gemini Cloud';

    try {
      // 1. Orchestrate
      setStatusMessage(`${providerName} is planning with your selected agents...`);
        
      const orchestrationPlan = await activeService.orchestrateQuery(userQuery, agents);
      
      setPlan(orchestrationPlan);
      
      // 2. Execute Steps
      const executedSteps: AgentStep[] = [...orchestrationPlan.steps];
      const context: { stepId: string; output: string }[] = [];

      for (let i = 0; i < executedSteps.length; i++) {
        setCurrentStepIndex(i);
        const step = executedSteps[i];
        
        // Update step status to working
        step.status = 'working';
        step.isExpanded = true;
        setPlan({ ...orchestrationPlan, steps: [...executedSteps] }); 
        
        setStatusMessage(`Agent ${step.agentType} is working on: ${step.taskDescription.substring(0, 30)}...`);

        // Execute Agent
        const output = await activeService.executeAgentStep(step, userQuery, context);
        
        // Update step status to completed
        step.status = 'completed';
        step.output = output;
        
        context.push({ stepId: step.id, output });
        setPlan({ ...orchestrationPlan, steps: [...executedSteps] });
      }

      // 3. Synthesize
      setCurrentStepIndex(executedSteps.length); // All steps done
      setStatusMessage("Synthesizing final response...");
      
      const final = await activeService.synthesizeFinalAnswer(userQuery, executedSteps);
      setFinalAnswer(final);
      setStatusMessage("Done.");

    } catch (err: any) {
      console.error(err);
      if (err.message === "QUOTA_EXCEEDED") {
        setErrorType('quota');
        setError("System Overload: Quota Exceeded");
      } else {
        setErrorType('general');
        setError(err.message || "An unexpected error occurred during the agent workflow.");
        
        if (settings.provider === 'ollama' && err.message.includes("Failed to fetch")) {
           setError("Could not connect to Ollama. Make sure 'ollama serve' is running with OLLAMA_ORIGINS=\"*\"");
        }
      }
      
      // If we have a plan, mark the current step as failed
      if (plan && currentStepIndex >= 0 && currentStepIndex < plan.steps.length) {
         const newSteps = [...plan.steps];
         newSteps[currentStepIndex].status = 'failed';
         setPlan({ ...plan, steps: newSteps });
      }

    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    if (query) {
      handleSend(query, selectedAgents);
    }
  };

  const toggleStep = (stepId: string) => {
    if (!plan) return;
    const newSteps = plan.steps.map(s => 
      s.id === stepId ? { ...s, isExpanded: !s.isExpanded } : s
    );
    setPlan({ ...plan, steps: newSteps });
  };

  const handleReset = () => {
    setQuery(null);
    setPlan(null);
    setFinalAnswer(null);
    setCurrentStepIndex(-1);
    setError(null);
    setErrorType(null);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-zinc-100 overflow-hidden font-sans selection:bg-indigo-500/30 relative">
      
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none z-0"></div>
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none z-0"></div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={setSettings}
      />

      {/* Header - Increased opacity/blur to prevent content clipping */}
      <header className="h-16 border-b border-white/5 bg-background/95 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-30 shadow-lg shadow-black/20 fixed top-0 w-full">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={handleReset}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
            <Icon name="Hexagon" size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">InfinityAI</span>
          <span className="text-[10px] font-mono text-zinc-500 border border-white/10 px-1.5 py-0.5 rounded ml-2">v2.1</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Provider Indicator */}
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
              ${settings.provider === 'ollama' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20'
              }
            `}
          >
             <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${settings.provider === 'ollama' ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
             {settings.provider === 'ollama' ? `Local: ${settings.ollamaModel}` : 'Cloud: Gemini'}
          </button>

          <div className="w-px h-6 bg-white/10 mx-2" />

           {query && (
             <button 
               onClick={handleReset}
               className="p-2 hover:bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors"
               title="New Chat"
             >
               <Icon name="Plus" size={20} />
             </button>
           )}
           <button 
             onClick={() => setIsSettingsOpen(true)}
             className="p-2 hover:bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors"
           >
             <Icon name="Settings" size={20} />
           </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth z-10 pt-16" ref={chatContainerRef}>
        <div className="max-w-4xl mx-auto w-full p-4 md:p-8 min-h-full pb-32">
          
          {!query ? (
            <WelcomeScreen />
          ) : (
            <div className="flex flex-col gap-8 animate-in fade-in duration-500 pt-8">
              
              {/* User Query Bubble */}
              <div className="flex justify-end">
                <div className="bg-surfaceHighlight/80 backdrop-blur-md border border-white/10 rounded-2xl rounded-tr-sm py-4 px-6 max-w-[85%] shadow-xl group hover:border-indigo-500/30 transition-colors">
                   <p className="text-zinc-100 text-lg leading-relaxed">{query}</p>
                </div>
              </div>

              {/* Status Indicator (if analyzing) */}
              {isProcessing && !plan && (
                <div className="flex items-center gap-4 text-indigo-300 animate-pulse-subtle px-4 py-8 justify-center">
                   <div className="w-6 h-6 rounded-full border-2 border-indigo-500/50 border-t-indigo-500 animate-spin" />
                   <span className="text-sm font-medium tracking-wide font-mono uppercase">{statusMessage}</span>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className={`
                  relative overflow-hidden rounded-xl border p-6 flex flex-col gap-4 animate-in slide-in-from-bottom-2
                  ${errorType === 'quota' 
                    ? 'bg-red-950/20 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.15)] bg-striped-pattern' 
                    : 'bg-red-500/10 border-red-500/20'
                  }
                `}>
                  {errorType === 'quota' && (
                     <div className="absolute inset-0 bg-red-500/5 animate-pulse-slow"></div>
                  )}

                  <div className="flex items-start gap-4 z-10">
                    <div className={`
                      p-3 rounded-lg shrink-0
                      ${errorType === 'quota' ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-red-500/10 text-red-400'}
                    `}>
                      <Icon name={errorType === 'quota' ? "ZapOff" : "AlertTriangle"} size={24} />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold mb-1 ${errorType === 'quota' ? 'text-red-400 error-glow uppercase tracking-wider animate-glitch' : 'text-red-400'}`}>
                        {errorType === 'quota' ? 'Neural Link Unstable' : 'Execution Error'}
                      </h3>
                      <p className="text-red-200/80 leading-relaxed text-sm">
                        {errorType === 'quota' 
                          ? "The agent network is currently overloaded (429 Quota Exceeded). Automatic retries were attempted but the system is busy. Please wait a moment before trying again."
                          : error}
                      </p>

                      <div className="mt-4 flex gap-3">
                         <button 
                            onClick={handleRetry}
                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors border border-red-500/30 flex items-center gap-2"
                         >
                            <Icon name="RefreshCw" size={14} />
                            Retry Request
                         </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Plan Visualization */}
              {plan && (
                <PlanVisualizer 
                  plan={plan} 
                  onToggleStep={toggleStep} 
                />
              )}

              {/* Synthesizing Status */}
              {isProcessing && currentStepIndex === plan?.steps.length && (
                 <div className="flex flex-col items-center justify-center gap-3 text-purple-400 animate-pulse py-8">
                    <Icon name="Sparkles" className="animate-spin-slow" size={24} />
                    <span className="text-sm font-medium tracking-widest uppercase">Synthesizing Final Report...</span>
                 </div>
              )}

              {/* Final Answer */}
              {finalAnswer && <FinalResponse content={finalAnswer} />}
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <div className="shrink-0 z-40">
        <ChatInput onSend={handleSend} disabled={isProcessing} />
      </div>
    </div>
  );
};

export default App;