import { ClientOptions } from './types';
import { CubePathError } from './errors';

const DEFAULT_BASE_URL = 'https://api.cubepath.com';
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_WAIT_MIN = 1000;
const DEFAULT_RETRY_WAIT_MAX = 30000;
const DEFAULT_RATE_LIMIT = 10;
const DEFAULT_TIMEOUT = 30000;
const SDK_VERSION = '0.1.0';

export class HttpClient {
  private readonly apiKey: string;
  private readonly baseURL: string;
  private readonly userAgent: string;
  private readonly maxRetries: number;
  private readonly retryWaitMin: number;
  private readonly retryWaitMax: number;
  private readonly timeout: number;

  private readonly rateLimitInterval: number;
  private lastRequestTime = 0;
  private requestQueue: Promise<void> = Promise.resolve();

  constructor(options: ClientOptions) {
    this.apiKey = options.apiKey;
    this.baseURL = (options.baseURL ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
    this.userAgent = options.userAgent ?? `cubepath-node-sdk/${SDK_VERSION}`;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.retryWaitMin = options.retryWaitMin ?? DEFAULT_RETRY_WAIT_MIN;
    this.retryWaitMax = options.retryWaitMax ?? DEFAULT_RETRY_WAIT_MAX;
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT;
    this.rateLimitInterval = 1000 / (options.rateLimit ?? DEFAULT_RATE_LIMIT);
  }

  private async throttle(): Promise<void> {
    this.requestQueue = this.requestQueue.then(async () => {
      const now = Date.now();
      const elapsed = now - this.lastRequestTime;
      if (elapsed < this.rateLimitInterval) {
        await new Promise((resolve) => setTimeout(resolve, this.rateLimitInterval - elapsed));
      }
      this.lastRequestTime = Date.now();
    });
    return this.requestQueue;
  }

  private calculateBackoff(attempt: number): number {
    const base = Math.min(this.retryWaitMin * Math.pow(2, attempt), this.retryWaitMax);
    const jitter = base * 0.5 * Math.random();
    return base + jitter;
  }

  async request<T>(method: string, path: string, body?: unknown, query?: Record<string, string>): Promise<T> {
    await this.throttle();

    let url = `${this.baseURL}${path}`;
    if (query) {
      const params = new URLSearchParams(query);
      url += `?${params.toString()}`;
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'User-Agent': this.userAgent,
      'Accept': 'application/json',
    };
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await fetch(url, {
          method,
          headers,
          body: body !== undefined ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const text = await response.text();
          if (!text) return undefined as T;
          return JSON.parse(text) as T;
        }

        const shouldRetry = (response.status === 429 || response.status >= 500) && attempt < this.maxRetries;
        if (shouldRetry) {
          await new Promise((resolve) => setTimeout(resolve, this.calculateBackoff(attempt)));
          continue;
        }

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
      } catch (err) {
        clearTimeout(timeoutId);
        if (err instanceof CubePathError) throw err;

        if (attempt < this.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, this.calculateBackoff(attempt)));
          continue;
        }
        throw err;
      }
    }

    throw new Error('Max retries exceeded');
  }

  get<T>(path: string, query?: Record<string, string>): Promise<T> {
    return this.request<T>('GET', path, undefined, query);
  }

  post<T>(path: string, body?: unknown, query?: Record<string, string>): Promise<T> {
    return this.request<T>('POST', path, body, query);
  }

  put<T>(path: string, body?: unknown, query?: Record<string, string>): Promise<T> {
    return this.request<T>('PUT', path, body, query);
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PATCH', path, body);
  }

  delete<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('DELETE', path, body);
  }
}
