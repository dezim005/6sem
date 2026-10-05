const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const condo = await prisma.vagaLivreCondominiums.upsert({
    where: { id: "condo-demo" },
    update: {},
    create: {
      id: "condo-demo",
      name: "Condomínio Demo",
      address: "Rua Exemplo, 100",
    },
  });

  const user = await prisma.vagaLivreRegisteredUsers.upsert({
    where: { email: "morador@vagalivre.local" },
    update: {},
    create: {
      id: "user-demo",
      name: "Morador Teste",
      email: "morador@vagalivre.local",
      password: "123456",
      role: "resident",
      status: "approved",
      condominiumId: condo.id,
      apartment: "101",
    },
  });

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setDate(end.getDate() + 14);
  end.setHours(23, 59, 59, 999);

  await prisma.vagaLivreParkingSpots.upsert({
    where: { id: "spot-demo" },
    update: {},
    create: {
      id: "spot-demo",
      number: "A-01",
      type: "standard",
      location: "Subsolo 1",
      isAvailable: true,
      ownerId: user.id,
      ownerName: user.name,
      description: "Vaga de teste no Neon",
      availability: [
        {
          id: "slot-demo",
          spotId: "spot-demo",
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          isRecurring: false,
        },
      ],
    },
  });

  console.log("Seed ok: condomínio, morador e vaga A-01.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });