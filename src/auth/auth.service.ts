import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ChangePasswordDTO, SignInDTO, SignUpDTO } from './dtos/auth'
import { PrismaService } from 'src/prisma/prisma.service'
import * as bcrypt from 'bcrypt'
import { I18nService } from 'nestjs-i18n'
// Importe tanto CACHE_MANAGER quanto Cache do mesmo pacote
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private i18nService: I18nService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async signup(data: SignUpDTO, lang: string) {
    const userAlreadyExists = await this.prismaService.user.findUnique({
      where: {
        email: data.email,
      },
    })

    if (userAlreadyExists) {
      throw new UnauthorizedException(
        await this.i18nService.translate('auth.user_already_exists', { lang })
      )
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await this.prismaService.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    })

    console.log('data', { data })
    return {
      id: user.id,
      email: user.email,
    }
  }

  async signin(data: SignInDTO, lang: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: data.email,
      },
    })

    if (!user)
      throw new UnauthorizedException(
        await this.i18nService.translate('auth.invalid_credentials', { lang })
      )

    const passwordMatch = await bcrypt.compare(data.password, user.password)

    if (!passwordMatch)
      throw new UnauthorizedException(
        await this.i18nService.translate('auth.invalid_credentials', { lang })
      )

    const accessToken = await this.jwtService.signAsync({
      id: user.id,
      name: user.name,
      email: user.email,
    })

    console.log('data', { data })
    return {
      message: await this.i18nService.translate('auth.user_login_success', {
        lang,
      }),
      accessToken,
    }
  }

  async changepassword(data: ChangePasswordDTO, lang: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: data.email,
      },
    })

    if (!user) {
      throw new UnauthorizedException(
        await this.i18nService.translate('auth.user_not_found', { lang })
      )
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password)

    if (!passwordMatch)
      throw new UnauthorizedException(
        await this.i18nService.translate('auth.password_doest_match', { lang })
      )

    const hashedPassword = await bcrypt.hash(data.newPassword, 10)

    const updatedUser = await this.prismaService.user.update({
      where: { email: user.email },
      data: {
        password: hashedPassword,
      },
    })

    return {
      message: 'senha alterada com sucesso!',
      email: updatedUser.email,
    }
  }
}
