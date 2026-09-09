import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    // Estabelece a conexão com o PostgreSQL de forma segura ao iniciar o módulo
    await this.$connect();
  }

  async onModuleDestroy() {
    // Garante o encerramento das conexões do pool quando a API for desligada
    await this.$disconnect();
  }
}