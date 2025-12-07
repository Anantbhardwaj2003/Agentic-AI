import { GoogleGenAI, Type } from "@google/genai";
import { AgentType, OrchestrationPlan, AgentStep } from "../types";

// Helper to ensure we have an API key
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Robust retry wrapper with exponential backoff
const withRetry = async <T>(
  operation: () => Promise<T>, 
  retries = 3, 
  baseDelay = 2000
): Promise<T> => {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      const msg = error?.toString()?.toLowerCase() || "";
      // Check for rate limits (429) or server errors (503)
      const isTransient = msg.includes("429") || msg.includes("quota") || msg.includes("503") || msg.includes("exhausted");
      
      if (isTransient && i < retries - 1) {
        const waitTime = baseDelay * Math.pow(2, i); // Exponential backoff: 2000, 4000, 8000 ms
        console.warn(`Attempt ${i + 1} failed with transient error. Retrying in ${waitTime}ms...`);
        await delay(waitTime);
        continue;
      }
      throw error; // Throw immediately if not transient or out of retries
    }
  }
  throw lastError;
};

// Helper to check for quota errors specifically
const checkForQuotaError = (error: any) => {
  const msg = error?.toString()?.toLowerCase() || "";
  if (msg.includes("429") || msg.includes("quota") || msg.includes("exhausted")) {
    throw new Error("QUOTA_EXCEEDED");
  }
};

export const orchestrateQuery = async (userQuery: string, selectedAgents: AgentType[] = []): Promise<OrchestrationPlan> => {
  const ai = getAiClient();
  
  let agentConstraints = "";
  if (selectedAgents.length > 0) {
    agentConstraints = `
    CRITICAL INSTRUCTION: The user has MANUALLY SELECTED the following agents: ${selectedAgents.join(', ')}.
    1. You MUST build a plan that prioritizes these agents.
    2. Start the plan with one of the selected agents if possible.
    3. You may add other agents ONLY if the selected ones cannot technically fulfill a specific sub-task.
    `;
  } else {
    agentConstraints = "The user has not selected specific agents. You have full autonomy to select the best agents for the job.";
  }

  const systemInstruction = `
    You are an Agentic AI Orchestrator. Your job is to analyze the user's query and decide how to solve it using a dynamic set of specialized AI agents.
    
    Available Agent Types:
    - Research: Finds facts, verifies information.
    - Reasoning: Handles logic, planning, strategy.
    - Creator: Writes content, designs, imagines.
    - Coder: Writes and fixes code.
    - Analyzer: Reviews, critiques, or improves work.

    ${agentConstraints}

    Rules:
    1. Break the problem into logical steps.
    2. Assign the most suitable agent for each step.
    3. If the query is simple, use a single agent.
    4. Provide a "thoughtProcess" explaining why you chose this flow.
    5. Return strictly valid JSON matching the schema.
  `;

  // Define the operation
  const callOrchestrator = async () => {
    return await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // High intelligence for planning
      contents: userQuery,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            thoughtProcess: { type: Type.STRING },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  agentType: { 
                    type: Type.STRING, 
                    enum: [
                      AgentType.Research, 
                      AgentType.Reasoning, 
                      AgentType.Creator, 
                      AgentType.Coder, 
                      AgentType.Analyzer
                    ] 
                  },
                  taskDescription: { type: Type.STRING }
                },
                required: ["agentType", "taskDescription"]
              }
            }
          },
          required: ["thoughtProcess", "steps"]
        }
      }
    });
  };

  try {
    // Attempt with retry
    const response = await withRetry(callOrchestrator, 3, 2000);

    const text = response.text;
    if (!text) throw new Error("No response from Orchestrator");
    
    const parsed = JSON.parse(text);
    
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
    console.error("Orchestration Error:", error);
    checkForQuotaError(error);

    // Fallback plan if JSON fails (but not if quota exceeded)
    return {
      thoughtProcess: "I encountered an error planning detailed steps, so I will attempt to answer directly with a reasoning agent.",
      steps: [{
        id: 'fallback',
        agentType: selectedAgents.length > 0 ? selectedAgents[0] : AgentType.Reasoning,
        taskDescription: "Answer the user's query directly: " + userQuery,
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
  const ai = getAiClient();

  const contextStr = context.map((c, i) => `Step ${i + 1} Output: ${c.output}`).join("\n\n");

  const agentPersonas: Record<AgentType, string> = {
    [AgentType.Research]: "You are a Research Agent. Find facts, verify info, and provide accurate data.",
    [AgentType.Reasoning]: "You are a Reasoning Agent. Focus on logic, strategy, and step-by-step deduction.",
    [AgentType.Creator]: "You are a Creator Agent. Write creative content, stories, poems, or design concepts.",
    [AgentType.Coder]: "You are a Coder Agent. Write clean, efficient code. Output code in markdown blocks.",
    [AgentType.Analyzer]: "You are an Analyzer Agent. Critique, improve, or check the quality of previous outputs.",
    [AgentType.Orchestrator]: "You are the Orchestrator."
  };

  const systemInstruction = `
    ${agentPersonas[step.agentType]}
    You are part of a larger workflow solving this user query: "${originalQuery}"
    Your specific task is: ${step.taskDescription}
    Use the Context provided from previous steps to inform your answer.
  `;

  const callAgent = async () => {
    return await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Fast and capable
      contents: `Context from previous agents:\n${contextStr}\n\nTask: ${step.taskDescription}`,
      config: { systemInstruction }
    });
  };

  try {
    const response = await withRetry(callAgent, 3, 2000);
    return response.text || "No output generated.";
  } catch (error) {
    console.error(`Error in agent ${step.agentType}:`, error);
    checkForQuotaError(error);
    throw error;
  }
};

export const synthesizeFinalAnswer = async (
  originalQuery: string, 
  steps: AgentStep[]
): Promise<string> => {
  const ai = getAiClient();
  
  const allOutputs = steps.map(s => `[${s.agentType}]: ${s.output}`).join("\n\n");

  const systemInstruction = `
    You are the Agentic AI Orchestrator. 
    Synthesize the findings from your agents into a final, clean answer for the user.
    Format nicely with Markdown.
  `;

  const callSynthesizer = async () => {
    return await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Flash is sufficient for synthesis and cheaper
      contents: `Original Query: ${originalQuery}\n\nAgent Outputs:\n${allOutputs}`,
      config: { systemInstruction }
    });
  };

  try {
    const response = await withRetry(callSynthesizer, 3, 2000);
    return response.text || "Could not synthesize final answer.";
  } catch (error) {
    checkForQuotaError(error);
    return "Error synthesizing final answer. Please check individual agent outputs.";
  }
};
