import { Controller, Get, Body, Post } from '@nestjs/common';
import { Meal } from '@prisma/client';
import { MealsService } from './meals.service';

@Controller('meal')
export class MealControler {
  constructor(private readonly mealService: MealsService) {}

  @Post('/weekly-plan')
  async weeklyPlan(@Body() body: { userId: string }): Promise<any> {
    return this.mealService.getWeeklyScheduleForUser(body.userId);
  }

  @Post('/get-meal')
  async getMeal(
    @Body() body: { title: string; excluded: string },
  ): Promise<any> {
    const { title, excluded } = body;

    return this.mealService.getMeal(title, excluded);
  }

  @Post('/get-dbweeklyschedule')
  async dbweeklyschedule(
    @Body() body: { userId: string },
  ): Promise<any> {
    const { userId } = body;

    return this.mealService.getDBWeeklySchedule(userId);
  }

  @Post('/get-daily-meals')
  async getDailyMeals( @Body() body: { userId: string, day: string },): Promise<any> {
    const { userId, day} = body;
    return this.mealService.getDailyMeals(userId, day)
  }
}
