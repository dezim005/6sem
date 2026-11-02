"use client";

import type { Condominium } from "@/types";

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
  throw lastError instanceof Error ? lastError : new Error("Erro ao buscar condomínios.");
}

export async function getCondominiums(): Promise<Condominium[]> {
  const { ok, body } = await request("/api/v1/condominiums");
  if (!ok) {
    throw new Error(body?.message || "Erro ao buscar condomínios.");
  }
  return Array.isArray(body?.data) ? body.data : [];
}

export async function addCondominium(condominiumData: Omit<Condominium, "id">): Promise<Condominium> {
  const { ok, body } = await request("/api/v1/condominiums", {
    method: "POST",
    body: JSON.stringify(condominiumData),
  });
  if (!ok || !body?.data) {
    throw new Error(body?.message || "Erro ao cadastrar condomínio.");
  }
  return body.data;
}

export async function getCondominiumById(id: string): Promise<Condominium | undefined> {
  const { ok, status, body } = await request(`/api/v1/condominiums/${encodeURIComponent(id)}`);
  if (status === 404) {
    return undefined;
  }
  if (!ok) {
    throw new Error(body?.message || "Erro ao buscar condomínio.");
  }
  return body?.data;
}
