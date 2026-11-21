import type { Admin, AdminRole } from "@/types/chat";
import { api } from "./client";

// API /api/admins — ตรงกับ webchat-be src/routes/admins.ts

export interface CreateAdminInput {
  email: string;
  name: string;
  role?: AdminRole; // BE ใช้ค่าเริ่มต้น "agent"
}

export type UpdateAdminInput = Partial<CreateAdminInput>;

/** POST /api/admins */
export function createAdmin(input: CreateAdminInput): Promise<Admin> {
  return api.post<Admin>("/admins", input);
}

/** GET /api/admins?role= */
export function listAdmins(params: { role?: AdminRole } = {}): Promise<Admin[]> {
  return api.get<Admin[]>("/admins", { params });
}

/** GET /api/admins/:id */
export function getAdmin(id: string): Promise<Admin> {
  return api.get<Admin>(`/admins/${encodeURIComponent(id)}`);
}

/** PATCH /api/admins/:id */
export function updateAdmin(id: string, input: UpdateAdminInput): Promise<Admin> {
  return api.patch<Admin>(`/admins/${encodeURIComponent(id)}`, input);
}

/** DELETE /api/admins/:id — ตอบ 204 */
export function deleteAdmin(id: string): Promise<void> {
  return api.delete(`/admins/${encodeURIComponent(id)}`);
}
