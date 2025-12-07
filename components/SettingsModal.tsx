
import React, { useEffect, useState } from 'react';
import { Icon } from './Icon';
import { AppSettings, AIProvider } from '../types';
import { checkOllamaConnection } from '../services/ollamaService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error' | null>(null);

  useEffect(() => {
    setLocalSettings(settings);
    setConnectionStatus(null);
  }, [settings, isOpen]);

  const handleCheckConnection = async () => {
    setConnectionStatus('checking');
    const isConnected = await checkOllamaConnection();
    setConnectionStatus(isConnected ? 'connected' : 'error');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Icon name="Settings" className="text-zinc-400" />
            System Configuration
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-zinc-400 transition-colors">
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Provider Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-400 uppercase tracking-wider">AI Execution Engine</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLocalSettings({ ...localSettings, provider: 'gemini' })}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  localSettings.provider === 'gemini' 
                    ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300' 
                    : 'bg-zinc-800/50 border-white/5 text-zinc-500 hover:bg-zinc-800'
                }`}
              >
                <Icon name="Cloud" size={24} />
                <span className="font-semibold text-sm">Gemini Cloud</span>
              </button>
              <button
                onClick={() => setLocalSettings({ ...localSettings, provider: 'ollama' })}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  localSettings.provider === 'ollama' 
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300' 
                    : 'bg-zinc-800/50 border-white/5 text-zinc-500 hover:bg-zinc-800'
                }`}
              >
                <Icon name="HardDrive" size={24} />
                <span className="font-semibold text-sm">Ollama Local</span>
              </button>
            </div>
          </div>

          {/* Ollama Specific Settings */}
          {localSettings.provider === 'ollama' && (
            <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5 space-y-4 animate-in slide-in-from-top-2">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Model Name</label>
                <input 
                  type="text" 
                  value={localSettings.ollamaModel}
                  onChange={(e) => setLocalSettings({...localSettings, ollamaModel: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500/50 outline-none"
                  placeholder="e.g. gemma3:1b"
                />
              </div>

              <div>
                 <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-medium text-zinc-500">Base URL</label>
                    {connectionStatus === 'connected' && <span className="text-[10px] text-emerald-400 flex items-center gap-1"><Icon name="Check" size={10} /> Connected</span>}
                    {connectionStatus === 'error' && <span className="text-[10px] text-red-400 flex items-center gap-1"><Icon name="AlertTriangle" size={10} /> Connection Failed</span>}
                 </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={localSettings.ollamaBaseUrl}
                    onChange={(e) => setLocalSettings({...localSettings, ollamaBaseUrl: e.target.value})}
                    className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500/50 outline-none"
                    placeholder="http://localhost:11434"
                  />
                  <button 
                    onClick={handleCheckConnection}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400 transition-colors"
                    title="Test Connection"
                  >
                    <Icon name={connectionStatus === 'checking' ? 'Loader2' : 'Wifi'} className={connectionStatus === 'checking' ? 'animate-spin' : ''} size={16} />
                  </button>
                </div>
                <p className="text-[10px] text-zinc-600 mt-2 leading-tight">
                  Note: Run <code className="text-zinc-400">ollama serve</code> with <code className="text-zinc-400">OLLAMA_ORIGINS="*"</code> to allow browser access.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => { onSave(localSettings); onClose(); }}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
          >
            Save Configuration
          </button>
        </div>

      </div>
    </div>
  );
};
