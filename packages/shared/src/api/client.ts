/**
 * API client configuration and factory
 */

import type { ApiResponse } from "../types";

export interface ApiClientConfig {
  baseUrl: string;
  headers?: Record<string, string>;
}

interface ErrorResponse {
  message?: string;
}

export function createApiClient(config: ApiClientConfig) {
  const { baseUrl, headers = {} } = config;

  async function request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...headers,
          ...options.headers,
        },
      });

      const data = (await response.json()) as T | ErrorResponse;

      if (!response.ok) {
        const errorData = data as ErrorResponse;
        return {
          data: null,
          error: errorData.message || "An error occurred",
          success: false,
        };
      }

      return {
        data: data as T,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      };
    }
  }

  return {
    get: <T>(endpoint: string) => request<T>(endpoint, { method: "GET" }),
    post: <T>(endpoint: string, body: unknown) =>
      request<T>(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    put: <T>(endpoint: string, body: unknown) =>
      request<T>(endpoint, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    patch: <T>(endpoint: string, body: unknown) =>
      request<T>(endpoint, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
  };
}
