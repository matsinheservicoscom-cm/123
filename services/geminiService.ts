
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export const geminiService = {
  async generateContentMetadata(topic: string) {
    if (!apiKey) return null;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Gere um título e uma descrição curta e atraente para um vídeo/notícia sobre: ${topic}. Idioma: Português.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["title", "description"]
          }
        }
      });
      const text = response.text;
      return text ? JSON.parse(text.trim()) : null;
    } catch (error) {
      console.error("Gemini Error:", error);
      return null;
    }
  },

  async syncFacebookContent(pageUrl: string) {
    if (!apiKey) return null;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Atue como um integrador de conteúdo para a TxopelaTv. 
        Acesse e analise as publicações mais recentes da página do Facebook: ${pageUrl}.
        Com base no que encontrar, gere uma lista de 6 novos itens de conteúdo (3 vídeos e 3 notícias) que seriam relevantes para o público moçambicano.
        
        Distribua os itens entre as categorias: Notícias, Esportes, Programas, Filmes e Estilo de Vida.
        
        Retorne um JSON estruturado com arrays de 'videos' e 'news'.
        - Cada vídeo precisa de: id (string única), title, description, category (deve ser um dos valores: 'Notícias', 'Esportes', 'Programas', 'Filmes', 'Estilo de Vida'), author (nome da página ou autor), thumbnail (URL de imagem realística), url (use 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' como placeholder se não encontrar vídeo real).
        - Cada notícia precisa de: id (string única), title, content, author, image (URL de imagem realística), date (formato YYYY-MM-DD).`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              videos: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    category: { type: Type.STRING },
                    author: { type: Type.STRING },
                    thumbnail: { type: Type.STRING },
                    url: { type: Type.STRING }
                  },
                  required: ["id", "title", "description", "category", "author", "thumbnail", "url"]
                }
              },
              news: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    content: { type: Type.STRING },
                    author: { type: Type.STRING },
                    image: { type: Type.STRING },
                    date: { type: Type.STRING }
                  },
                  required: ["id", "title", "content", "author", "image", "date"]
                }
              }
            },
            required: ["videos", "news"]
          }
        }
      });
      const text = response.text;
      return text ? JSON.parse(text.trim()) : null;
    } catch (error) {
      console.error("Sync Error:", error);
      return null;
    }
  },

  async checkFacebookLiveStatus(pageUrl: string) {
    if (!apiKey) return null;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Verifique se a página do Facebook ${pageUrl} está transmitindo ao vivo (LIVE) agora. 
        Se estiver, extraia o título da transmissão e a URL do vídeo ao vivo.
        Retorne um JSON com: isLive (boolean), currentProgram (string), streamUrl (string).
        Se não estiver ao vivo, retorne isLive: false.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isLive: { type: Type.BOOLEAN },
              currentProgram: { type: Type.STRING },
              streamUrl: { type: Type.STRING }
            },
            required: ["isLive"]
          }
        }
      });
      const text = response.text;
      return text ? JSON.parse(text.trim()) : null;
    } catch (error) {
      console.error("Live Check Error:", error);
      return null;
    }
  }
};
