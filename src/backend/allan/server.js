const express = require("express");
const cors = require("cors");
const { prisma } = require("./lib/prisma");

const app = express();
const PORT = process.env.PORT || 3000;

const SPOT_TYPES = ["compact", "standard", "suv", "motorcycle"];

app.use(cors({ origin: true }));

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function asArray(availability) {
  return Array.isArray(availability) ? availability : [];
}

function hasAvailabilitySlots(availability) {
  return asArray(availability).length > 0;
}

function slotCovers(availability, when) {
  const slots = asArray(availability);
  if (slots.length === 0) return false;
  return slots.some((slot) => {
    const slotStart = startOfDay(slot.startTime);
    const slotEnd = endOfDay(slot.endTime);
    return when >= slotStart && when <= slotEnd;
  });
}

function reservationOverlaps(reservations, rangeStart, rangeEnd) {
  return reservations.some((res) => {
    const resStart = new Date(res.startTime);
    const resEnd = new Date(res.endTime);
    return resStart <= rangeEnd && resEnd >= rangeStart;
  });
}

function isOccupied(spot, at) {
  const rangeStart = startOfDay(at);
  const rangeEnd = endOfDay(at);
  if (hasAvailabilitySlots(spot.availability) && !slotCovers(spot.availability, at)) {
    return true;
  }
  return reservationOverlaps(spot.reservations || [], rangeStart, rangeEnd);
}

function toSpotDto(spot) {
  return {
    id: spot.id,
    number: spot.number,
    type: spot.type,
    location: spot.location,
    isAvailable: spot.isAvailable,
    ownerId: spot.ownerId,
    ownerName: spot.ownerName,
    currentReservationId: spot.currentReservationId,
    description: spot.description,
    availability: asArray(spot.availability),
    reservations: (spot.reservations || []).map((res) => ({
      id: res.id,
      spotId: res.spotId,
      userId: res.userId,
      startTime: res.startTime,
      endTime: res.endTime,
      vehiclePlate: res.vehiclePlate,
    })),
  };
}

function matchesSearch(spot, q) {
  if (!q) return true;
  const term = q.toLowerCase();
  return (
    spot.number.toLowerCase().includes(term) ||
    spot.location.toLowerCase().includes(term)
  );
}

function matchesStatus(spot, status, at) {
  if (!status || status === "all") return true;

  const configured = spot.isAvailable && hasAvailabilitySlots(spot.availability);
  const occupied = isOccupied(spot, at);

  if (status === "available") {
    return configured && !occupied;
  }
  if (status === "occupied") {
    return !configured || occupied;
  }
  return true;
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

/**
 * GET /api/v1/spots
 * q            busca número ou localização
 * type         compact | standard | suv | motorcycle
 * status       all | available | occupied
 * date         YYYY-MM-DD (senão usa o momento atual)
 * ownerId      minhas vagas
 */
app.get("/api/v1/spots", async (req, res) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const type = typeof req.query.type === "string" ? req.query.type : "";
    const status = typeof req.query.status === "string" ? req.query.status : "all";
    const ownerId = typeof req.query.ownerId === "string" ? req.query.ownerId : "";
    const dateParam = typeof req.query.date === "string" ? req.query.date : "";

    if (type && type !== "all" && !SPOT_TYPES.includes(type)) {
      return res.status(400).json({ message: "type inválido." });
    }
    if (status && !["all", "available", "occupied"].includes(status)) {
      return res.status(400).json({ message: "status inválido." });
    }

    const at = dateParam ? startOfDay(dateParam) : new Date();
    if (dateParam && Number.isNaN(at.getTime())) {
      return res.status(400).json({ message: "date inválida. Use YYYY-MM-DD." });
    }

    const spots = await prisma.vagaLivreParkingSpots.findMany({
      where: {
        ...(type && type !== "all" ? { type } : {}),
        ...(ownerId ? { ownerId } : {}),
      },
      include: { reservations: true },
      orderBy: { number: "asc" },
    });

    const data = spots
      .filter((spot) => matchesSearch(spot, q))
      .filter((spot) => matchesStatus(spot, status, at))
      .map(toSpotDto);

    res.json({ data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar vagas." });
  }
});

app.get("/api/v1/spots/:id", async (req, res) => {
  try {
    const spot = await prisma.vagaLivreParkingSpots.findUnique({
      where: { id: req.params.id },
      include: { reservations: true },
    });
    if (!spot) {
      return res.status(404).json({ message: "Vaga não encontrada." });
    }
    res.json({ data: toSpotDto(spot) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar vaga." });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Disponibilidade em http://localhost:${PORT}`);
  });
}

module.exports = app;