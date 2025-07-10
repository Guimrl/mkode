import { Controller, Get, UseGuards } from '@nestjs/common'
import { AuthGuard } from 'src/auth/auth.guard'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get('users')
  async users() {
    return this.userService.users()
  }
}
