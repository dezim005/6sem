import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

const prisma = {
  vagaLivreRegisteredUsers: {
    findUnique: vi.fn(),
  },
};

globalThis.__PRISMA__ = prisma;

const { default: app } = await import("../server.js");

const approvedUser = {
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

describe("API de autenticação (Pedro)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /health -> 200", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("POST /api/v1/auth/login -> 400 sem campos", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Campos obrigatórios: email, password.");
  });

  it("POST /api/v1/auth/login -> 401 senha errada", async () => {
    prisma.vagaLivreRegisteredUsers.findUnique.mockResolvedValue(approvedUser);

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: approvedUser.email, password: "errada" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Email ou senha inválidos.");
  });

  it("POST /api/v1/auth/login -> 401 usuário inexistente", async () => {
    prisma.vagaLivreRegisteredUsers.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "nao@existe.com", password: "123456" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Email ou senha inválidos.");
  });

  it("POST /api/v1/auth/login -> 403 conta pendente", async () => {
    prisma.vagaLivreRegisteredUsers.findUnique.mockResolvedValue({
      ...approvedUser,
      status: "pending",
    });

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: approvedUser.email, password: "123456" });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/aguardando aprovação/i);
  });

  it("POST /api/v1/auth/login -> 403 conta negada", async () => {
    prisma.vagaLivreRegisteredUsers.findUnique.mockResolvedValue({
      ...approvedUser,
      status: "denied",
    });

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: approvedUser.email, password: "123456" });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/acesso foi negado/i);
  });

  it("POST /api/v1/auth/login -> 200 e devolve token", async () => {
    prisma.vagaLivreRegisteredUsers.findUnique.mockResolvedValue(approvedUser);

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: approvedUser.email, password: "123456" });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeTruthy();
    expect(res.body.data.user.email).toBe(approvedUser.email);
    expect(res.body.data.user).not.toHaveProperty("password");
  });

  it("GET /api/v1/auth/me -> 401 sem token", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Token inválido ou expirado.");
  });

  it("GET /api/v1/auth/me -> 200 com token válido", async () => {
    prisma.vagaLivreRegisteredUsers.findUnique
      .mockResolvedValueOnce(approvedUser)
      .mockResolvedValueOnce(approvedUser);

    const login = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: approvedUser.email, password: "123456" });

    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${login.body.data.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe("user-demo");
  });

  it("GET /api/v1/auth/me -> 401 se o usuário não estiver aprovado", async () => {
    prisma.vagaLivreRegisteredUsers.findUnique
      .mockResolvedValueOnce(approvedUser)
      .mockResolvedValueOnce({ ...approvedUser, status: "pending" });

    const login = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: approvedUser.email, password: "123456" });

    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${login.body.data.token}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Usuário não autenticado.");
  });

  it("POST /api/v1/auth/logout -> 200", async () => {
    const res = await request(app).post("/api/v1/auth/logout");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Logout realizado com sucesso.");
  });

  it("POST /api/v1/auth/login -> 500 se o banco falhar", async () => {
    prisma.vagaLivreRegisteredUsers.findUnique.mockRejectedValue(new Error("db"));

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: approvedUser.email, password: "123456" });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Erro ao autenticar.");
  });
});
