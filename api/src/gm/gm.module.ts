import { Module } from '@nestjs/common';
import { GmController } from './gm.controller.js';
import { GmService } from './gm.service.js';

@Module({ controllers: [GmController], providers: [GmService], exports: [GmService] })
export class GmModule {}
