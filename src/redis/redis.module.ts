import { Global, Module } from '@nestjs/common'
import { Redis } from 'ioredis'

export const REDIS_CLIENT = 'REDIS_CLIENT'

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        const client = new Redis({
          host: 'localhost',
          port: 6379,
        })

        client.on('error', (err) => {
          console.error('Erro na conexão com o Redis:', err)
        })

        return client
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
