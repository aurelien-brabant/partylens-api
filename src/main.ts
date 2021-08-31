import {ValidationPipe} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  if (process.env.NODE_ENV === 'development') {
    const config = new DocumentBuilder()
    .setTitle('Partylens API')
    .setDescription('Documentation about the RESTful partylens.fr API')
    .setVersion('1.0')
    .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('apidoc', app, document, {
    });
  }

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }))

  await app.listen(process.env.NESTJS_PORT);
}
bootstrap();
