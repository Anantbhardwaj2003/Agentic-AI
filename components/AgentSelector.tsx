import React from 'react';
import { AgentType, AGENT_CONFIGS } from '../types';
import { Icon } from './Icon';

interface AgentSelectorProps {
  selectedAgents: AgentType[];
  onToggleAgent: (agent: AgentType) => void;
}

export const AgentSelector: React.FC<AgentSelectorProps> = ({ selectedAgents, onToggleAgent }) => {
  const availableAgents = [
    AgentType.Research,
    AgentType.Reasoning,
    AgentType.Creator,
    AgentType.Coder,
    AgentType.Analyzer
  ];

  return (
    <div className="p-5 glass-panel rounded-2xl shadow-2xl animate-in slide-in-from-bottom-2 mb-4 border border-white/10 ring-1 ring-black/20">
      <div className="flex items-center justify-between mb-5">
        <div className="flex flex-col">
          <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
            <Icon name="Users" size={16} className="text-indigo-400" />
            Agent Team Configuration
          </h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">
             Select specific agents to force their inclusion in the plan.
          </p>
        </div>
        <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${selectedAgents.length > 0 ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>
          {selectedAgents.length === 0 ? 'Auto-Assign' : 'Manual Override'}
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {availableAgents.map((type) => {
          const config = AGENT_CONFIGS[type];
          const isSelected = selectedAgents.includes(type);
          
          return (
            <button
              key={type}
              onClick={() => onToggleAgent(type)}
              className={`
                relative flex flex-col items-center p-3 rounded-xl border transition-all duration-300 group overflow-hidden
                ${isSelected 
                  ? 'bg-indigo-600/10 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)]' 
                  : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                }
              `}
            >
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/20 to-transparent opacity-50" />
              )}

              <div className={`
                relative p-2.5 rounded-lg mb-2 transition-all duration-300
                ${isSelected 
                  ? 'bg-indigo-500 text-white shadow-lg scale-110' 
                  : 'bg-zinc-800/50 text-zinc-400 group-hover:text-zinc-200 group-hover:bg-zinc-700'
                }
              `}>
                <Icon name={config.icon} size={20} />
              </div>
              
              <span className={`relative text-xs font-medium transition-colors ${isSelected ? 'text-indigo-200' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                {config.name.replace(' Agent', '')}
              </span>
              
              {isSelected && (
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,1)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};