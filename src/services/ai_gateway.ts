import { CubePathError } from '../errors';
import {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatCompletionChunk,
  ModelListResponse,
  ClientOptions,
} from '../types';

const DEFAULT_AI_GATEWAY_BASE_URL = 'https://ai-gateway.cubepath.com';

export class AIGatewayService {
  private readonly baseURL: string;
  private readonly apiKey: string;

  constructor(
    _http: unknown,
    options: ClientOptions,
  ) {
    this.baseURL = (options.aiGatewayBaseURL ?? DEFAULT_AI_GATEWAY_BASE_URL).replace(/\/+$/, '');
    this.apiKey = options.apiKey;
  }

  async listModels(): Promise<ModelListResponse> {
    return this.request<ModelListResponse>('GET', '/models');
  }

  async chatCompletion(req: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    return this.request<ChatCompletionResponse>('POST', '/chat/completions', { ...req, stream: false });
  }

  async *chatCompletionStream(req: ChatCompletionRequest): AsyncGenerator<ChatCompletionChunk> {
    const url = `${this.baseURL}/chat/completions`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({ ...req, stream: true }),
    });

    if (!response.ok) {
      let errMessage = response.statusText;
      let errDetail: string | undefined;
      try {
        const errBody = await response.json() as Record<string, string>;
        errMessage = errBody.message ?? errBody.detail ?? errMessage;
        errDetail = errBody.detail;
      } catch {
        // use statusText
      }
      throw new CubePathError(response.status, errMessage, errDetail);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();

          if (!trimmed || trimmed.startsWith(':')) continue;
          if (!trimmed.startsWith('data: ')) continue;

          const data = trimmed.slice(6);

          if (data === '[DONE]') return;

          yield JSON.parse(data) as ChatCompletionChunk;
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  // Private helper to make requests against the AI Gateway base URL
  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${this.baseURL}${path}`;

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      let errMessage = response.statusText;
      let errDetail: string | undefined;
      try {
        const errBody = await response.json() as Record<string, string>;
        errMessage = errBody.message ?? errBody.detail ?? errMessage;
        errDetail = errBody.detail;
      } catch {
        // use statusText
      }
      throw new CubePathError(response.status, errMessage, errDetail);
    }

    const text = await response.text();
    if (!text) return undefined as T;
    return JSON.parse(text) as T;
  }
}
