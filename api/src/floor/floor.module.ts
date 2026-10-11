import { Module } from '@nestjs/common';
import { FloorController } from './floor.controller.js';
import { FloorService } from './floor.service.js';
import { MenuController } from './menu.controller.js';

@Module({
  controllers: [FloorController, MenuController],
  providers: [FloorService],
})
export class FloorModule {}
