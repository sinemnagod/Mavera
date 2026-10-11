import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

// One shared database connection for the whole API.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error('DATABASE_URL is missing');
    super({ adapter: new PrismaPg({ connectionString }) });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
