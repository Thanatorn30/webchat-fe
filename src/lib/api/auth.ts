import type { Admin } from "@/types/chat";
import { api } from "./client";

// API /api/auth — ⚠️ ยังไม่มีใน webchat-be (สัญญาที่ FE คาดไว้)
//   POST /api/auth/login     { email, password }        → { token, admin }
//   POST /api/auth/register  { email, name, password }  → { token, admin }

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  name: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  admin: Admin;
}

/** POST /api/auth/login */
export function login(input: LoginInput): Promise<AuthResponse> {
  return api.post<AuthResponse>("/auth/login", input);
}

/** POST /api/auth/register */
export function register(input: RegisterInput): Promise<AuthResponse> {
  return api.post<AuthResponse>("/auth/register", input);
}
