export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]> | string[];
}

export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return { success: true, data, message };
}

export function errorResponse(
  message: string,
  errors?: Record<string, string[]> | string[],
): ApiResponse {
  return { success: false, message, errors };
}
