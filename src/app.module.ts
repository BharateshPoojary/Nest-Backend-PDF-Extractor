import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(''),
  ], //environment variable key/value pairs are parsed and resolved loaded in process.env adnd now   The forRoot() method registers the ConfigService provider, which provides a get() method for reading these parsed/merged configuration variables.
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
