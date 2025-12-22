import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export interface JwtPayload {
  userId: number
  sub: number
  email: string
  cedula: string
  role: string
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest()
    return request.user as JwtPayload
  },
)
