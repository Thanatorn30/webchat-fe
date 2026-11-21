import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { clearToken, getToken } from "@/lib/session";

// HTTP client กลาง (axios) สำหรับเรียก webchat-be
// ตั้ง NEXT_PUBLIC_API_URL ใน .env.local ได้ (ค่าเริ่มต้น http://localhost:4000/api)

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

/** error จาก BE — BE ตอบรูปแบบ { error: string } */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const http = axios.create({ baseURL: API_URL });

// แนบ token ทุก request
http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// แปลง error ที่ BE ตอบกลับเป็น ApiError
// (ถ้าเชื่อมต่อไม่ได้เลย = ไม่มี response → โยน error เดิมของ axios ออกไป)
http.interceptors.response.use(
  (res) => res,
  (err: unknown) => {
    if (err instanceof AxiosError && err.response) {
      const { status, statusText, data } = err.response;
      // token ใช้ไม่ได้แล้ว → ลบทิ้ง แล้ว AuthGuard จะดีดไปหน้า login เอง
      if (status === 401 && getToken()) clearToken();
      const message = (data as { error?: string } | undefined)?.error ?? statusText;
      throw new ApiError(status, message);
    }
    throw err;
  },
);

type Config = Omit<AxiosRequestConfig, "url" | "method" | "data">;

/** เรียก API แล้วคืนเฉพาะ body (204 No Content → undefined) */
export const api = {
  get: async <T>(url: string, config?: Config) => (await http.get<T>(url, config)).data,
  post: async <T>(url: string, body?: unknown, config?: Config) => (await http.post<T>(url, body, config)).data,
  put: async <T>(url: string, body?: unknown, config?: Config) => (await http.put<T>(url, body, config)).data,
  patch: async <T>(url: string, body?: unknown, config?: Config) => (await http.patch<T>(url, body, config)).data,
  delete: async <T = void>(url: string, config?: Config) => (await http.delete<T>(url, config)).data,
};
