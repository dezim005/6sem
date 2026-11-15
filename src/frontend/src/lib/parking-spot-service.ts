
"use client";

import type { AvailabilitySlot, ParkingSpot, Reservation } from "@/types";

const SPOTS_API_BASE =
  process.env.NEXT_PUBLIC_GATEWAY_URL || "https://gateway-api-d2uo.onrender.com";

// As gravações usam exclusivamente a API .NET, através do Gateway.
// As leituras existentes continuam na API de consulta de vagas (Allan).
function readAuthToken(): string {
  if (typeof window === "undefined") {
    throw new Error("É necessário estar autenticado para gerenciar vagas.");
  }
  try {
    const saved = localStorage.getItem("vagaLivreAuth");
    const token = saved ? JSON.parse(saved)?.token : undefined;
    if (typeof token === "string" && token) return token;
  } catch {
    // Sessão inválida: o usuário deverá efetuar login novamente.
  }
  throw new Error("Sessão não encontrada. Faça login novamente.");
}

async function writeSpotApi(
  path: string,
  method: "POST" | "PUT" | "PATCH",
  payload: object,
): Promise<ParkingSpot> {
  const response = await fetch(`${SPOTS_API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${readAuthToken()}`,
    },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body?.data) {
    throw new Error(body?.message || `Falha ao salvar vaga (HTTP ${response.status}).`);
  }
  return normalizeSpot(body.data);
}

export async function addParkingSpot(
  spotData: Pick<ParkingSpot, "number" | "type" | "location" | "description"> & {
    ownerId: string;
    ownerName: string;
  },
): Promise<ParkingSpot> {
  return writeSpotApi("/api/ParkingSpots", "POST", {
    number: spotData.number,
    type: spotData.type,
    location: spotData.location,
    description: spotData.description,
    ownerId: spotData.ownerId,
    // O backend obtém o nome do proprietário da tabela de usuários.
  });
}

export async function updateSpot(
  spotId: string,
  updatedData: { availability: AvailabilitySlot[] },
): Promise<ParkingSpot> {
  return writeSpotApi(
    `/api/ParkingSpots/${encodeURIComponent(spotId)}/availability`,
    "PATCH",
    { availability: updatedData.availability },
  );
}

function normalizeAvailability(availability: unknown): AvailabilitySlot[] | undefined {
  if (!Array.isArray(availability)) {
    return undefined;
  }
  return availability.map((slot) => {
    const item = slot as AvailabilitySlot;
    return {
      ...item,
      startTime: new Date(item.startTime),
      endTime: new Date(item.endTime),
    };
  });
}

function normalizeSpot(raw: {
  id: string;
  number: string;
  type: ParkingSpot["type"];
  location: string;
  isAvailable: boolean;
  ownerId?: string;
  ownerName?: string;
  currentReservationId?: string | null;
  description?: string;
  availability?: unknown;
}): ParkingSpot {
  return {
    id: raw.id,
    number: raw.number,
    type: raw.type,
    location: raw.location,
    isAvailable: raw.isAvailable,
    ownerId: raw.ownerId,
    ownerName: raw.ownerName,
    currentReservationId: raw.currentReservationId,
    description: raw.description,
    availability: normalizeAvailability(raw.availability),
  };
}

const WAKE_RETRY_ATTEMPTS = 8;
const WAKE_RETRY_DELAY_MS = 8000;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchSpotsApi(path: string): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt < WAKE_RETRY_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(`${SPOTS_API_BASE}${path}`);
      if (response.ok || response.status === 404 || (response.status !== 502 && response.status !== 503)) {
        return response;
      }
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    if (attempt < WAKE_RETRY_ATTEMPTS - 1) {
      await wait(WAKE_RETRY_DELAY_MS);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Erro ao buscar vagas.");
}

function normalizeReservation(raw: Reservation): Reservation {
  return {
    id: raw.id,
    spotId: raw.spotId,
    userId: raw.userId,
    startTime: new Date(raw.startTime),
    endTime: new Date(raw.endTime),
    vehiclePlate: raw.vehiclePlate,
  };
}

export async function fetchParkingBoard(): Promise<{ spots: ParkingSpot[]; reservations: Reservation[] }> {
  const response = await fetchSpotsApi("/api/v1/spots");
  if (!response.ok) {
    throw new Error("Erro ao buscar vagas.");
  }
  const body = await response.json();
  const data = Array.isArray(body?.data) ? body.data : [];
  const reservations = data.flatMap((spot: { reservations?: Reservation[] }) =>
    Array.isArray(spot.reservations) ? spot.reservations.map(normalizeReservation) : []
  );
  return {
    spots: data.map(normalizeSpot),
    reservations,
  };
}

export async function fetchParkingSpots(): Promise<ParkingSpot[]> {
  const { spots } = await fetchParkingBoard();
  return spots;
}

export async function fetchSpotById(spotId: string): Promise<ParkingSpot | undefined> {
  const response = await fetchSpotsApi(`/api/v1/spots/${encodeURIComponent(spotId)}`);
  if (response.status === 404) {
    return undefined;
  }
  if (!response.ok) {
    throw new Error("Erro ao buscar vaga.");
  }
  const body = await response.json();
  if (!body?.data) {
    return undefined;
  }
  return normalizeSpot(body.data);
}
