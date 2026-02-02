import { Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';

@Injectable()
export class AppService {
  getHello(request: Request, response: Response): string {
    return 'Hello World!';
  }
}
