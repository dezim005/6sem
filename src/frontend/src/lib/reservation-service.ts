"use client";

import type { Reservation, ParkingSpot } from "@/types";
import { hasBookableDay } from "@/lib/bookable-days";

const API_BASE =
  process.env.NEXT_PUBLIC_GATEWAY_URL || "https://gateway-api-d2uo.onrender.com";

const WAKE_RETRY_ATTEMPTS = 8;
const WAKE_RETRY_DELAY_MS = 8000;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toReservation(raw: Reservation): Reservation {
  return {
    id: raw.id,
    spotId: raw.spotId,
    userId: raw.userId,
    startTime: new Date(raw.startTime),
    endTime: new Date(raw.endTime),
    vehiclePlate: raw.vehiclePlate,
  };
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
  throw lastError instanceof Error ? lastError : new Error("Erro ao buscar reservas.");
}

export async function getAllReservations(filters?: { userId?: string; spotId?: string }): Promise<Reservation[]> {
  const params = new URLSearchParams();
  if (filters?.userId) {
    params.set("userId", filters.userId);
  }
  if (filters?.spotId) {
    params.set("spotId", filters.spotId);
  }
  const query = params.toString();
  const { ok, body } = await request(`/api/v1/reservations${query ? `?${query}` : ""}`);
  if (!ok) {
    throw new Error(body?.message || "Erro ao buscar reservas.");
  }
  const data = Array.isArray(body?.data) ? body.data : [];
  return data.map(toReservation);
}

export async function getReservationsBySpotId(spotId: string): Promise<Reservation[]> {
  return getAllReservations({ spotId });
}

export async function addReservation(
  reservationData: Omit<Reservation, "id">
): Promise<{ success: boolean; message: string; reservation?: Reservation }> {
  try {
    const { ok, body } = await request("/api/v1/reservations", {
      method: "POST",
      body: JSON.stringify(reservationData),
    });
    if (!ok || !body?.data) {
      return { success: false, message: body?.message || "Não foi possível reservar a vaga para este período." };
    }
    return {
      success: true,
      message: body.message || "Vaga reservada com sucesso!",
      reservation: toReservation(body.data),
    };
  } catch (error) {
    console.error("Falha ao criar reserva", error);
    return { success: false, message: "Erro ao criar reserva." };
  }
}

export async function cancelReservation(
  reservationId: string,
  currentUserId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { ok, body } = await request(
      `/api/v1/reservations/${encodeURIComponent(reservationId)}?userId=${encodeURIComponent(currentUserId)}`,
      { method: "DELETE" }
    );
    if (!ok) {
      return { success: false, message: body?.message || "Não foi possível cancelar a reserva." };
    }
    return { success: true, message: body?.message || "Reserva cancelada com sucesso." };
  } catch (error) {
    console.error("Falha ao cancelar reserva", error);
    return { success: false, message: "Erro ao cancelar reserva." };
  }
}

export function isSpotFullyBooked(spot: ParkingSpot, reservationsForSpot: Reservation[]): boolean {
  if (!spot.availability || spot.availability.length === 0) {
    return false;
  }
  return !hasBookableDay(spot, reservationsForSpot);
}
