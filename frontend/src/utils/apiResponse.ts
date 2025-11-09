// Helper to handle API responses that may be wrapped by TransformInterceptor
export interface ApiResponse<T> {
  success?: boolean;
  data: T;
  timestamp?: string;
}

export function unwrapResponse<T>(response: any): T {
  // Handle wrapped response from TransformInterceptor
  if (response && typeof response === 'object' && 'data' in response && 'success' in response) {
    return response.data;
  }
  // Handle direct response (backward compatibility)
  return response;
}

export function unwrapArrayResponse<T>(response: any): T[] {
  const data = unwrapResponse<T[]>(response);
  return Array.isArray(data) ? data : [];
}

