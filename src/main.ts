import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import * as cookieParser from 'cookie-parser'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  // const config = app.get(AppConfigService)

  app.use(cookieParser())
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))
  // app.enableCors(config.corsConfig)
  app.useGlobalPipes(new ValidationPipe())

  await app.listen(process.env.NEST_PORT || 3200)
}
bootstrap()
