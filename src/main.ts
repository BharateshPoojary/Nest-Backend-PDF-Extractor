import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
// import { NestExpressApplication } from '@nestjs/platform-express';
// import { text } from 'express';

async function bootstrap() {
  const app: INestApplication =
    await NestFactory.create(AppModule, {
      abortOnError: false,
      cors: true,
    });
  // app.use('/notify', text({ type: 'text/plain' }));
  await app.listen(3001);
}
bootstrap();
