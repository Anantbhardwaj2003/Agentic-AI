import React from 'react';
import { Icon } from './Icon';

export const WelcomeScreen: React.FC = () => {
  const features = [
    {
      title: "Autonomous Orchestration",
      description: "Intelligent planning engine that dynamically breaks down complex queries into executable steps.",
      icon: "GitMerge",
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20"
    },
    {
      title: "Multi-Agent Swarm",
      description: "Specialized expert personas (Coder, Researcher, Creator) collaborating to solve multifaceted problems.",
      icon: "Users",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    },
    {
      title: "Hybrid Execution",
      description: "Seamlessly switch between cloud-based Gemini Pro models and local privacy-focused Ollama models.",
      icon: "Cpu",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20"
    },
    {
      title: "Transparent Reasoning",
      description: "Watch the thought process in real-time with visualized steps, status updates, and intermediate outputs.",
      icon: "Activity",
      color: "text-pink-400",
      bg: "bg-pink-500/10",
      border: "border-pink-500/20"
    }
  ];

  return (
    <div className="w-full min-h-full flex flex-col items-center pt-24 pb-12 animate-in fade-in duration-700">
      
      {/* Hero Section */}
      <div className="relative mb-12 flex flex-col items-center text-center px-4">
        {/* Animated Logo */}
        <div className="relative mb-8 group animate-float">
          <div className="absolute inset-0 bg-indigo-500 blur-[60px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000 rounded-full"></div>
          <div className="relative w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 backdrop-blur-md rounded-[2rem] border border-white/10 flex items-center justify-center shadow-2xl shadow-indigo-500/20 rotate-3 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105 ring-1 ring-white/20">
            <Icon name="Hexagon" size={48} className="md:w-14 md:h-14 text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
          </div>
          
          <div className="absolute -top-4 -right-4 w-10 h-10 md:w-12 md:h-12 bg-[#18181b] backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-center animate-bounce duration-[3000ms] shadow-lg">
             <Icon name="BrainCircuit" size={18} className="md:w-5 md:h-5 text-emerald-400" />
          </div>
          <div className="absolute -bottom-2 -left-6 w-8 h-8 md:w-10 md:h-10 bg-[#18181b] backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-center animate-bounce duration-[4000ms] shadow-lg">
             <Icon name="Code2" size={16} className="md:w-18 md:h-18 text-pink-400" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-200 to-zinc-500 mb-6 tracking-tight text-glow">
          InfinityAI
        </h1>
        <p className="text-zinc-400 max-w-2xl text-base md:text-xl mb-8 leading-relaxed font-light">
          The next generation of <span className="text-indigo-400 font-semibold">Agentic AI Orchestration</span>. 
          Delegate complex tasks to a dynamic team of specialized autonomous agents.
        </p>
      </div>

      {/* Features Grid (Capabilities) */}
      <div className="w-full max-w-5xl px-4 mb-20">
        <div className="text-center mb-8">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">System Capabilities</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, idx) => (
            <div 
              key={idx}
              className={`p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group flex flex-col items-center text-center`}
            >
              <div className={`w-12 h-12 rounded-xl ${feature.bg} ${feature.border} border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon name={feature.icon} className={feature.color} size={24} />
              </div>
              <h3 className="text-sm font-bold text-zinc-200 mb-2">{feature.title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Start / Examples */}
      <div className="w-full max-w-4xl px-4">
        <div className="flex items-center gap-4 mb-6 opacity-50">
           <div className="h-px bg-white/10 flex-1"></div>
           <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Quick Start Examples</span>
           <div className="h-px bg-white/10 flex-1"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: 'Terminal', title: 'Code Generation', desc: 'Write a Python script to visualize stock data.' },
            { icon: 'PenTool', title: 'Creative Writing', desc: 'Write a cyberpunk story prologue set in Neo-Tokyo.' },
            { icon: 'Search', title: 'Market Research', desc: 'Summarize key players in the solid-state battery market.' },
            { icon: 'Cpu', title: 'Strategic Planning', desc: 'Create a 4-week launch plan for a SaaS product.' }
          ].map((item, index) => (
            <div 
              key={index}
              className="group p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-indigo-500/20 transition-all cursor-default flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-zinc-800/50 flex items-center justify-center text-zinc-400 group-hover:text-indigo-400 transition-colors">
                <Icon name={item.icon} size={20} />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">{item.title}</h3>
                <p className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};