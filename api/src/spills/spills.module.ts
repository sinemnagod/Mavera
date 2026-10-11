import { Module } from '@nestjs/common';
import { SpillsController } from './spills.controller.js';
import { SpillsService } from './spills.service.js';

@Module({ controllers: [SpillsController], providers: [SpillsService] })
export class SpillsModule {}
