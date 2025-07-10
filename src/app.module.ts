import { Module } from '@nestjs/common'
import { CacheModule } from '@nestjs/cache-manager'
import { AuthModule } from './auth/auth.module'
import { PrismaService } from './prisma/prisma.service'
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n'
import { UserModule } from './user/user.module'
import * as path from 'path'
import redisStore from 'cache-manager-ioredis'
import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [
    AuthModule,
    UserModule,
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
        include: ['**/*.json'],
      },
      resolvers: [{ use: QueryResolver, options: ['lang'] }, AcceptLanguageResolver],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: redisStore,
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379'),
        ttl: 60,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [PrismaService, AppService],
})
export class AppModule {}
