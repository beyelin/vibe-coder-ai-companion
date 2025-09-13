import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
import type { SmartReplyRequest, SmartReplyResponse, WorkplaceReplyRequest, DailyQuote, PhraseItem } from '../types';

const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  console.error('错误: 未找到 VITE_API_KEY 环境变量');
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const codeGenerationModel = 'gemini-2.5-flash';
const companionModel = 'gemini-2.5-flash';
const wallpaperModel = 'gemini-2.5-flash-image-preview';
const humorAssistantModel = 'gemini-2.5-flash';


interface CodeGenerationResult {
  explanation: string;
  code: string;
}

export async function generateCode(prompt: string): Promise<CodeGenerationResult> {
  try {
    const fullPrompt = `
      You are an expert web developer creating a single-file web application.
      The user wants to build: "${prompt}".
      Your task is to generate a single, complete, and runnable HTML file. This file must not require any external files or build steps.

      Requirements:
      1.  It must be a complete HTML document, starting with <!DOCTYPE html>.
      2.  It MUST include CDN links for React 18, ReactDOM 18, Babel Standalone, and Tailwind CSS v3.
      3.  All JavaScript code, including the React component, must be inside a single <script type="text/babel"> tag.
      4.  The React component should be rendered into a div with id="root".
      5.  The HTML body should have a dark background (e.g., bg-gray-800) and light text for good visibility.

      Respond with a JSON object that strictly adheres to the provided schema. Do not include any markdown formatting (like \`\`\`json) around the JSON object.
    `;
    
    const response : GenerateContentResponse = await ai.models.generateContent({
      model: codeGenerationModel,
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: {
              type: Type.STRING,
              description: "A brief, user-friendly description in Chinese of the component you built.",
            },
            code: {
              type: Type.STRING,
              description: "The full HTML content as a string, including <!DOCTYPE html> and all required CDN script tags.",
            }
          },
          required: ["explanation", "code"],
        },
      },
    });

    const jsonString = response.text;
    const result = JSON.parse(jsonString);
    return result as CodeGenerationResult;

  } catch (error) {
    console.error("Error generating code:", error);
    return {
      explanation: "抱歉，生成代码时遇到了一个错误。请检查您的提示或稍后再试。",
      code: `<html><body><h1>Error</h1><p>${(error as Error).message}</p></body></html>`,
    };
  }
}

export async function chatWithCompanion(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: companionModel,
      contents: prompt,
      config: {
        systemInstruction: "You are a friendly, cheerful, and helpful AI companion named 'Vibe Coder AI Companion'. Your personality is lively and you love using emojis. Your goal is to provide encouragement and answer non-coding questions to make the user's programming session more enjoyable. You are speaking Chinese. Keep your responses concise and brief, preferably within 1-2 sentences. 回复要简洁明了，最好控制在1-2句话内。",
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error chatting with companion:", error);
    return "哎呀，我好像短路了... 😅 请稍后再试吧！";
  }
}

export async function generateWallpaper(prompt: string): Promise<string> {
  // A tiny 1x1 black pixel PNG to use as a base for the 'edit'
  const base64ImageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

  try {
    const response = await ai.models.generateContent({
      model: wallpaperModel,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: 'image/png',
            },
          },
          {
            text: `Completely replace this black image. Create a new image that is a beautiful, abstract, dark-themed wallpaper suitable for a developer's desktop, inspired by the theme: "${prompt}". The wallpaper should be visually pleasing but not distracting.`,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        // Return a data URL for easy use in CSS/img src
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("API did not return an image.");
  } catch (error) {
    console.error("Error generating wallpaper:", error);
    throw new Error("Failed to generate wallpaper. Please try again.");
  }
}

// 情商助手相关服务方法
export async function generateSmartReply(request: SmartReplyRequest): Promise<SmartReplyResponse> {
  try {
    const { input, context = '', style = 'humorous' } = request;
    
    const stylePrompts = {
      humorous: '幽默风趣',
      witty: '机智巧妙',
      diplomatic: '外交得体'
    };
    
    const prompt = `
      你是一个高情商的回应助手。用户遇到了这样的话语："${input}"
      ${context ? `场景背景：${context}` : ''}
      
      请生成2-3个${stylePrompts[style]}的高情商回应，要求：
      1. 既能化解尴尬，又能展现幽默感
      2. 语言自然，不做作
      3. 适合中文语境
      4. 每个回应控制在30字以内
      
      请以JSON格式返回，包含responses数组和confidence分数。
    `;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: humorAssistantModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            responses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-3个高情商幽默回应"
            },
            confidence: {
              type: Type.NUMBER,
              description: "AI生成的置信度分数(0-1)"
            }
          },
          required: ["responses", "confidence"]
        }
      }
    });
    
    const result = JSON.parse(response.text);
    return {
      success: true,
      responses: result.responses,
      confidence: result.confidence
    };
  } catch (error) {
    console.error("Error generating smart reply:", error);
    return {
      success: false,
      responses: ["哎呀，我的大脑短路了，让我缓缓... 😅"],
      confidence: 0
    };
  }
}

export async function generateWorkplaceReply(request: WorkplaceReplyRequest): Promise<SmartReplyResponse> {
  try {
    const { input, scenario, tone = 'diplomatic' } = request;
    
    const scenarioPrompts = {
      meeting: '会议场景',
      deadline: '截止日期压力',
      feedback: '接受反馈',
      request: '处理请求'
    };
    
    const tonePrompts = {
      diplomatic: '外交得体',
      humorous: '幽默化解',
      professional: '专业严谨'
    };
    
    const prompt = `
      你是一个职场沟通专家。在${scenarioPrompts[scenario]}中，遇到了这样的情况："${input}"
      
      请生成2-3个${tonePrompts[tone]}的职场回应，要求：
      1. 既委婉又不失幽默感
      2. 符合职场礼仪和文化
      3. 能够有效化解潜在冲突
      4. 每个回应控制在50字以内
      
      请以JSON格式返回，包含responses数组和confidence分数。
    `;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: humorAssistantModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            responses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-3个职场委婉回应"
            },
            confidence: {
              type: Type.NUMBER,
              description: "AI生成的置信度分数(0-1)"
            }
          },
          required: ["responses", "confidence"]
        }
      }
    });
    
    const result = JSON.parse(response.text);
    return {
      success: true,
      responses: result.responses,
      confidence: result.confidence
    };
  } catch (error) {
    console.error("Error generating workplace reply:", error);
    return {
      success: false,
      responses: ["让我想想怎么优雅地回应这个问题... 🤔"],
      confidence: 0
    };
  }
}

export async function generateDailyQuote(): Promise<DailyQuote> {
  try {
    const prompt = `
      生成一条今日的高情商幽默语录，要求：
      1. 既有哲理又有幽默感
      2. 适合在社交场合分享
      3. 语言简洁有力，控制在50字以内
      4. 体现高情商的沟通智慧
      
      请以JSON格式返回，包含content(内容)、category(分类)。
    `;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: humorAssistantModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            content: {
              type: Type.STRING,
              description: "语录内容"
            },
            category: {
              type: Type.STRING,
              description: "语录分类"
            }
          },
          required: ["content", "category"]
        }
      }
    });
    
    const result = JSON.parse(response.text);
    return {
      id: Date.now().toString(),
      content: result.content,
      category: result.category,
      date: new Date().toISOString().split('T')[0]
    };
  } catch (error) {
    console.error("Error generating daily quote:", error);
    return {
      id: Date.now().toString(),
      content: "今天的智慧：保持幽默感，是高情商的最佳体现。😊",
      category: "生活智慧",
      date: new Date().toISOString().split('T')[0]
    };
  }
}

// 预设话术库数据
export function getPhraseLibrary(): PhraseItem[] {
  return [
    {
      id: '1',
      category: '赞美型',
      content: '你说得比KPI还动听。',
      tags: ['职场', '赞美'],
      usageCount: 0
    },
    {
      id: '2',
      category: '打圆场',
      content: '哈哈，这话题我们下次喝茶时再聊。',
      tags: ['社交', '转移话题'],
      usageCount: 0
    },
    {
      id: '3',
      category: '自黑型',
      content: '别说了，我的bug比你的发量还多。',
      tags: ['程序员', '自嘲'],
      usageCount: 0
    },
    {
      id: '4',
      category: '赞美型',
      content: '您这想法，比我的代码还优雅。',
      tags: ['技术', '赞美'],
      usageCount: 0
    },
    {
      id: '5',
      category: '打圆场',
      content: '这个问题很有深度，值得我们深入探讨。',
      tags: ['会议', '缓解'],
      usageCount: 0
    },
    {
      id: '6',
      category: '委婉拒绝',
      content: '这个想法很棒，不过我们先把手头的事情搞定吧。',
      tags: ['拒绝', '委婉'],
      usageCount: 0
    },
    {
      id: '7',
      category: '幽默化解',
      content: '没事，我们都是在学习的路上，只是有人走得快，有人走得慢。',
      tags: ['安慰', '幽默'],
      usageCount: 0
    },
    {
      id: '8',
      category: '自黑型',
      content: '我这人就是这样，智商不够，情商来凑。',
      tags: ['自嘲', '谦虚'],
      usageCount: 0
    }
  ];
}