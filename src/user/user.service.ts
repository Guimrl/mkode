import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../common/database/prisma/prisma.service'
import { I18nService } from 'nestjs-i18n'

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private i18nService: I18nService
  ) {}

  async findAll() {
    return await this.prismaService.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
    })
  }

  async findById(id: number) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    if (!user) {
      throw new NotFoundException(
        await this.i18nService.translate('user.not_found', {
          args: { id: id },
        })
      )
    }

    return user
  }
}
