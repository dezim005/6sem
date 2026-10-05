import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

const prisma = {
  vagaLivreReservations: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
  vagaLivreRegisteredUsers: {
    findUnique: vi.fn(),
  },
  vagaLivreParkingSpots: {
    findUnique: vi.fn(),
  },
};

globalThis.__PRISMA__ = prisma;

const { default: app } = await import("../server.js");

const reservation = {
  id: "res-demo",
  spotId: "spot-demo",
  userId: "user-demo",
  startTime: new Date("2026-10-08T03:00:00.000Z"),
  endTime: new Date("2026-10-10T02:59:59.999Z"),
  vehiclePlate: "XYZ-9A87",
};

const user = { id: "user-demo", name: "Morador Teste" };

const spot = {
  id: "spot-demo",
  number: "A-01",
  availability: [
    {
      id: "slot-demo",
      spotId: "spot-demo",
      startTime: new Date("2026-10-01T03:00:00.000Z"),
      endTime: new Date("2026-10-31T02:59:59.999Z"),
      isRecurring: false,
    },
  ],
};

describe("API de reservas (Gustavo)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /health -> 200", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("GET /api/v1/reservations -> lista reservas", async () => {
    prisma.vagaLivreReservations.findMany.mockResolvedValue([reservation]);

    const res = await request(app).get("/api/v1/reservations");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe("res-demo");
  });

  it("GET /api/v1/reservations/:id -> 200", async () => {
    prisma.vagaLivreReservations.findUnique.mockResolvedValue(reservation);

    const res = await request(app).get("/api/v1/reservations/res-demo");

    expect(res.status).toBe(200);
    expect(res.body.data.spotId).toBe("spot-demo");
  });

  it("GET /api/v1/reservations/:id -> 404", async () => {
    prisma.vagaLivreReservations.findUnique.mockResolvedValue(null);

    const res = await request(app).get("/api/v1/reservations/nao-existe");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Reserva não encontrada.");
  });

  it("POST /api/v1/reservations -> 400 sem campos", async () => {
    const res = await request(app).post("/api/v1/reservations").send({ spotId: "spot-demo" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Campos obrigatórios: spotId, userId, startTime, endTime.");
  });

  it("POST /api/v1/reservations -> 400 data inválida", async () => {
    const res = await request(app).post("/api/v1/reservations").send({
      spotId: "spot-demo",
      userId: "user-demo",
      startTime: "nao-e-data",
      endTime: "2026-10-10",
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("startTime ou endTime inválidos.");
  });

  it("POST /api/v1/reservations -> 400 fim antes do início", async () => {
    const res = await request(app).post("/api/v1/reservations").send({
      spotId: "spot-demo",
      userId: "user-demo",
      startTime: "2026-10-10",
      endTime: "2026-10-08",
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/data final/);
  });

  it("POST /api/v1/reservations -> 404 usuário inexistente", async () => {
    prisma.vagaLivreRegisteredUsers.findUnique.mockResolvedValue(null);

    const res = await request(app).post("/api/v1/reservations").send({
      spotId: "spot-demo",
      userId: "nao-existe",
      startTime: "2026-10-08",
      endTime: "2026-10-10",
    });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Usuário não encontrado.");
  });

  it("POST /api/v1/reservations -> 404 vaga inexistente", async () => {
    prisma.vagaLivreRegisteredUsers.findUnique.mockResolvedValue(user);
    prisma.vagaLivreParkingSpots.findUnique.mockResolvedValue(null);

    const res = await request(app).post("/api/v1/reservations").send({
      spotId: "nao-existe",
      userId: "user-demo",
      startTime: "2026-10-08",
      endTime: "2026-10-10",
    });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Vaga não encontrada.");
  });

  it("POST /api/v1/reservations -> 400 fora da disponibilidade", async () => {
    prisma.vagaLivreRegisteredUsers.findUnique.mockResolvedValue(user);
    prisma.vagaLivreParkingSpots.findUnique.mockResolvedValue(spot);

    const res = await request(app).post("/api/v1/reservations").send({
      spotId: "spot-demo",
      userId: "user-demo",
      startTime: "2027-01-01",
      endTime: "2027-01-02",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/não está disponível/);
  });

  it("POST /api/v1/reservations -> 409 conflito", async () => {
    prisma.vagaLivreRegisteredUsers.findUnique.mockResolvedValue(user);
    prisma.vagaLivreParkingSpots.findUnique.mockResolvedValue(spot);
    prisma.vagaLivreReservations.findMany.mockResolvedValue([reservation]);

    const res = await request(app).post("/api/v1/reservations").send({
      spotId: "spot-demo",
      userId: "user-demo",
      startTime: "2026-10-08",
      endTime: "2026-10-10",
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/conflito/);
  });

  it("POST /api/v1/reservations -> 201", async () => {
    prisma.vagaLivreRegisteredUsers.findUnique.mockResolvedValue(user);
    prisma.vagaLivreParkingSpots.findUnique.mockResolvedValue(spot);
    prisma.vagaLivreReservations.findMany.mockResolvedValue([]);
    prisma.vagaLivreReservations.create.mockResolvedValue(reservation);

    const res = await request(app).post("/api/v1/reservations").send({
      spotId: "spot-demo",
      userId: "user-demo",
      startTime: "2026-10-08",
      endTime: "2026-10-10",
      vehiclePlate: "XYZ-9A87",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBe("res-demo");
    expect(res.body.message).toMatch(/reservada com sucesso/i);
  });

  it("DELETE /api/v1/reservations/:id -> 400 sem userId", async () => {
    const res = await request(app).delete("/api/v1/reservations/res-demo");
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("userId é obrigatório para cancelar.");
  });

  it("DELETE /api/v1/reservations/:id -> 404", async () => {
    prisma.vagaLivreReservations.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .delete("/api/v1/reservations/nao-existe")
      .query({ userId: "user-demo" });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Reserva não encontrada.");
  });

  it("DELETE /api/v1/reservations/:id -> 403 de outro usuário", async () => {
    prisma.vagaLivreReservations.findUnique.mockResolvedValue(reservation);

    const res = await request(app)
      .delete("/api/v1/reservations/res-demo")
      .query({ userId: "outro-user" });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/permissão/);
  });

  it("DELETE /api/v1/reservations/:id -> 200", async () => {
    prisma.vagaLivreReservations.findUnique.mockResolvedValue(reservation);
    prisma.vagaLivreReservations.delete.mockResolvedValue(reservation);

    const res = await request(app)
      .delete("/api/v1/reservations/res-demo")
      .query({ userId: "user-demo" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Reserva cancelada com sucesso.");
  });
});
