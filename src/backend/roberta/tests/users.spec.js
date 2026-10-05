import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

const prisma = {
  vagaLivreCondominiums: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  vagaLivreRegisteredUsers: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

globalThis.__PRISMA__ = prisma;

const { default: app } = await import("../server.js");

const condo = { id: "condo-1", name: "Residencial Sol", address: "Rua A, 10" };

const user = {
  id: "user-demo",
  name: "Morador Teste",
  email: "teste@vagalivre.com",
  password: "123456",
  role: "resident",
  status: "approved",
  registrationDate: "2026-01-01",
  avatarUrl: "https://placehold.co/40x40.png?text=M",
  dateOfBirth: "",
  apartment: "101",
  cpf: "",
  phone: "",
  description: "",
  condominiumId: "condo-1",
};

describe("API de usuários e condomínios (Roberta)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /health -> 200", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("GET /api/v1/condominiums -> lista condomínios", async () => {
    prisma.vagaLivreCondominiums.findMany.mockResolvedValue([condo]);

    const res = await request(app).get("/api/v1/condominiums");

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([condo]);
  });

  it("GET /api/v1/condominiums/:id -> 200", async () => {
    prisma.vagaLivreCondominiums.findUnique.mockResolvedValue(condo);

    const res = await request(app).get("/api/v1/condominiums/condo-1");

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe("condo-1");
  });

  it("GET /api/v1/condominiums/:id -> 404", async () => {
    prisma.vagaLivreCondominiums.findUnique.mockResolvedValue(null);

    const res = await request(app).get("/api/v1/condominiums/nao-existe");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Condomínio não encontrado.");
  });

  it("POST /api/v1/condominiums -> 400 sem campos", async () => {
    const res = await request(app).post("/api/v1/condominiums").send({ name: "X" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Campos obrigatórios: name, address.");
  });

  it("POST /api/v1/condominiums -> 201", async () => {
    prisma.vagaLivreCondominiums.create.mockResolvedValue(condo);

    const res = await request(app)
      .post("/api/v1/condominiums")
      .send({ name: condo.name, address: condo.address });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe(condo.name);
  });

  it("GET /api/v1/users -> lista usuários", async () => {
    prisma.vagaLivreRegisteredUsers.findMany.mockResolvedValue([user]);

    const res = await request(app).get("/api/v1/users");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].email).toBe(user.email);
    expect(res.body.data[0]).not.toHaveProperty("password");
  });

  it("GET /api/v1/users?status=invalido -> 400", async () => {
    const res = await request(app).get("/api/v1/users").query({ status: "ativo" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("status inválido.");
  });

  it("GET /api/v1/users/:id -> 200", async () => {
    prisma.vagaLivreRegisteredUsers.findUnique.mockResolvedValue(user);

    const res = await request(app).get("/api/v1/users/user-demo");

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe("user-demo");
  });

  it("GET /api/v1/users/:id -> 404", async () => {
    prisma.vagaLivreRegisteredUsers.findUnique.mockResolvedValue(null);

    const res = await request(app).get("/api/v1/users/nao-existe");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Usuário não encontrado.");
  });

  it("POST /api/v1/users -> 400 sem campos", async () => {
    const res = await request(app).post("/api/v1/users").send({ name: "Ana" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Campos obrigatórios: name, email, password.");
  });

  it("POST /api/v1/users -> 409 email duplicado", async () => {
    prisma.vagaLivreRegisteredUsers.findUnique.mockResolvedValue(user);

    const res = await request(app).post("/api/v1/users").send({
      name: "Ana",
      email: user.email,
      password: "123456",
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Este email já está cadastrado.");
  });

  it("POST /api/v1/users -> primeiro usuário vira síndico aprovado", async () => {
    prisma.vagaLivreRegisteredUsers.findUnique.mockResolvedValue(null);
    prisma.vagaLivreRegisteredUsers.count.mockResolvedValue(0);
    prisma.vagaLivreRegisteredUsers.create.mockImplementation(async ({ data }) => ({
      ...user,
      ...data,
      role: "manager",
      status: "approved",
      condominiumId: null,
    }));

    const res = await request(app).post("/api/v1/users").send({
      name: "Síndico",
      email: "sindico@vagalivre.com",
      password: "123456",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.role).toBe("manager");
    expect(res.body.data.status).toBe("approved");
    expect(res.body.message).toMatch(/Síndico/);
  });

  it("POST /api/v1/users -> morador sem condomínio -> 400", async () => {
    prisma.vagaLivreRegisteredUsers.findUnique.mockResolvedValue(null);
    prisma.vagaLivreRegisteredUsers.count.mockResolvedValue(2);

    const res = await request(app).post("/api/v1/users").send({
      name: "Ana",
      email: "ana@vagalivre.com",
      password: "123456",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/condomínio/);
  });

  it("POST /api/v1/users -> condomínio inexistente -> 404", async () => {
    prisma.vagaLivreRegisteredUsers.findUnique.mockResolvedValue(null);
    prisma.vagaLivreRegisteredUsers.count.mockResolvedValue(2);
    prisma.vagaLivreCondominiums.findUnique.mockResolvedValue(null);

    const res = await request(app).post("/api/v1/users").send({
      name: "Ana",
      email: "ana@vagalivre.com",
      password: "123456",
      condominiumId: "nao-existe",
    });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Condomínio não encontrado.");
  });

  it("POST /api/v1/users -> morador pendente -> 201", async () => {
    prisma.vagaLivreRegisteredUsers.findUnique.mockResolvedValue(null);
    prisma.vagaLivreRegisteredUsers.count.mockResolvedValue(2);
    prisma.vagaLivreCondominiums.findUnique.mockResolvedValue(condo);
    prisma.vagaLivreRegisteredUsers.create.mockImplementation(async ({ data }) => ({
      ...user,
      ...data,
    }));

    const res = await request(app).post("/api/v1/users").send({
      name: "Ana",
      email: "ana@vagalivre.com",
      password: "123456",
      condominiumId: "condo-1",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.role).toBe("resident");
    expect(res.body.data.status).toBe("pending");
  });

  it("PATCH /api/v1/users/:id -> 404", async () => {
    prisma.vagaLivreRegisteredUsers.findUnique.mockResolvedValue(null);

    const res = await request(app).patch("/api/v1/users/nao-existe").send({ status: "approved" });

    expect(res.status).toBe(404);
  });

  it("PATCH /api/v1/users/:id -> 400 status inválido", async () => {
    prisma.vagaLivreRegisteredUsers.findUnique.mockResolvedValue(user);

    const res = await request(app).patch("/api/v1/users/user-demo").send({ status: "ativo" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("status inválido.");
  });

  it("PATCH /api/v1/users/:id -> 400 sem campos", async () => {
    prisma.vagaLivreRegisteredUsers.findUnique.mockResolvedValue(user);

    const res = await request(app).patch("/api/v1/users/user-demo").send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Nenhum campo para atualizar.");
  });

  it("PATCH /api/v1/users/:id -> 200", async () => {
    prisma.vagaLivreRegisteredUsers.findUnique.mockResolvedValue(user);
    prisma.vagaLivreRegisteredUsers.update.mockResolvedValue({ ...user, status: "denied" });

    const res = await request(app).patch("/api/v1/users/user-demo").send({ status: "denied" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("denied");
  });

  it("PATCH /api/v1/users/:id -> 409 email duplicado", async () => {
    prisma.vagaLivreRegisteredUsers.findUnique.mockResolvedValue(user);
    prisma.vagaLivreRegisteredUsers.update.mockRejectedValue({ code: "P2002" });

    const res = await request(app)
      .patch("/api/v1/users/user-demo")
      .send({ email: "jaexiste@vagalivre.com" });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Este email já está cadastrado.");
  });

  it("DELETE /api/v1/users/:id -> 404", async () => {
    prisma.vagaLivreRegisteredUsers.findUnique.mockResolvedValue(null);

    const res = await request(app).delete("/api/v1/users/nao-existe");

    expect(res.status).toBe(404);
  });

  it("DELETE /api/v1/users/:id -> 200", async () => {
    prisma.vagaLivreRegisteredUsers.findUnique.mockResolvedValue(user);
    prisma.vagaLivreRegisteredUsers.delete.mockResolvedValue(user);

    const res = await request(app).delete("/api/v1/users/user-demo");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Usuário excluído com sucesso.");
  });
});
