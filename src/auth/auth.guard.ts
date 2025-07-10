import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { jwtConstants } from './constants'
import { I18nService } from 'nestjs-i18n'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private i18nService: I18nService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const token = this.extractTokenFromHeader(request)

    const lang = request.headers['accept-language'] || 'en'

    if (!token) {
      throw new UnauthorizedException(
        await this.i18nService.translate('auth.token_missing', {
          lang,
        })
      )
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      })

      request['user'] = payload
    } catch (error) {
      throw new UnauthorizedException(
        await this.i18nService.translate('auth.invalid_token', {
          lang,
        })
      )
    }

    return true
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}
