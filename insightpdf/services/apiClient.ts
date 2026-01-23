import { GoogleGenAI } from "@google/genai";
import { storage } from './storageService';

/**
 * 获取配置好的 Gemini API 客户端实例。
 * 
 * 这个函数专门负责流量转发的逻辑：
 * 1. 检查是否启用了自定义配置。
 * 2. 如果配置了 Base URL，将所有 API 请求（包括生成内容和文件上传）转发到该 URL。
 * 3. 优先使用自定义 API Key。
 */
export const getGeminiClient = (): GoogleGenAI => {
  const customConfig = storage.getCustomConfig();
  
  // 优先使用自定义 API Key，否则使用环境变量中的 Key
  const apiKey = (customConfig.enabled && customConfig.apiKey) 
    ? customConfig.apiKey 
    : process.env.API_KEY;

  if (!apiKey) {
    throw new Error("未检测到 API Key。请在设置中输入 Key 或检查环境变量配置。");
  }

  const options: { apiKey: string; baseUrl?: string } = { apiKey };

  // 关键逻辑：如果存在自定义 Base URL，设置它以转发流量
  if (customConfig.enabled && customConfig.baseUrl) {
    options.baseUrl = customConfig.baseUrl;
  }

  return new GoogleGenAI(options);
};
