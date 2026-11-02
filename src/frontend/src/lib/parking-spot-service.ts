
"use client";

import type { AvailabilitySlot, ParkingSpot } from "@/types";

const SPOTS_API_BASE =
  process.env.NEXT_PUBLIC_GATEWAY_URL || "https://gateway-api-d2uo.onrender.com";

const PARKING_SPOTS_STORAGE_KEY = "vagaLivreParkingSpots";

function saveParkingSpots(spots: ParkingSpot[]): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(PARKING_SPOTS_STORAGE_KEY, JSON.stringify(spots));
    } catch (error) {
      console.error("Falha ao salvar vagas no localStorage", error);
    }
  }
}

export function getParkingSpots(): ParkingSpot[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const storedSpots = localStorage.getItem(PARKING_SPOTS_STORAGE_KEY);
    if (storedSpots) {
      // Precisamos desserializar as datas que foram armazenadas como strings
      return JSON.parse(storedSpots).map((spot: any) => ({
        ...spot,
        availability: spot.availability?.map((slot: any) => ({
          ...slot,
          startTime: new Date(slot.startTime),
          endTime: new Date(slot.endTime),
        })),
      }));
    }
    return [];
  } catch (error) {
    console.error("Falha ao carregar vagas do localStorage", error);
    return [];
  }
}

export function addParkingSpot(
  spotData: Omit<ParkingSpot, "id" | "isAvailable" | "availability" | "currentReservationId"> & { ownerId: string; ownerName: string; }
): ParkingSpot {
  const spots = getParkingSpots();
  const newSpot: ParkingSpot = {
    id: `spot-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    number: spotData.number,
    type: spotData.type,
    location: spotData.location,
    description: spotData.description,
    isAvailable: true, // Vagas novas são disponíveis por padrão
    ownerId: spotData.ownerId,
    ownerName: spotData.ownerName, // Salvar o nome do proprietário
    currentReservationId: null,
    availability: [], // Disponibilidade vazia por padrão
  };
  const updatedSpots = [...spots, newSpot];
  saveParkingSpots(updatedSpots);
  return newSpot;
}

export function getSpotById(spotId: string): ParkingSpot | undefined {
  const spots = getParkingSpots();
  return spots.find(spot => spot.id === spotId);
}

export function updateSpot(spotId: string, updatedData: Partial<ParkingSpot>): ParkingSpot | undefined {
  let spots = getParkingSpots();
  const spotIndex = spots.findIndex(spot => spot.id === spotId);
  if (spotIndex !== -1) {
    spots[spotIndex] = { ...spots[spotIndex], ...updatedData };
    saveParkingSpots(spots);
    return spots[spotIndex];
  }
  return undefined;
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

export async function fetchParkingSpots(): Promise<ParkingSpot[]> {
  const response = await fetchSpotsApi("/api/v1/spots");
  if (!response.ok) {
    throw new Error("Erro ao buscar vagas.");
  }
  const body = await response.json();
  const data = Array.isArray(body?.data) ? body.data : [];
  return data.map(normalizeSpot);
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
