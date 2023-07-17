import { Module } from '@nestjs/common';
import { GPTController } from './gpt.controller';
import { GPTService } from './gpt.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [GPTController],
  providers: [GPTService, PrismaService],
  exports: [GPTService],
})
export class GPTModule {}
