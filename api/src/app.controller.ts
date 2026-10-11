import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators.js';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Open to everyone: Render uses this to check the API is alive.
  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
