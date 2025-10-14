import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';
// import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

// Trigger redeployment
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // const corsOptions: CorsOptions = {
  //   origin: '*', // Specify the origin of your frontend
  //   methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify the allowed HTTP methods
  //   allowedHeaders: ['Content-Type', 'Authorization'], // Specify the allowed headers
  //   // preflightContinue: false,
  //   // optionsSuccessStatus: 200,
  //   // maxAge: 5,
  // };

  app.use(json({ limit: '10mb' }));

  app.enableCors();
  app.setGlobalPrefix('api/v1');

  await app.listen(5050);
}
bootstrap();
