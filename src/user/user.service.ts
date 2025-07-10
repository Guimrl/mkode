import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async users() {
    // const cacheKey = 'users-list'

    // const cachedUsers = await this.cacheManager.get(cacheKey)

    // console.log('cachedUsers', await this.cacheManager.get(cacheKey))
    // if (cachedUsers) {
    //   console.log('Retornando usuários do CACHE')
    //   return cachedUsers
    // }

    console.log('Buscando usuários do BANCO DE DADOS')
    const users = await this.prismaService.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    // await this.cacheManager.set(cacheKey, users)

    return users
  }
}
