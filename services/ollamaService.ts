
import { AgentType, OrchestrationPlan, AgentStep } from "../types";

// Configuration for the Ollama service
let currentModel = "gemma3:1b";
let baseUrl = "http://localhost:11434";

export const configureOllama = (model: string, url: string) => {
  currentModel = model;
  baseUrl = url;
};

// Helper to check if Ollama is reachable
export const checkOllamaConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${baseUrl}/api/tags`);
    return response.ok;
  } catch (e) {
    return false;
  }
};

export const orchestrateQuery = async (userQuery: string, selectedAgents: AgentType[] = []): Promise<OrchestrationPlan> => {
  let agentConstraints = "";
  if (selectedAgents.length > 0) {
    agentConstraints = `
    IMPORTANT: The user has MANUALLY SELECTED these agents: ${selectedAgents.join(', ')}.
    You MUST include them in your plan.
    `;
  }

  const systemPrompt = `
    You are an AI Orchestrator. 
    Analyze the user query: "${userQuery}"
    
    ${agentConstraints}

    Available Agents:
    - Research: Fact checking, data gathering
    - Reasoning: Logic, strategy, planning
    - Creator: Writing, designing
    - Coder: Programming
    - Analyzer: Reviewing, optimizing

    Return a JSON object with this exact structure:
    {
      "thoughtProcess": "Brief explanation of your plan",
      "steps": [
        { "agentType": "AgentName", "taskDescription": "Specific task" }
      ]
    }
  `;

  try {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: currentModel,
        messages: [{ role: 'user', content: systemPrompt }],
        format: 'json',
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const parsed = JSON.parse(data.message.content);

    const stepsWithIds: AgentStep[] = parsed.steps.map((s: any) => ({
      ...s,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending'
    }));

    return {
      thoughtProcess: parsed.thoughtProcess,
      steps: stepsWithIds
    };

  } catch (error) {
    console.error("Ollama Orchestration Error:", error);
    // Fallback for small models that might fail JSON generation
    return {
      thoughtProcess: "Local model fallback: Executing direct reasoning.",
      steps: [{
        id: 'fallback',
        agentType: selectedAgents.length > 0 ? selectedAgents[0] : AgentType.Reasoning,
        taskDescription: "Answer the user query: " + userQuery,
        status: 'pending'
      }]
    };
  }
};

export const executeAgentStep = async (
  step: AgentStep, 
  originalQuery: string, 
  context: { stepId: string; output: string }[]
): Promise<string> => {
  const contextStr = context.map((c, i) => `Step ${i + 1} Output: ${c.output}`).join("\n\n");

  const prompt = `
    Role: ${step.agentType} Agent.
    Original Query: "${originalQuery}"
    Context:
    ${contextStr}

    Your Task: ${step.taskDescription}
    
    Provide a concise and helpful response.
  `;

  try {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: currentModel,
        messages: [{ role: 'user', content: prompt }],
        stream: false
      })
    });

    if (!response.ok) throw new Error("Failed to execute agent step on Ollama");

    const data = await response.json();
    return data.message.content;
  } catch (error) {
    console.error(`Ollama Agent Error (${step.agentType}):`, error);
    throw error;
  }
};

export const synthesizeFinalAnswer = async (
  originalQuery: string, 
  steps: AgentStep[]
): Promise<string> => {
  const allOutputs = steps.map(s => `[${s.agentType}]: ${s.output}`).join("\n\n");

  const prompt = `
    As the AI Orchestrator, combine these agent outputs into a final answer for: "${originalQuery}"
    
    Agent Outputs:
    ${allOutputs}
    
    Format cleanly with Markdown.
  `;

  try {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: currentModel,
        messages: [{ role: 'user', content: prompt }],
        stream: false
      })
    });

    if (!response.ok) throw new Error("Failed to synthesize final answer on Ollama");

    const data = await response.json();
    return data.message.content;
  } catch (error) {
    return "Error generating final response from local model.";
  }
};
