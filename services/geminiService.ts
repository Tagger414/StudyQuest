
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getMotivationalMessage = async (mode: string, minutes: number, points: number): Promise<string> => {
  if (!API_KEY) {
    return `Great work! You completed a ${minutes}-minute session. Keep it up!`;
  }
  
  try {
    const systemInstruction = "You are a motivational study coach. Respond with short, personalized messages.";
    const userPrompt = `The user has completed a ${mode} session lasting ${minutes} minutes and now has ${points} total points. Give one friendly motivational message, no more than 25 words.`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userPrompt,
        config: {
            systemInstruction: systemInstruction,
        },
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error fetching motivational message:", error);
    throw new Error("Failed to get a motivational message from the AI.");
  }
};
