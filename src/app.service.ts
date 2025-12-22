import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getHello(): string {
    const port = this.configService.get<string>('PORT')
    const nodeEnv = this.configService.get<string>('NODE_ENV')
    return `The application is running on port ${port} in ${nodeEnv} mode`
  }
}
