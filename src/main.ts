import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import * as cookieParser from 'cookie-parser'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  // const config = app.get(AppConfigService)

  app.use(cookieParser())
  // app.enableCors(config.corsConfig)
  app.useGlobalPipes(new ValidationPipe())

  await app.listen(process.env.NEST_PORT || 3200)
}
bootstrap()
