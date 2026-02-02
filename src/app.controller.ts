import { Controller, Get, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import type { Request, Response } from 'express';

@Controller() //controllers are responsible  for handling a group of relevant requests
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Req() request: Request, @Res() response: Response): string {
    return this.appService.getHello(request,response);
  }
}


// import { Controller, Get, Req, Res } from '@nestjs/common';
// import { AppService } from './app.service';
// import type { Request, Response } from 'express';

// @Controller() //controllers are responsible  for handling a group of relevant requests
// export class AppController {
//   constructor(private readonly appService: AppService) {}

//   @Get() // Route decorator
//   findAll(@Req() request: Request): string {
//     // ← Method handler signature
//     return 'This action returns all cats'; // ← Method handler body
//   }
//   // ↑ The entire thing is the method handler
// }

