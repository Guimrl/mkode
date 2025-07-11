import { Injectable } from '@nestjs/common'
import { PrismaService } from '../common/database/prisma/prisma.service'

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async users() {
    return await this.prismaService.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
    })
  }
}
