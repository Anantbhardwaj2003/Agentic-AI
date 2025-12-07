
export enum AgentType {
  Research = 'Research',
  Reasoning = 'Reasoning',
  Creator = 'Creator',
  Coder = 'Coder',
  Analyzer = 'Analyzer',
  Orchestrator = 'Orchestrator'
}

export interface AgentStep {
  id: string;
  agentType: AgentType;
  taskDescription: string;
  status: 'pending' | 'working' | 'completed' | 'failed';
  output?: string;
  isExpanded?: boolean;
}

export interface OrchestrationPlan {
  thoughtProcess: string;
  steps: AgentStep[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  plan?: OrchestrationPlan;
  isProcessing?: boolean;
}

export interface AgentConfig {
  name: string;
  description: string;
  icon: string;
  color: string;
}

export type AIProvider = 'gemini' | 'ollama';

export interface AppSettings {
  provider: AIProvider;
  ollamaModel: string;
  ollamaBaseUrl: string;
}

export const AGENT_CONFIGS: Record<AgentType, AgentConfig> = {
  [AgentType.Orchestrator]: {
    name: 'Orchestrator',
    description: 'Analyzes queries and coordinates the agent team.',
    icon: 'BrainCircuit',
    color: 'text-indigo-400'
  },
  [AgentType.Research]: {
    name: 'Research Agent',
    description: 'Finds facts, verifies information, and gathers data.',
    icon: 'Search',
    color: 'text-blue-400'
  },
  [AgentType.Reasoning]: {
    name: 'Reasoning Agent',
    description: 'Handles logic, planning, strategy, and complex deduction.',
    icon: 'Cpu',
    color: 'text-purple-400'
  },
  [AgentType.Creator]: {
    name: 'Creator Agent',
    description: 'Writes creative content, designs, and imagines concepts.',
    icon: 'PenTool',
    color: 'text-pink-400'
  },
  [AgentType.Coder]: {
    name: 'Coder Agent',
    description: 'Writes, reviews, and fixes code snippets.',
    icon: 'Terminal',
    color: 'text-emerald-400'
  },
  [AgentType.Analyzer]: {
    name: 'Analyzer Agent',
    description: 'Reviews, critiques, optimizes, and improves work.',
    icon: 'Microscope',
    color: 'text-amber-400'
  }
};
