import './env.js';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is missing');

  const app = await NestFactory.create(AppModule);
  // The web app runs on a different address, so the browser needs the API's permission to call it.
  app.enableCors({
    origin: (process.env.WEB_ORIGIN ?? 'http://localhost:5173').split(','),
  });
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
