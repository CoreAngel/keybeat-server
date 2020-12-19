import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

@Controller()
export class UserController {
  constructor(private readonly appService: UserService) {}

  // @Get()
  // async getHello(): Promise<User> {
  //   return this.appService.getUser();
  // }
}
