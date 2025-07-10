import { Body, Controller, Get, Post, Request, UseGuards, Headers } from '@nestjs/common'
import { ChangePasswordDTO, SignInDTO, SignUpDTO } from './dtos/auth'
import { AuthService } from './auth.service'
import { AuthGuard } from './auth.guard'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: SignUpDTO, @Headers('accept-language') lang: string = 'en') {
    return this.authService.signup(body, lang)
  }

  @Post('signin')
  async signin(@Body() body: SignInDTO, @Headers('accept-language') lang: string = 'en') {
    return this.authService.signin(body, lang)
  }

  @Post('changepassword')
  async changepassword(
    @Body() body: ChangePasswordDTO,
    @Headers('accept-language') lang: string = 'en'
  ) {
    return this.authService.changepassword(body, lang)
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async me(@Request() request) {
    return request.user
  }
}
