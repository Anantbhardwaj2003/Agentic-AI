import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';
import { AgentSelector } from './AgentSelector';
import { AgentType } from '../types';

interface ChatInputProps {
  onSend: (message: string, selectedAgents: AgentType[]) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');
  const [showAgents, setShowAgents] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<AgentType[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input, selectedAgents);
      setInput('');
      setShowAgents(false);
      // We purposefully do NOT clear selected agents, so the user can run multiple similar queries.
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleAgent = (agent: AgentType) => {
    setSelectedAgents(prev => 
      prev.includes(agent) 
        ? prev.filter(a => a !== agent)
        : [...prev, agent]
    );
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  // Click outside to close agent selector
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowAgents(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full bg-background/80 backdrop-blur-xl border-t border-white/5 p-4 pb-6 z-50 transition-all duration-300">
      <div className="max-w-4xl mx-auto relative" ref={containerRef}>
        
        {/* Agent Selector Popover */}
        {showAgents && (
          <div className="absolute bottom-full left-0 right-0 mb-4 z-20 origin-bottom">
            <AgentSelector 
              selectedAgents={selectedAgents} 
              onToggleAgent={toggleAgent} 
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative flex items-end gap-3 glass-panel rounded-2xl p-2 shadow-2xl transition-all duration-300 focus-within:ring-1 focus-within:ring-indigo-500/30 focus-within:border-indigo-500/30">
          
          <button
            type="button"
            onClick={() => setShowAgents(!showAgents)}
            className={`
              p-3 rounded-xl transition-all duration-300 shrink-0 flex items-center justify-center gap-2 group
              ${showAgents || selectedAgents.length > 0 
                ? 'bg-indigo-500/20 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200'}
            `}
            title="Configure Agents"
          >
            <Icon name="Bot" size={20} className={selectedAgents.length > 0 ? "text-indigo-300" : ""} />
            {selectedAgents.length > 0 && (
              <span className="text-[10px] font-bold bg-indigo-500 text-white min-w-[18px] h-[18px] flex items-center justify-center rounded-full animate-in zoom-in">
                {selectedAgents.length}
              </span>
            )}
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={disabled ? "Orchestration in progress..." : "Describe a task for the agents..."}
            className="w-full bg-transparent text-gray-100 placeholder-zinc-500 text-sm sm:text-base py-3 px-2 min-h-[48px] max-h-[200px] resize-none outline-none disabled:opacity-50 font-light"
            rows={1}
          />
          
          <button
            type="submit"
            disabled={!input.trim() || disabled}
            className={`
              p-3 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0
              ${!input.trim() || disabled 
                ? 'bg-white/5 text-zinc-600 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95'}
            `}
          >
            {disabled ? (
              <div className="animate-spin">
                <Icon name="Loader2" size={20} />
              </div>
            ) : (
              <Icon name="Send" size={20} />
            )}
          </button>
        </form>
        
        <div className="mt-3 flex justify-between items-center px-2 opacity-60 hover:opacity-100 transition-opacity">
          <div className="flex gap-4 text-[10px] text-zinc-500 font-mono tracking-tight">
             <span className="flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>
               GEMINI 3 PRO
             </span>
             <span className="flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]"></span>
               GEMINI 2.5 FLASH
             </span>
          </div>
          <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-medium">Nexus v2.1</span>
        </div>
      </div>
    </div>
  );
};