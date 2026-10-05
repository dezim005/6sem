import { PrismaClient, UserRole, UserStatus, ParkingSpotType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Limpando o banco de dados...');
  // A ordem de deleção é importante para evitar erros de foreign key
  await prisma.notification.deleteMany();
  await prisma.vagaLivreReservations.deleteMany();
  await prisma.vagaLivreParkingSpots.deleteMany();
  await prisma.vagaLivreRegisteredUsers.deleteMany();
  await prisma.vagaLivreCondominiums.deleteMany();
  await prisma.vagaLivreAuth.deleteMany();

  console.log('Iniciando o seed...');

  // 1. Criar Condomínio
  const condominium = await prisma.vagaLivreCondominiums.create({
    data: {
      id: 'condo-001',
      name: 'Condomínio Residencial das Flores',
      address: 'Rua das Flores, 123 - Centro',
    },
  });

  // 2. Criar Usuários (Síndico/Gerente e Morador)
  const manager = await prisma.vagaLivreRegisteredUsers.create({
    data: {
      id: 'user-manager-001',
      name: 'Carlos Síndico',
      email: 'carlos.sindico@email.com',
      password: 'hashed_password_123',
      role: UserRole.manager,
      status: UserStatus.approved,
      registrationDate: new Date().toISOString(),
      condominiumId: condominium.id,
      cpf: '111.222.333-44',
      phone: '(11) 99999-9999',
    },
  });

  const resident = await prisma.vagaLivreRegisteredUsers.create({
    data: {
      id: 'user-resident-001',
      name: 'Ana Moradora',
      email: 'ana.moradora@email.com',
      password: 'hashed_password_456',
      role: UserRole.resident,
      status: UserStatus.approved,
      registrationDate: new Date().toISOString(),
      apartment: '101A',
      condominiumId: condominium.id,
      cpf: '555.666.777-88',
      phone: '(11) 98888-8888',
    },
  });

  // 3. Criar Vagas de Garagem
  const spot1 = await prisma.vagaLivreParkingSpots.create({
    data: {
      id: 'spot-001',
      number: 'A-10',
      type: ParkingSpotType.standard,
      location: 'Subsolo 1',
      isAvailable: true,
      ownerId: resident.id,
      ownerName: resident.name,
      description: 'Vaga vinculada ao apto 101A',
      availability: JSON.stringify([{ day: 'all', hours: '24h' }]),
    },
  });

  const spot2 = await prisma.vagaLivreParkingSpots.create({
    data: {
      id: 'spot-002',
      number: 'B-20',
      type: ParkingSpotType.suv,
      location: 'Térreo',
      isAvailable: false, // Será ocupada pela reserva abaixo
      description: 'Vaga para visitantes/rotativa',
      availability: JSON.stringify([{ day: 'weekends', hours: '08:00-22:00' }]),
    },
  });

  // 4. Criar Reserva
  const startTime = new Date();
  const endTime = new Date();
  endTime.setHours(endTime.getHours() + 4); // Reserva de 4 horas

  const reservation = await prisma.vagaLivreReservations.create({
    data: {
      id: 'res-001',
      spotId: spot2.id,
      userId: resident.id,
      startTime: startTime,
      endTime: endTime,
      vehiclePlate: 'ABC-1234',
    },
  });

  // Atualizar a vaga 2 para refletir a reserva atual (relacionamento 1:1)
  await prisma.vagaLivreParkingSpots.update({
    where: { id: spot2.id },
    data: { currentReservationId: reservation.id },
  });

  // 5. Criar Notificação para o Morador
  await prisma.notification.create({
    data: {
      userId: resident.id,
      title: 'Reserva Confirmada',
      message: `Sua reserva para a vaga ${spot2.number} foi confirmada com sucesso.`,
      type: 'RESERVA_CONFIRMADA',
      read: false,
    },
  });

  // 6. Criar Estado de Autenticação (Opcional, mas consta no schema)
  await prisma.vagaLivreAuth.create({
    data: {
      id: 'current',
      isAuthenticated: true,
      user: JSON.stringify({ id: resident.id, name: resident.name, role: resident.role }),
    },
  });

  console.log('Seed concluído com sucesso! Banco populado.');
}

main()
  .catch((e) => {
    console.error('Erro ao executar o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });