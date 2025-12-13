import React from 'react';
import type { OrchestrationPlan} from '../types';
import { AgentCard } from './AgentCard';
import { Icon } from './Icon';
import { MarkdownRenderer } from './MarkdownRenderer';

interface PlanVisualizerProps {
  plan: OrchestrationPlan;
  currentStepId?: string;
  onToggleStep: (stepId: string) => void;
}

export const PlanVisualizer: React.FC<PlanVisualizerProps> = ({ plan, onToggleStep }) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Thought Process Section */}
      <div className="bg-surface/30 rounded-xl p-4 border border-indigo-500/20 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50"></div>
        <div className="flex items-center gap-2 mb-2 text-indigo-400">
          <Icon name="BrainCircuit" size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">Orchestrator Thought Process</span>
        </div>
        <div className="text-sm text-zinc-300 leading-relaxed italic opacity-90">
          <MarkdownRenderer content={plan.thoughtProcess} />
        </div>
      </div>

      {/* Steps List */}
      <div className="relative">
         {/* Vertical Connector Line */}
         <div className="absolute left-[35px] top-4 bottom-4 w-0.5 bg-white/5 -z-10" />

        {plan.steps.map((step, index) => {
          const isCompleted = step.status === 'completed';
          const isActive = step.status === 'working';
          
          return (
            <AgentCard
              key={step.id}
              step={step}
              index={index}
              isActive={isActive}
              isCompleted={isCompleted}
              onToggleExpand={() => onToggleStep(step.id)}
            />
          );
        })}
      </div>
    </div>
  );
};
