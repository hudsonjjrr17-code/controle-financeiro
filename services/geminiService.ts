import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, FinancialInsight } from "../types";

// Initialize Gemini Client (default instance)
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// MOCK DATA FOR DEMO MODE
const MOCK_INSIGHTS: FinancialInsight[] = [
  {
    title: "Modo Demonstração",
    advice: "Você está vendo dados simulados. Para usar a IA real, configure sua API Key.",
    sentiment: "neutral"
  },
  {
    title: "Economia Detectada",
    advice: "Ótimo trabalho reduzindo gastos com Lazer esta semana! Continue assim.",
    sentiment: "positive"
  },
  {
    title: "Atenção ao Transporte",
    advice: "Seus gastos com transporte subiram 15%. Considere rotas alternativas ou caronas.",
    sentiment: "warning"
  }
];

const MOCK_QUOTES = [
  "O hábito de economizar é a educação da vontade.",
  "Invista em você mesmo, rende os melhores juros.",
  "Pequenas economias formam grandes fortunas.",
  "Foco no objetivo, não no obstáculo."
];

export const generateFinancialInsights = async (transactions: Transaction[]): Promise<FinancialInsight[]> => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return [
      {
        title: "Sem Internet",
        advice: "Conecte-se à internet para receber análises atualizadas da IA.",
        sentiment: "neutral"
      }
    ];
  }

  if (!process.env.API_KEY) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return transactions.length > 0 ? MOCK_INSIGHTS : [MOCK_INSIGHTS[0]];
  }

  if (transactions.length === 0) {
    return [
      {
        title: "Comece a usar",
        advice: "Adicione algumas receitas e despesas. Assim que tiver dados, a IA analisará seus hábitos para te ajudar a economizar.",
        sentiment: "neutral"
      }
    ];
  }

  const recentTransactions = transactions.slice(0, 30).map(t => ({
    d: t.date.split('T')[0],
    t: t.type === 'income' ? 'Entrada' : 'Saída',
    v: t.amount,
    c: t.category,
    desc: t.description
  }));

  const prompt = `
    Analise este histórico financeiro recente (JSON).
    Identifique padrões de gastos, oportunidades de economia ou parabenize por bons hábitos.
    Gere exatamente 3 insights curtos.
    Dados: ${JSON.stringify(recentTransactions)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Você é um consultor financeiro pessoal experiente e amigável, focado no contexto brasileiro. Seus conselhos são práticos, diretos e motivadores. Evite jargões complexos. Foque em: cortar gastos desnecessários, criar reserva de emergência e planejamento.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Título curto e impactante (max 4 palavras)." },
              advice: { type: Type.STRING, description: "Conselho acionável e direto (max 20 palavras)." },
              sentiment: { type: Type.STRING, enum: ["positive", "warning", "neutral"], description: "Classificação do conselho." }
            },
            required: ["title", "advice", "sentiment"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return MOCK_INSIGHTS;
    
    const insights = JSON.parse(text) as FinancialInsight[];
    return insights;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return [
      {
        title: "Serviço Indisponível",
        advice: "A inteligência financeira está temporariamente fora do ar. Tente novamente mais tarde.",
        sentiment: "neutral"
      }
    ];
  }
};

export const generateMotivationalQuote = async (balance: number, savingsRate: number): Promise<string> => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return "Sua liberdade financeira depende de você.";
  }

  if (!process.env.API_KEY) {
    return MOCK_QUOTES[Math.floor(Math.random() * MOCK_QUOTES.length)];
  }

  const prompt = `
    Saldo: R$ ${balance}. Taxa de Economia: ${savingsRate.toFixed(0)}%.
    Crie uma frase curta (max 15 palavras) motivacional sobre dinheiro/sucesso/economia.
    Tom: Inspirador e confiante.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Você é um coach financeiro minimalista. Responda apenas com a frase, sem aspas.",
      }
    });
    return response.text?.trim() || "Foco no longo prazo!";
  } catch (e) {
    return "O futuro é construído com as escolhas de hoje.";
  }
};

export const generateVideo = async (imageBase64: string, mimeType: string, prompt: string, aspectRatio: '16:9' | '9:16'): Promise<string> => {
  // Check if API key is selected (Required for Veo)
  if (typeof window !== 'undefined' && (window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
          await (window as any).aistudio.openSelectKey();
      }
  }

  // Use a fresh instance with the latest key as per guidelines
  const freshAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let operation = await freshAi.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    image: {
      imageBytes: imageBase64,
      mimeType: mimeType, 
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await freshAi.operations.getVideosOperation({operation: operation});
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) {
      throw new Error("Não foi possível gerar o vídeo. Tente novamente.");
  }
  
  // Return URL with API key appended for playback
  return `${videoUri}&key=${process.env.API_KEY}`;
};