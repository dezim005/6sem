const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const { prisma } = require("./lib/prisma");

const app = express();
const PORT = process.env.PORT || 3000;
const TOKEN_SECRET = process.env.JWT_SECRET || "vaga-livre-dev";

app.use(cors({ origin: true }));
app.use(express.json());

function toUserDto(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    registrationDate: user.registrationDate,
    avatarUrl: user.avatarUrl,
    dateOfBirth: user.dateOfBirth,
    apartment: user.apartment,
    cpf: user.cpf,
    phone: user.phone,
    description: user.description,
    condominiumId: user.condominiumId,
  };
}

function signToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + 24 * 60 * 60 * 1000,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", TOKEN_SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function readToken(header) {
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.slice(7);
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expected = crypto.createHmac("sha256", TOKEN_SECRET).update(body).digest("base64url");
  if (expected !== sig) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch (_error) {
    return null;
  }
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/v1/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Campos obrigatórios: email, password." });
    }

    const user = await prisma.vagaLivreRegisteredUsers.findUnique({
      where: { email },
    });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Email ou senha inválidos." });
    }

    if (user.status === "pending") {
      return res.status(403).json({
        message: "Sua conta está aguardando aprovação pelo síndico.",
      });
    }

    if (user.status === "denied") {
      return res.status(403).json({
        message: "Seu acesso foi negado pelo síndico.",
      });
    }

    if (user.status !== "approved") {
      return res.status(403).json({
        message: "O status da sua conta não permite o login.",
      });
    }

    res.json({
      message: "Login realizado com sucesso.",
      data: {
        token: signToken(user),
        user: toUserDto(user),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao autenticar." });
  }
});

app.get("/api/v1/auth/me", async (req, res) => {
  try {
    const payload = readToken(req.headers.authorization);
    if (!payload) {
      return res.status(401).json({ message: "Token inválido ou expirado." });
    }

    const user = await prisma.vagaLivreRegisteredUsers.findUnique({
      where: { id: payload.id },
    });

    if (!user || user.status !== "approved") {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }

    res.json({ data: toUserDto(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao validar sessão." });
  }
});

app.post("/api/v1/auth/logout", (_req, res) => {
  res.json({ message: "Logout realizado com sucesso." });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Autenticação em http://localhost:${PORT}`);
  });
}

module.exports = app;
