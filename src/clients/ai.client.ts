import { GoogleGenAI } from '@google/genai';

export class AIClient {
  private static instance: AIClient;
  private _client: GoogleGenAI;

  private constructor() {
    this._client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  static getInstance(): AIClient {
    if (!AIClient.instance) {
      AIClient.instance = new AIClient();
    }
    return AIClient.instance;
  }

  get client(): GoogleGenAI {
    return this._client;
  }
}
