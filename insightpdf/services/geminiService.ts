import { Type } from "@google/genai";
import { LocatorResult } from '../types';
import { getGeminiClient } from './apiClient';

export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const uploadFileToGemini = async (file: File): Promise<string> => {
  // 使用统一的客户端，确保走自定义 URL
  const ai = getGeminiClient();
  
  const response = await ai.files.upload({
    file: file,
    config: { 
      mimeType: file.type,
      displayName: file.name
    }
  });

  return response.uri;
};

export const chatWithPdf = async (
  filePart: any, 
  query: string,
  modelName: string
): Promise<LocatorResult> => {
  // 使用统一的客户端，确保走自定义 URL
  const ai = getGeminiClient();

  // Schema handles both a conversational answer and optional location data
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      answer: {
        type: Type.STRING,
        description: "The natural language answer to the user's question.",
      },
      foundLocation: {
        type: Type.BOOLEAN,
        description: "Set to true if specific visual content or text passage was located in the document to answer the query.",
      },
      pageNumber: {
        type: Type.INTEGER,
        description: "The page number where the content is found (1-based index). Set to 0 if not found.",
      },
      box2d: {
        type: Type.ARRAY,
        items: { type: Type.INTEGER },
        description: "The bounding box of the specific text/visual element. Format: [ymin, xmin, ymax, xmax] where the scale is 0 to 1000. 0,0 is top-left.",
      },
      snippet: {
        type: Type.STRING,
        description: "The specific text or short description of the visual element found.",
      },
      reasoning: {
        type: Type.STRING,
        description: "Brief explanation of why this location was chosen.",
      }
    },
    required: ["answer", "foundLocation"],
  };

  const prompt = `
    You are an intelligent PDF assistant. You can answer questions based on the document AND locate specific content visually.
    
    User Query: "${query}"

    Instructions:
    1. First, analyze the document to answer the user's question. Put the answer in the 'answer' field. **IMPORTANT: ALWAYS Answer in Simplified Chinese (简体中文).**
    2. If the user is asking to find something, or if the answer refers to a specific diagram, table, or paragraph, provide the location details.
    3. If providing location:
       - Identify the most relevant page.
       - Identify the specific bounding box coordinates (0-1000 scale) [ymin, xmin, ymax, xmax].
       - Set 'foundLocation' to true.
    4. If the question is general (e.g., "Summarize the file") and no specific location is needed, set 'foundLocation' to false and leave location fields empty or zero.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          filePart,
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini.");
    }

    const result = JSON.parse(text) as any;
    
    // Clean up result to match interface
    return {
      answer: result.answer,
      pageNumber: result.foundLocation ? result.pageNumber : undefined,
      box2d: result.foundLocation ? result.box2d : undefined,
      snippet: result.foundLocation ? result.snippet : undefined,
      reasoning: result.foundLocation ? result.reasoning : undefined,
    };

  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
