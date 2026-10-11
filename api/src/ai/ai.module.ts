import { Module } from '@nestjs/common';
import { GmModule } from '../gm/gm.module.js';
import { AiController } from './ai.controller.js';
import { AiService } from './ai.service.js';

@Module({ imports: [GmModule], controllers: [AiController], providers: [AiService] })
export class AiModule {}
