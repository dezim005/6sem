const express = require("express");
const cors = require("cors");
const { prisma } = require("./lib/prisma");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true }));
app.use(express.json());

function toCondoDto(condo) {
  return {
    id: condo.id,
    name: condo.name,
    address: condo.address,
  };
}

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

function newCondoId() {
  return `condo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

function newUserId() {
  return `user-${Date.now()}`;
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/v1/condominiums", async (_req, res) => {
  try {
    const condos = await prisma.vagaLivreCondominiums.findMany({
      orderBy: { name: "asc" },
    });
    res.json({ data: condos.map(toCondoDto) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar condomínios." });
  }
});

app.get("/api/v1/condominiums/:id", async (req, res) => {
  try {
    const condo = await prisma.vagaLivreCondominiums.findUnique({
      where: { id: req.params.id },
    });
    if (!condo) {
      return res.status(404).json({ message: "Condomínio não encontrado." });
    }
    res.json({ data: toCondoDto(condo) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar condomínio." });
  }
});

app.post("/api/v1/condominiums", async (req, res) => {
  try {
    const { name, address } = req.body || {};
    if (!name || !address) {
      return res.status(400).json({ message: "Campos obrigatórios: name, address." });
    }

    const condo = await prisma.vagaLivreCondominiums.create({
      data: {
        id: newCondoId(),
        name,
        address,
      },
    });

    res.status(201).json({
      message: "Condomínio cadastrado com sucesso.",
      data: toCondoDto(condo),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao cadastrar condomínio." });
  }
});

app.get("/api/v1/users", async (req, res) => {
  try {
    const status = typeof req.query.status === "string" ? req.query.status : "";
    const condominiumId =
      typeof req.query.condominiumId === "string" ? req.query.condominiumId : "";

    if (status && !["pending", "approved", "denied"].includes(status)) {
      return res.status(400).json({ message: "status inválido." });
    }

    const users = await prisma.vagaLivreRegisteredUsers.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(condominiumId ? { condominiumId } : {}),
      },
      orderBy: { name: "asc" },
    });

    res.json({ data: users.map(toUserDto) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar usuários." });
  }
});

app.get("/api/v1/users/:id", async (req, res) => {
  try {
    const user = await prisma.vagaLivreRegisteredUsers.findUnique({
      where: { id: req.params.id },
    });
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }
    res.json({ data: toUserDto(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar usuário." });
  }
});

app.post("/api/v1/users", async (req, res) => {
  try {
    const { name, email, password, condominiumId } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Campos obrigatórios: name, email, password.",
      });
    }

    const existing = await prisma.vagaLivreRegisteredUsers.findUnique({
      where: { email },
    });
    if (existing) {
      return res.status(409).json({ message: "Este email já está cadastrado." });
    }

    const totalUsers = await prisma.vagaLivreRegisteredUsers.count();
    const isFirstUser = totalUsers === 0;
    const role = isFirstUser ? "manager" : "resident";
    const status = isFirstUser ? "approved" : "pending";

    if (role === "resident" && !condominiumId) {
      return res.status(400).json({
        message:
          "Moradores devem selecionar um condomínio. Se nenhum estiver disponível, peça ao síndico para cadastrar.",
      });
    }

    if (condominiumId) {
      const condo = await prisma.vagaLivreCondominiums.findUnique({
        where: { id: condominiumId },
      });
      if (!condo) {
        return res.status(404).json({ message: "Condomínio não encontrado." });
      }
    }

    const user = await prisma.vagaLivreRegisteredUsers.create({
      data: {
        id: newUserId(),
        name,
        email,
        password,
        role,
        status,
        registrationDate: new Date().toISOString(),
        avatarUrl: `https://placehold.co/40x40.png?text=${encodeURIComponent(
          name[0] ? name[0].toUpperCase() : "U"
        )}`,
        dateOfBirth: "",
        apartment: "",
        cpf: "",
        phone: "",
        description: "",
        condominiumId: role === "resident" ? condominiumId : null,
      },
    });

    const message = isFirstUser
      ? "Cadastro realizado com sucesso! Você foi registrado como Síndico e sua conta está ativa."
      : "Cadastro realizado com sucesso! Seu cadastro como Morador foi recebido e está aguardando aprovação do síndico.";

    res.status(201).json({ message, data: toUserDto(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao cadastrar usuário." });
  }
});

app.patch("/api/v1/users/:id", async (req, res) => {
  try {
    const existing = await prisma.vagaLivreRegisteredUsers.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    const allowed = [
      "name",
      "email",
      "password",
      "status",
      "avatarUrl",
      "dateOfBirth",
      "apartment",
      "cpf",
      "phone",
      "description",
      "condominiumId",
    ];

    const data = {};
    for (const field of allowed) {
      if (req.body && Object.prototype.hasOwnProperty.call(req.body, field)) {
        data[field] = req.body[field];
      }
    }

    if (data.status && !["pending", "approved", "denied"].includes(data.status)) {
      return res.status(400).json({ message: "status inválido." });
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: "Nenhum campo para atualizar." });
    }

    const user = await prisma.vagaLivreRegisteredUsers.update({
      where: { id: existing.id },
      data,
    });

    res.json({
      message: "Usuário atualizado com sucesso.",
      data: toUserDto(user),
    });
  } catch (error) {
    if (error && error.code === "P2002") {
      return res.status(409).json({ message: "Este email já está cadastrado." });
    }
    console.error(error);
    res.status(500).json({ message: "Erro ao atualizar usuário." });
  }
});

app.delete("/api/v1/users/:id", async (req, res) => {
  try {
    const existing = await prisma.vagaLivreRegisteredUsers.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    await prisma.vagaLivreRegisteredUsers.delete({
      where: { id: existing.id },
    });

    res.json({ message: "Usuário excluído com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao excluir usuário." });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Usuários e condomínios em http://localhost:${PORT}`);
  });
}

module.exports = app;
