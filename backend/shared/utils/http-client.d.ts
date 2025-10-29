import { AxiosRequestConfig, AxiosResponse } from 'axios';
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
export declare class HttpClient {
    private client;
    private retryConfig;
    constructor(options?: {
        baseURL?: string;
        timeoutMs?: number;
        retryConfig?: Partial<RetryConfig>;
    });
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
}
export declare function createServiceClient(serviceBaseUrlEnv: string, fallbackBaseUrl?: string): HttpClient;
export declare const ServiceUrls: {
    USER: string;
    CONTENT: string;
    PROGRESS: string;
    COMMUNITY: string;
    NOTIFICATION: string;
    ANALYTICS: string;
};
export declare function createUserServiceClient(): HttpClient;
export declare function mapAxiosError(error: any): ServiceError;
export {};
//# sourceMappingURL=http-client.d.ts.map