import axios, { type AxiosError } from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface ApiErrorPayload {
  success: false;
  message: string;
  errors?: { path: string; message: string }[];
}

export class ApiError extends Error {
  readonly statusCode: number;
  readonly fieldErrors?: { path: string; message: string }[];

  constructor(statusCode: number, message: string, fieldErrors?: { path: string; message: string }[]) {
    super(message);
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
  }

  get isAuthError() {
    return this.statusCode === 401;
  }

  get isRateLimited() {
    return this.statusCode === 429;
  }
}

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorPayload>) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      throw new ApiError(status, data?.message ?? "Something went wrong", data?.errors);
    }
    throw new ApiError(0, "Network error");
  }
);

// We keep both export formats to satisfy imports from both branches until we refactor
export const apiClient = client;
export default client;
