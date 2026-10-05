const express = require("express");
const cors = require("cors");
const { prisma } = require("./lib/prisma");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true }));
app.use(express.json());

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

function toReservationDto(reservation) {
  return {
    id: reservation.id,
    spotId: reservation.spotId,
    userId: reservation.userId,
    startTime: reservation.startTime,
    endTime: reservation.endTime,
    vehiclePlate: reservation.vehiclePlate,
  };
}

function isWithinAvailability(start, end, availability) {
  const slots = asArray(availability);
  if (slots.length === 0) return false;

  return slots.some((slot) => {
    const slotStart = startOfDay(slot.startTime);
    const slotEnd = endOfDay(slot.endTime);
    return start >= slotStart && end <= slotEnd;
  });
}

function newReservationId() {
  return `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

/**
 * GET /api/v1/reservations
 * userId  minhas reservas
 * spotId  reservas de uma vaga
 */
app.get("/api/v1/reservations", async (req, res) => {
  try {
    const userId = typeof req.query.userId === "string" ? req.query.userId : "";
    const spotId = typeof req.query.spotId === "string" ? req.query.spotId : "";

    const reservations = await prisma.vagaLivreReservations.findMany({
      where: {
        ...(userId ? { userId } : {}),
        ...(spotId ? { spotId } : {}),
      },
      orderBy: { startTime: "desc" },
    });

    res.json({ data: reservations.map(toReservationDto) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar reservas." });
  }
});

app.get("/api/v1/reservations/:id", async (req, res) => {
  try {
    const reservation = await prisma.vagaLivreReservations.findUnique({
      where: { id: req.params.id },
    });

    if (!reservation) {
      return res.status(404).json({ message: "Reserva não encontrada." });
    }

    res.json({ data: toReservationDto(reservation) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar reserva." });
  }
});

/**
 * POST /api/v1/reservations
 * body: { spotId, userId, startTime, endTime, vehiclePlate? }
 */
app.post("/api/v1/reservations", async (req, res) => {
  try {
    const { spotId, userId, startTime, endTime, vehiclePlate } = req.body || {};

    if (!spotId || !userId || !startTime || !endTime) {
      return res.status(400).json({
        message: "Campos obrigatórios: spotId, userId, startTime, endTime.",
      });
    }

    const requestedStart = startOfDay(startTime);
    const requestedEnd = endOfDay(endTime);

    if (Number.isNaN(requestedStart.getTime()) || Number.isNaN(requestedEnd.getTime())) {
      return res.status(400).json({ message: "startTime ou endTime inválidos." });
    }

    if (requestedEnd < requestedStart) {
      return res.status(400).json({
        message: "A data final da reserva não pode ser anterior à data inicial.",
      });
    }

    const user = await prisma.vagaLivreRegisteredUsers.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    const spot = await prisma.vagaLivreParkingSpots.findUnique({
      where: { id: spotId },
    });
    if (!spot) {
      return res.status(404).json({ message: "Vaga não encontrada." });
    }

    if (!isWithinAvailability(requestedStart, requestedEnd, spot.availability)) {
      return res.status(400).json({
        message:
          "O período selecionado não está disponível conforme definido pelo proprietário.",
      });
    }

    const existing = await prisma.vagaLivreReservations.findMany({
      where: { spotId },
    });

    const hasConflict = existing.some((reservation) => {
      const existingStart = startOfDay(reservation.startTime);
      const existingEnd = endOfDay(reservation.endTime);
      return requestedStart <= existingEnd && requestedEnd >= existingStart;
    });

    if (hasConflict) {
      return res.status(409).json({
        message:
          "Este período já está reservado ou entra em conflito com uma reserva existente.",
      });
    }

    const reservation = await prisma.vagaLivreReservations.create({
      data: {
        id: newReservationId(),
        spotId,
        userId,
        startTime: requestedStart,
        endTime: requestedEnd,
        vehiclePlate: vehiclePlate || null,
      },
    });

    res.status(201).json({
      message: "Vaga reservada com sucesso!",
      data: toReservationDto(reservation),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao criar reserva." });
  }
});

/**
 * DELETE /api/v1/reservations/:id?userId=
 * Só o dono da reserva cancela (igual o front).
 */
app.delete("/api/v1/reservations/:id", async (req, res) => {
  try {
    const userId =
      (typeof req.query.userId === "string" && req.query.userId) ||
      (req.body && req.body.userId) ||
      "";

    if (!userId) {
      return res.status(400).json({ message: "userId é obrigatório para cancelar." });
    }

    const reservation = await prisma.vagaLivreReservations.findUnique({
      where: { id: req.params.id },
    });

    if (!reservation) {
      return res.status(404).json({ message: "Reserva não encontrada." });
    }

    if (reservation.userId !== userId) {
      return res.status(403).json({
        message: "Você não tem permissão para cancelar esta reserva.",
      });
    }

    await prisma.vagaLivreReservations.delete({
      where: { id: reservation.id },
    });

    res.json({ message: "Reserva cancelada com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao cancelar reserva." });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Reservas em http://localhost:${PORT}`);
  });
}

module.exports = app;