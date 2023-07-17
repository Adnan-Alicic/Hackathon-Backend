import { Module } from '@nestjs/common';
import { GPTService } from '../gpt/gpt.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { MealControler } from './meal.controller';
import { MealsService } from './meals.service';

@Module({
  providers: [PrismaService, MealsService, GPTService, UserService],
  exports: [MealsService],
  controllers: [MealControler],
})
export class MealModule {}
