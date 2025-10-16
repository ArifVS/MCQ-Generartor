
import { GoogleGenAI, Type } from "@google/genai";
import { MCQ } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const mcqSchema = {
  type: Type.OBJECT,
  properties: {
    question: { 
      type: Type.STRING,
      description: "The question text."
    },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "An array of 4 possible answers."
    },
    correctAnswer: { 
      type: Type.STRING,
      description: "The correct answer from the options array."
    },
  },
  required: ['question', 'options', 'correctAnswer'],
};

const quizSchema = {
  type: Type.OBJECT,
  properties: {
    quiz: {
      type: Type.ARRAY,
      description: "An array of Multiple Choice Questions.",
      items: mcqSchema,
    },
  },
  required: ['quiz'],
};

export const generateMCQs = async (context: string, numQuestions: number): Promise<MCQ[]> => {
  try {
    const prompt = `Based on the following context, generate ${numQuestions} multiple-choice questions. Each question should have exactly 4 options. The context is: "${context}"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
      },
    });
    
    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);

    if (parsedData && parsedData.quiz && Array.isArray(parsedData.quiz)) {
      return parsedData.quiz as MCQ[];
    } else {
      throw new Error("Invalid response format from Gemini API.");
    }
  } catch (error) {
    console.error("Error generating MCQs:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate quiz. Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the quiz.");
  }
};
