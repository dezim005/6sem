import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class ReservaService {
  constructor(private readonly prisma: PrismaService) {}

  async realizarReservaSegura(
    vagaId: string,
    moradorId: string,
    veiculoId: string,
    dataInicio: Date,
    dataFim: Date
  ) {
    // Executa uma transação isolada para garantir a atomicidade da reserva
    return await this.prisma.$transaction(async (tx) => {
      
      // 1. Busca se existe alguma reserva confirmada conflitante no mesmo período (Lock de leitura)
      const conflito = await tx.reserva.findFirst({
        where: {
          vagaId,
          status: 'CONFIRMADA',
          OR: [
            {
              dataInicio: { lte: dataFim },
              dataFim: { gte: dataInicio },
            },
          ],
        },
      });

      if (conflito) {
        throw new ConflictException('A vaga selecionada já foi reservada por outro usuário para o período solicitado.');
      }

      // 2. Cria o registro de reserva de forma atômica
      const novaReserva = await tx.reserva.create({
        data: {
          vagaId,
          moradorId,
          veiculoId,
          dataInicio,
          dataFim,
          status: 'CONFIRMADA',
        },
      });

      // 3. Atualiza o status da vaga para ocupada no escopo da transação
      await tx.vaga.update({
        where: { id: vagaId },
        data: { status: 'OCUPADA' },
      });

      return novaReserva;
    });
  }
}