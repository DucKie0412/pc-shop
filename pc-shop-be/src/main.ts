/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 8080;
  app.enableCors({
    origin: true,
    method: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    credentials: true, //allow credentials (cookies) in requests 
  }); //enable cors for all routes

  app.setGlobalPrefix('api/v1', { exclude: ['/'] }); //eg: homepage url don't need /api/v1/homepage
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}
bootstrap();
