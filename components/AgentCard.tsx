import React, { useState } from 'react';
import type { AgentStep } from '../types';
import { AGENT_CONFIGS } from '../types';
import { Icon } from './Icon';
import { MarkdownRenderer } from './MarkdownRenderer';

interface AgentCardProps {
  step: AgentStep;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  onToggleExpand: () => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ step, index, isActive, isCompleted, onToggleExpand }) => {
  const config = AGENT_CONFIGS[step.agentType];
  const isFailed = step.status === 'failed';
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (step.output) {
      navigator.clipboard.writeText(step.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`
      relative mb-6 rounded-xl border transition-all duration-500 overflow-hidden
      ${isActive 
        ? 'bg-surfaceHighlight border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/20' 
        : isCompleted
          ? 'bg-surface/80 border-emerald-500/20 shadow-none'
          : isFailed
            ? 'bg-red-950/10 border-red-500/20'
            : 'bg-surface/30 border-white/5 opacity-70 hover:opacity-100'
    }`}>
      
      {/* Active Scanning Animation */}
      {isActive && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
           <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,1)] animate-scan z-10 opacity-50"></div>
           <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent animate-pulse-subtle"></div>
        </div>
      )}

      {/* Header */}
      <div 
        className="relative flex items-center gap-5 p-5 cursor-pointer hover:bg-white/5 transition-colors z-20"
        onClick={onToggleExpand}
      >
        <div className={`
          flex items-center justify-center w-14 h-14 rounded-2xl shrink-0 transition-all duration-300 relative
          ${isActive 
            ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] scale-105' 
            : isCompleted 
              ? 'bg-emerald-500/10 text-emerald-500' 
              : isFailed
                ? 'bg-red-500/10 text-red-500'
                : 'bg-zinc-800/50 text-zinc-500 border border-white/5'}
        `}>
           {isActive && <div className="absolute inset-0 rounded-2xl border-2 border-indigo-400/30 animate-ping" />}
           
          {isActive ? (
            <div className="animate-spin-slow">
              <Icon name="Loader2" size={26} />
            </div>
          ) : isCompleted ? (
             <Icon name="Check" size={26} />
          ) : isFailed ? (
             <Icon name="AlertTriangle" size={26} className="animate-pulse" />
          ) : (
            <Icon name={config.icon} size={26} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1.5">
            <span className={`text-base font-bold tracking-tight 
              ${isActive ? 'text-indigo-200' 
                : isCompleted ? 'text-emerald-200' 
                : isFailed ? 'text-red-400'
                : 'text-zinc-400'}
            `}>
              {config.name}
            </span>
            <span className={`
              text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded-full border
              ${isActive 
                ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300 animate-pulse' 
                : isCompleted 
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' 
                  : isFailed
                    ? 'border-red-500/30 bg-red-500/10 text-red-400'
                    : 'border-zinc-700 bg-zinc-800/50 text-zinc-500'}
            `}>
              {isFailed ? 'Failed' : `Step ${index + 1}`}
            </span>
          </div>
          <p className="text-sm text-zinc-400 truncate font-light leading-relaxed opacity-80">
            {step.taskDescription}
          </p>
        </div>

        <div className={`shrink-0 text-zinc-500 transition-transform duration-300 p-2 rounded-full hover:bg-white/5 ${step.isExpanded ? 'bg-white/5 text-zinc-300' : ''}`} style={{ transform: step.isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <Icon name="ChevronDown" size={20} />
        </div>
      </div>

      {/* Expanded Content */}
      {step.isExpanded && (
        <div className="relative border-t border-white/5 bg-black/20 animate-in slide-in-from-top-2 duration-300 z-10">
          <div className="p-6">
            {isActive && (
              <div className="flex items-center gap-3 text-xs font-medium text-indigo-300 mb-6 bg-indigo-500/10 w-fit px-4 py-2 rounded-full border border-indigo-500/20">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                </span>
                <span className="animate-pulse">Processing data stream...</span>
              </div>
            )}
            
            {step.output ? (
              <div className="relative group">
                <div className="flex justify-between items-end mb-2 px-1">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Agent Output Log</span>
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-500 hover:text-white transition-colors hover:bg-white/10 px-2 py-1 rounded"
                  >
                    <Icon name={copied ? "Check" : "Copy"} size={12} />
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                
                {/* Terminal Styled Output with Markdown Rendering */}
                <div className="bg-[#0d0d10] rounded-xl border border-white/10 shadow-inner overflow-hidden">
                  {/* Fake Terminal Header */}
                  <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center gap-2">
                     <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
                     </div>
                     <div className="ml-3 text-[10px] text-zinc-600 font-mono">nexus-agent-{step.agentType.toLowerCase()}.log</div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-5">
                    <MarkdownRenderer content={step.output} />
                  </div>
                </div>
              </div>
            ) : isFailed ? (
               <div className="text-red-400 text-sm font-mono flex items-center gap-3 bg-red-950/20 p-4 rounded-xl border border-red-500/20">
                  <Icon name="AlertTriangle" size={18} />
                  Agent process terminated due to network limits or internal error.
               </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-600 gap-4 opacity-50">
                 <Icon name={config.icon} size={40} className="opacity-20" />
                 <span className="text-xs font-mono uppercase tracking-widest">Waiting for input stream</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
