import { PrismaClient, Perfil, TipoVaga } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Criar Usuário Administrador de Teste
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@vagalivre.com' },
    update: {},
    create: {
      nome: 'Síndico Administrativo',
      email: 'admin@vagalivre.com',
      senha: '$2b$10$hashedpasswordplaceholder', // bcrypt hash real na implementação
      perfil: Perfil.SINDICO,
      apartamento: '000',
      bloco: 'AD',
      celular: '11999999999',
    },
  });

  // 2. Mapear Vagas Iniciais no Condomínio
  const vagasIniciais = [
    { numero: 101, tipo: TipoVaga.COBERTA },
    { numero: 102, tipo: TipoVaga.COBERTA },
    { numero: 103, tipo: TipoVaga.DESCOBERTA },
  ];

  for (const vaga of vagasIniciais) {
    await prisma.vaga.upsert({
      where: { numero: vaga.numero },
      update: {},
      create: {
        numero: vaga.numero,
        tipo: vaga.tipo,
        status: 'LIVRE',
      },
    });
  }

  console.log('Seed executado com sucesso: Admin e vagas mapeadas!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });