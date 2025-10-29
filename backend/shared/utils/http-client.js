"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceUrls = exports.HttpClient = void 0;
exports.createServiceClient = createServiceClient;
exports.createUserServiceClient = createUserServiceClient;
exports.mapAxiosError = mapAxiosError;
const axios_1 = __importDefault(require("axios"));
const DEFAULT_TIMEOUT_MS = parseInt(process.env.HTTP_CLIENT_TIMEOUT_MS || '10000');
const DEFAULT_RETRY_CONFIG = {
    retries: parseInt(process.env.HTTP_CLIENT_RETRIES || '3'),
    retryDelayMs: parseInt(process.env.HTTP_CLIENT_RETRY_DELAY_MS || '500'),
    retryOnStatus: [408, 429, 500, 502, 503, 504],
};
function createAxiosInstance(baseURL, timeoutMs = DEFAULT_TIMEOUT_MS) {
    const instance = axios_1.default.create({
        baseURL,
        timeout: timeoutMs,
        headers: {
            'Content-Type': 'application/json',
        },
        validateStatus: (status) => status >= 200 && status < 500,
    });
    instance.interceptors.request.use((config) => {
        const correlationId = config.headers?.['x-request-id'] ||
            config.headers?.['X-Request-ID'] ||
            generateTraceId();
        const traceId = config.headers?.['x-trace-id'] || correlationId;
        if (!config.headers) {
            config.headers = {};
        }
        config.headers['X-Request-ID'] = correlationId;
        config.headers['x-trace-id'] = traceId;
        config.headers['x-service-name'] = process.env.SERVICE_NAME || 'unknown-service';
        return config;
    });
    instance.interceptors.response.use((response) => response, (error) => Promise.reject(error));
    return instance;
}
function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function shouldRetry(status, retryOn = DEFAULT_RETRY_CONFIG.retryOnStatus) {
    if (!status)
        return true;
    return retryOn.includes(status);
}
async function withRetry(fn, retryConfig = DEFAULT_RETRY_CONFIG) {
    let attempt = 0;
    let lastError;
    while (attempt <= retryConfig.retries) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            const status = error?.response?.status;
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
function generateTraceId() {
    const rnd = Math.random().toString(36).substring(2, 10);
    const ts = Date.now().toString(36);
    return `${ts}-${rnd}`;
}
class HttpClient {
    constructor(options) {
        this.client = createAxiosInstance(options?.baseURL, options?.timeoutMs);
        this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...(options?.retryConfig || {}) };
    }
    async get(url, config) {
        return withRetry(() => this.client.get(url, config), this.retryConfig);
    }
    async post(url, data, config) {
        return withRetry(() => this.client.post(url, data, config), this.retryConfig);
    }
    async put(url, data, config) {
        return withRetry(() => this.client.put(url, data, config), this.retryConfig);
    }
    async patch(url, data, config) {
        return withRetry(() => this.client.patch(url, data, config), this.retryConfig);
    }
    async delete(url, config) {
        return withRetry(() => this.client.delete(url, config), this.retryConfig);
    }
}
exports.HttpClient = HttpClient;
function createServiceClient(serviceBaseUrlEnv, fallbackBaseUrl) {
    const baseURL = process.env[serviceBaseUrlEnv] || fallbackBaseUrl;
    return new HttpClient({ baseURL });
}
exports.ServiceUrls = {
    USER: process.env.USER_SERVICE_URL || 'http://localhost:8001',
    CONTENT: process.env.CONTENT_SERVICE_URL || 'http://localhost:8002',
    PROGRESS: process.env.PROGRESS_SERVICE_URL || 'http://localhost:8003',
    COMMUNITY: process.env.COMMUNITY_SERVICE_URL || 'http://localhost:8004',
    NOTIFICATION: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8005',
    ANALYTICS: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:8006',
};
function createUserServiceClient() {
    return new HttpClient({ baseURL: exports.ServiceUrls.USER });
}
function mapAxiosError(error) {
    const status = error?.response?.status || 500;
    const data = error?.response?.data;
    const code = data?.error || data?.code || (status >= 500 ? 'UPSTREAM_ERROR' : 'BAD_REQUEST');
    const message = data?.message || error?.message || 'Upstream request failed';
    const details = typeof data === 'object' ? data : undefined;
    return { ok: false, status, code, message, details };
}
//# sourceMappingURL=http-client.js.map