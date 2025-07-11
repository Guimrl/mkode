import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable, of, tap } from 'rxjs'
import { Redis } from 'ioredis'
import { REDIS_CLIENT } from 'src/redis/redis.module'

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

  private generateCacheKey(request: any): string {
    const userId = request.user?.id || 'anonymous'
    return `${userId}-${request.method}-${request.originalUrl}`
  }

  async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest()

    if (request.method !== 'GET') {
      return next.handle()
    }

    const cacheKey = this.generateCacheKey(request)

    const cachedData = await this.redisClient.get(cacheKey)

    if (cachedData) {
      console.log(`CACHE HIT: Retornando do Redis para a chave: ${cacheKey}`)
      return of(JSON.parse(cachedData))
    }

    console.log(`CACHE MISS: Buscando do banco para a chave: ${cacheKey}`)

    return next.handle().pipe(
      tap(async (data) => {
        const dataToStore = JSON.stringify(data)
        await this.redisClient.set(cacheKey, dataToStore, 'EX', 60)
      })
    )
  }
}
