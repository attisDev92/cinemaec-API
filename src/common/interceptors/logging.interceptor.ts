import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { Request, Response } from 'express'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP')

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()
    const { method, url, body, query, params, ip } = request
    const userAgent = request.get('user-agent') || ''
    const startTime = Date.now()

    // Log de solicitud entrante
    this.logger.log(
      `📨 [REQUEST] ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`,
    )

    if (Object.keys(body || {}).length > 0) {
      // Ocultar contraseñas en los logs
      const sanitizedBody = this.sanitizeBody(body)
      this.logger.debug(`Body: ${JSON.stringify(sanitizedBody)}`)
    }

    if (Object.keys(query || {}).length > 0) {
      this.logger.debug(`Query: ${JSON.stringify(query)}`)
    }

    if (Object.keys(params || {}).length > 0) {
      this.logger.debug(`Params: ${JSON.stringify(params)}`)
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - startTime
          const statusCode = response.statusCode

          this.logger.log(
            `✅ [RESPONSE] ${method} ${url} - Status: ${statusCode} - ${responseTime}ms`,
          )

          // Log del body de respuesta solo en desarrollo
          if (process.env.NODE_ENV === 'development' && data) {
            this.logger.debug(
              `Response Body: ${JSON.stringify(data).substring(0, 500)}${JSON.stringify(data).length > 500 ? '...' : ''}`,
            )
          }
        },
        error: (error) => {
          const responseTime = Date.now() - startTime
          const statusCode = error.status || 500

          this.logger.error(
            `❌ [ERROR] ${method} ${url} - Status: ${statusCode} - ${responseTime}ms`,
          )
          this.logger.error(`Error: ${error.message}`)

          if (error.stack && process.env.NODE_ENV === 'development') {
            this.logger.debug(`Stack: ${error.stack}`)
          }
        },
      }),
    )
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') return body

    const sanitized = { ...body }
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey']

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***HIDDEN***'
      }
    }

    return sanitized
  }
}
