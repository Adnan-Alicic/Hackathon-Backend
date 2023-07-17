import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { PrismaService } from './modules/prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const logger = app.get(Logger);
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  await app.listen(5001, () => {
    logger.debug('************************************');
    logger.debug('***                              ***');
    logger.debug('*** Backend running on port 5001 ***');
    logger.debug('***    http://localhost:5001     ***');
    logger.debug('***                              ***');
    logger.debug('************************************');
  });
}
bootstrap();
