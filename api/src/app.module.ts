import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AiModule } from './ai/ai.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ChecklistsModule } from './checklists/checklists.module.js';
import { CleaningModule } from './cleaning/cleaning.module.js';
import { FloorModule } from './floor/floor.module.js';
import { GmModule } from './gm/gm.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { SpillsModule } from './spills/spills.module.js';
import { StockModule } from './stock/stock.module.js';
import { TicketsModule } from './tickets/tickets.module.js';

@Module({
  imports: [PrismaModule, AuthModule, FloorModule, OrdersModule, TicketsModule, SpillsModule, CleaningModule, ChecklistsModule, StockModule, GmModule, AiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
