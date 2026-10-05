import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

const prisma = {
  vagaLivreParkingSpots: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
};

globalThis.__PRISMA__ = prisma;

const { default: app } = await import("../server.js");

const farStart = new Date("2020-01-01T03:00:00.000Z");
const farEnd = new Date("2030-12-31T02:59:59.999Z");

const spotLivre = {
  id: "spot-demo",
  number: "A-01",
  type: "standard",
  location: "Subsolo 1",
  isAvailable: true,
  ownerId: "user-demo",
  ownerName: "Morador Teste",
  currentReservationId: null,
  description: "Vaga de teste",
  availability: [
    { id: "slot-demo", spotId: "spot-demo", startTime: farStart, endTime: farEnd, isRecurring: false },
  ],
  reservations: [],
};

const spotCompacta = {
  id: "spot-ana",
  number: "A-02",
  type: "compact",
  location: "Subsolo 1",
  isAvailable: true,
  ownerId: "user-ana",
  ownerName: "Ana Souza",
  currentReservationId: null,
  description: "Vaga compacta",
  availability: [
    { id: "slot-ana", spotId: "spot-ana", startTime: farStart, endTime: farEnd, isRecurring: false },
  ],
  reservations: [],
};

const spotOcupada = {
  id: "spot-ocupada",
  number: "C-12",
  type: "standard",
  location: "Subsolo 2",
  isAvailable: true,
  ownerId: "user-ana",
  ownerName: "Ana Souza",
  currentReservationId: "res-demo",
  description: "Vaga ocupada",
  availability: [
    { id: "slot-ocupada", spotId: "spot-ocupada", startTime: farStart, endTime: farEnd, isRecurring: false },
  ],
  reservations: [
    {
      id: "res-demo",
      spotId: "spot-ocupada",
      userId: "user-carlos",
      startTime: new Date(),
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      vehiclePlate: "ABC-1D23",
    },
  ],
};

describe("API de disponibilidade (Allan)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /health -> 200", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("GET /api/v1/spots -> lista vagas", async () => {
    prisma.vagaLivreParkingSpots.findMany.mockResolvedValue([spotLivre, spotCompacta]);

    const res = await request(app).get("/api/v1/spots");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].id).toBe("spot-demo");
    expect(res.body.data[0].reservations).toEqual([]);
  });

  it("GET /api/v1/spots?q=A-01 -> filtra por busca", async () => {
    prisma.vagaLivreParkingSpots.findMany.mockResolvedValue([spotLivre, spotCompacta]);

    const res = await request(app).get("/api/v1/spots").query({ q: "A-01" });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].number).toBe("A-01");
  });

  it("GET /api/v1/spots?status=available -> omite vaga ocupada", async () => {
    prisma.vagaLivreParkingSpots.findMany.mockResolvedValue([spotLivre, spotOcupada]);

    const res = await request(app).get("/api/v1/spots").query({ status: "available" });

    expect(res.status).toBe(200);
    expect(res.body.data.map((spot) => spot.id)).toEqual(["spot-demo"]);
  });

  it("GET /api/v1/spots?status=occupied -> retorna só ocupadas", async () => {
    prisma.vagaLivreParkingSpots.findMany.mockResolvedValue([spotLivre, spotOcupada]);

    const res = await request(app).get("/api/v1/spots").query({ status: "occupied" });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe("spot-ocupada");
  });

  it("GET /api/v1/spots?type=invalido -> 400", async () => {
    const res = await request(app).get("/api/v1/spots").query({ type: "helicoptero" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("type inválido.");
  });

  it("GET /api/v1/spots?status=invalido -> 400", async () => {
    const res = await request(app).get("/api/v1/spots").query({ status: "livre" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("status inválido.");
  });

  it("GET /api/v1/spots?date=abc -> 400", async () => {
    const res = await request(app).get("/api/v1/spots").query({ date: "abc" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("date inválida. Use YYYY-MM-DD.");
  });

  it("GET /api/v1/spots/:id -> retorna a vaga", async () => {
    prisma.vagaLivreParkingSpots.findUnique.mockResolvedValue(spotLivre);

    const res = await request(app).get("/api/v1/spots/spot-demo");

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe("spot-demo");
    expect(res.body.data.number).toBe("A-01");
  });

  it("GET /api/v1/spots/:id -> 404 se não existir", async () => {
    prisma.vagaLivreParkingSpots.findUnique.mockResolvedValue(null);

    const res = await request(app).get("/api/v1/spots/nao-existe");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Vaga não encontrada.");
  });

  it("GET /api/v1/spots -> 500 se o banco falhar", async () => {
    prisma.vagaLivreParkingSpots.findMany.mockRejectedValue(new Error("db"));

    const res = await request(app).get("/api/v1/spots");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Erro ao buscar vagas.");
  });
});
