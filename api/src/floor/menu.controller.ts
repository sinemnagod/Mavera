import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Controller('menu')
export class MenuController {
  constructor(private readonly prisma: PrismaService) {}

  // Every signed-in role may read the menu.
  @Get()
  list() {
    return this.prisma.menuItem.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] });
  }
}
