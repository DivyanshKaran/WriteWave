import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

type RetryConfig = {
  retries: number;
  retryDelayMs: number;
  retryOnStatus: number[];
};

export type ServiceError = {
  ok: false;
  status: number;
  code: string;
  message: string;
  details?: any;
};

const DEFAULT_TIMEOUT_MS = parseInt(process.env.HTTP_CLIENT_TIMEOUT_MS || '10000');
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  retries: parseInt(process.env.HTTP_CLIENT_RETRIES || '3'),
  retryDelayMs: parseInt(process.env.HTTP_CLIENT_RETRY_DELAY_MS || '500'),
  retryOnStatus: [408, 429, 500, 502, 503, 504],
};

function createAxiosInstance(baseURL?: string, timeoutMs: number = DEFAULT_TIMEOUT_MS): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout: timeoutMs,
    headers: {
      'Content-Type': 'application/json',
    },
    validateStatus: (status: number) => status >= 200 && status < 500,
  });

  instance.interceptors.request.use((config: any) => {
    // Propagate correlation ID from incoming request or generate new one
    const correlationId = (config.headers?.['x-request-id'] as string) || 
                         (config.headers?.['X-Request-ID'] as string) ||
                         generateTraceId();
    const traceId = (config.headers?.['x-trace-id'] as string) || correlationId;
    
    if (!config.headers) {
      config.headers = {};
    }
    config.headers['X-Request-ID'] = correlationId; // Standard correlation ID header
    config.headers['x-trace-id'] = traceId; // Also include trace ID for backward compatibility
    config.headers['x-service-name'] = process.env.SERVICE_NAME || 'unknown-service';
    return config;
  });

  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: any) => Promise.reject(error)
  );

  return instance;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetry(status?: number, retryOn: number[] = DEFAULT_RETRY_CONFIG.retryOnStatus): boolean {
  if (!status) return true; // network error
  return retryOn.includes(status);
}

async function withRetry<T>(fn: () => Promise<T>, retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG): Promise<T> {
  let attempt = 0;
  let lastError: unknown;

  while (attempt <= retryConfig.retries) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const status = error?.response?.status as number | undefined;
      if (attempt === retryConfig.retries || !shouldRetry(status, retryConfig.retryOnStatus)) {
        break;
      }
      const delay = retryConfig.retryDelayMs * Math.pow(2, attempt);
      await wait(delay);
      attempt += 1;
    }
  }

  throw lastError;
}

function generateTraceId(): string {
  const rnd = Math.random().toString(36).substring(2, 10);
  const ts = Date.now().toString(36);
  return `${ts}-${rnd}`;
}

export class HttpClient {
  private client: AxiosInstance;
  private retryConfig: RetryConfig;

  constructor(options?: { baseURL?: string; timeoutMs?: number; retryConfig?: Partial<RetryConfig> }) {
    this.client = createAxiosInstance(options?.baseURL, options?.timeoutMs);
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...(options?.retryConfig || {}) } as RetryConfig;
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return withRetry(() => this.client.get<T>(url, config), this.retryConfig);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return withRetry(() => this.client.post<T>(url, data, config), this.retryConfig);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return withRetry(() => this.client.put<T>(url, data, config), this.retryConfig);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return withRetry(() => this.client.patch<T>(url, data, config), this.retryConfig);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return withRetry(() => this.client.delete<T>(url, config), this.retryConfig);
  }
}

export function createServiceClient(serviceBaseUrlEnv: string, fallbackBaseUrl?: string): HttpClient {
  const baseURL = process.env[serviceBaseUrlEnv] || fallbackBaseUrl;
  return new HttpClient({ baseURL });
}

export const ServiceUrls = {
  USER: process.env.USER_SERVICE_URL || 'http://localhost:8001',
  CONTENT: process.env.CONTENT_SERVICE_URL || 'http://localhost:8002',
  PROGRESS: process.env.PROGRESS_SERVICE_URL || 'http://localhost:8003',
  COMMUNITY: process.env.COMMUNITY_SERVICE_URL || 'http://localhost:8004',
  NOTIFICATION: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8005',
  ANALYTICS: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:8006',
};

export function createUserServiceClient(): HttpClient {
  return new HttpClient({ baseURL: ServiceUrls.USER });
}

export function mapAxiosError(error: any): ServiceError {
  const status = error?.response?.status || 500;
  const data = error?.response?.data;
  const code = data?.error || data?.code || (status >= 500 ? 'UPSTREAM_ERROR' : 'BAD_REQUEST');
  const message = data?.message || error?.message || 'Upstream request failed';
  const details = typeof data === 'object' ? data : undefined;
  return { ok: false, status, code, message, details };
}


