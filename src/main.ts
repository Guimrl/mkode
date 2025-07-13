import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { I18nService } from 'nestjs-i18n'
import { I18nValidationExceptionFilter } from './common/filters/i18n-validation-exception.filter'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  )

  const i18n = app.get<I18nService<Record<string, any>>>(I18nService)
  app.useGlobalFilters(new I18nValidationExceptionFilter(i18n))

  await app.listen(3000)
}
bootstrap()
