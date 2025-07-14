import { Controller, Get, Param, ParseIntPipe, UseGuards, UseInterceptors } from '@nestjs/common'
import { AuthGuard } from '../auth/auth.guard'
import { UserService } from './user.service'
import { CacheInterceptor } from '../common/interceptors/cache/cache.interceptor'

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(AuthGuard)
  @UseInterceptors(CacheInterceptor)
  @Get('users')
  async findAll() {
    return this.userService.findAll()
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(CacheInterceptor)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findById(id)
  }
}
