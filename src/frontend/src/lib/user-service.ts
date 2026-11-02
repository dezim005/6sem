"use client";

import type { User } from "@/types";

const API_BASE =
  process.env.NEXT_PUBLIC_GATEWAY_URL || "https://gateway-api-d2uo.onrender.com";

const WAKE_RETRY_ATTEMPTS = 8;
const WAKE_RETRY_DELAY_MS = 8000;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; body: any }> {
  let lastError: unknown;
  for (let attempt = 0; attempt < WAKE_RETRY_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(init?.headers || {}),
        },
      });
      const body = await response.json().catch(() => ({}));
      if (response.ok || (response.status !== 502 && response.status !== 503)) {
        return { ok: response.ok, status: response.status, body };
      }
      lastError = new Error(body?.message || `HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    if (attempt < WAKE_RETRY_ATTEMPTS - 1) {
      await wait(WAKE_RETRY_DELAY_MS);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Erro ao buscar usuários.");
}

export async function getUsers(): Promise<User[]> {
  const { ok, body } = await request("/api/v1/users");
  if (!ok) {
    throw new Error(body?.message || "Erro ao buscar usuários.");
  }
  return Array.isArray(body?.data) ? body.data : [];
}

export async function getUserById(id: string): Promise<User | undefined> {
  const { ok, status, body } = await request(`/api/v1/users/${encodeURIComponent(id)}`);
  if (status === 404) {
    return undefined;
  }
  if (!ok) {
    throw new Error(body?.message || "Erro ao buscar usuário.");
  }
  return body?.data;
}

export async function updateUser(userId: string, data: Partial<User>): Promise<User | undefined> {
  const { ok, status, body } = await request(`/api/v1/users/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (status === 404) {
    return undefined;
  }
  if (!ok) {
    throw new Error(body?.message || "Erro ao atualizar usuário.");
  }
  return body?.data;
}

export async function deleteUser(userId: string): Promise<boolean> {
  const { ok, status } = await request(`/api/v1/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
  });
  if (status === 404) {
    return false;
  }
  return ok;
}
