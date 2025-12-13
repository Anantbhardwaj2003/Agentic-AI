import React from 'react';
import { Icon } from './Icon';
import type { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (session: ChatSession) => void;
  onNewChat: () => void;
  onDeleteSession: (e: React.MouseEvent, id: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onNewChat,
  onDeleteSession,
  isOpen,
  toggleSidebar
}) => {
  
  // Format time relative (e.g., "5 mins ago")
  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 3) return `${hours}h ago`;
    return 'Expiring...';
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
      />

      {/* Sidebar Container */}
      <div className={`
        fixed top-0 left-0 h-full w-72 bg-[#09090b] border-r border-white/5 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:shrink-0 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2 text-zinc-100 font-bold tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
               <Icon name="Layout" size={16} className="text-indigo-400" />
            </div>
            <span>History</span>
          </div>
          <button 
            onClick={onNewChat}
            className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-white/5"
            title="Start New Chat"
          >
            <Icon name="Plus" size={18} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
           <div className="px-2 py-1.5 mb-2">
             <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <Icon name="Folder" size={12} />
                Previous Chats
             </h3>
             <p className="text-[10px] text-zinc-600 mt-1">
               Auto-deletes in 3 hours
             </p>
           </div>

           {sessions.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-40 text-zinc-600 gap-2">
               <Icon name="Archive" size={24} className="opacity-20" />
               <span className="text-xs">No saved history</span>
             </div>
           ) : (
             sessions.map(session => (
               <div 
                 key={session.id}
                 onClick={() => onSelectSession(session)}
                 className={`
                   group relative p-3 rounded-xl cursor-pointer border transition-all duration-200
                   ${currentSessionId === session.id 
                     ? 'bg-indigo-500/10 border-indigo-500/30 text-zinc-100' 
                     : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/5 text-zinc-400 hover:text-zinc-200'}
                 `}
               >
                 <div className="flex justify-between items-start mb-1">
                   <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-400">
                     <span className={`w-1.5 h-1.5 rounded-full ${currentSessionId === session.id ? 'bg-indigo-400 animate-pulse' : 'bg-zinc-600'}`}></span>
                     {formatTime(session.timestamp)}
                   </div>
                   <button 
                     onClick={(e) => onDeleteSession(e, session.id)}
                     className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition-all"
                   >
                     <Icon name="Trash2" size={12} />
                   </button>
                 </div>
                 <p className="text-sm line-clamp-2 leading-relaxed font-light">
                   {session.query}
                 </p>
               </div>
             ))
           )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-white/5 text-[10px] text-zinc-600 font-mono text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
             System Operational
          </div>
          Nexus Orchestrator v2.1
        </div>
      </div>
    </>
  );
};
