import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter } from '@nestjs/common'
import { I18nService } from 'nestjs-i18n'

@Catch(BadRequestException)
export class I18nValidationExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}

  async catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    const status = exception.getStatus()
    const responseBody = exception.getResponse() as any

    if (typeof responseBody === 'object' && Array.isArray(responseBody.message)) {
      const messages = await Promise.all(
        responseBody.message.map(async (msg) => {
          return this.i18n.translate(msg, {
            lang: request.i18nLang || request.headers['accept-language'] || 'en',
          })
        })
      )

      return response.status(status).json({
        statusCode: status,
        errors: messages,
      })
    }

    return response.status(status).json(responseBody)
  }
}
