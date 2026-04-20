import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strips away properties that are not in the DTO
    forbidNonWhitelisted: true, // Throws error if extra properties are sent
    transform: true, // Automatically transforms payloads to DTO instances
  }));
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
