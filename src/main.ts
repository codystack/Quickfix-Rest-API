
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';
// import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

// Version: 0.0.7 - Location filtering and transaction module fix - Build: 2025-11-19-18:43
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(json({ limit: '10mb' }));

  app.enableCors({
    origin: ['https://pos.quickfix.ng', 'http://localhost:3000', 'http://localhost:3035', 'http://localhost:3036'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  });
  app.setGlobalPrefix('api/v1');

  await app.listen(5050);
}
bootstrap();