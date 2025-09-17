declare module 'npm:groq-sdk@0.7.0' {
  export interface GroqOptions {
    apiKey?: string;
    baseURL?: string;
  }

  export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }

  export interface ChatCompletionOptions {
    messages: ChatMessage[];
    model?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    stream?: boolean;
  }

  export interface ChatCompletion {
    choices: Array<{
      message: ChatMessage;
      finishReason: string;
    }>;
  }

  export default class Groq {
    constructor(options?: GroqOptions);
    chat: {
      completions: {
        create(options: ChatCompletionOptions): Promise<ChatCompletion>;
      };
    };
  }
}