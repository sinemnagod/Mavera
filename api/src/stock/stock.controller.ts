import { Controller, Get } from '@nestjs/common';
import type { AuthUser } from '../common/auth-user.js';
import { CurrentUser, Roles } from '../common/decorators.js';
import { StockService } from './stock.service.js';

@Roles('STORE_MANAGER')
@Controller('stock')
export class StockController {
  constructor(private readonly stock: StockService) {}

  @Get()
  current(@CurrentUser() user: AuthUser) {
    return this.stock.current(user);
  }

  @Get('counts')
  counts(@CurrentUser() user: AuthUser) {
    return this.stock.counts(user);
  }

  @Get('movements')
  movements(@CurrentUser() user: AuthUser) {
    return this.stock.movements(user);
  }

  @Get('variance')
  variance(@CurrentUser() user: AuthUser) {
    return this.stock.variance(user);
  }
}
