import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not defined. AI features will not work.");
}

export const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export async function generateCompetitorAnalysis(competitor: any, promptType: string) {
  const prompt = `Analise o concorrente ${competitor.name}. 
    Website: ${competitor.website}
    Social: ${competitor.social_media}
    Posicionamento atual: ${competitor.positioning}
    Ofertas: ${competitor.offerings}
    
    Tipo de análise solicitada: ${promptType}
    Por favor, forneça insights estratégicos detalhados em formato markdown.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  return response.text;
}

export async function generateGrowthStrategy(goal: string, context: string) {
  const prompt = `Crie uma estratégia de crescimento baseada no seguinte objetivo: ${goal}.
    Contexto adicional: ${context}
    
    Forneça um plano detalhado com passos acionáveis, sugestões de conteúdo e posicionamento em formato markdown.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  return response.text;
}
