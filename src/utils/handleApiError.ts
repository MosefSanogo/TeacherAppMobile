import axios from "axios";

interface ApiErrorResponse {
  error?: {
    code?: string;
    status?: number;
    message?: string;
    details?: unknown;
  };
}

export function handleApiError(error: unknown) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const apiError = error.response?.data?.error;

    return {
      code: apiError?.code ?? "UNKNOWN_ERROR",
      status: apiError?.status ?? error.response?.status ?? 500,
      message: apiError?.message ?? "Une erreur est survenue.",
      details: apiError?.details ?? null,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    status: 500,
    message: "Une erreur inattendue est survenue.",
    details: null,
  };
}
