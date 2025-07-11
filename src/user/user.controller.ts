import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common'
import { AuthGuard } from '../auth/auth.guard'
import { UserService } from './user.service'
import { CacheInterceptor } from '../common/interceptors/cache/cache.interceptor'

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(AuthGuard)
  @UseInterceptors(CacheInterceptor)
  @Get('users')
  async users() {
    return this.userService.users()
  }
}
