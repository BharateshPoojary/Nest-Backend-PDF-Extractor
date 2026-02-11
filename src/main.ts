import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app: INestApplication =
    await NestFactory.create<NestExpressApplication>(AppModule, {
      abortOnError: false,
    });
  await app.listen(3000);
}
bootstrap();
