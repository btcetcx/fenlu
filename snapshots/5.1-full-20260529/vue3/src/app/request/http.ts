import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@/app/api/shared/types';

export class ApiError extends Error {
  code?: string;
  details?: Record<string, unknown>;

  constructor(message: string, code?: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

const http: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.response.use(
  (response) => {
    const payload = response.data as ApiResponse<unknown>;

    if (payload && payload.success === false) {
      throw new ApiError(payload.message || '接口请求失败', payload.code, payload.details);
    }

    return response;
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    const payload = error.response?.data;
    throw new ApiError(payload?.message || error.message || '网络请求失败', payload?.code, payload?.details);
  },
);

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await http.request<ApiResponse<T>>(config);
  return response.data.data;
}
