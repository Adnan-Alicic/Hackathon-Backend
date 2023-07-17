import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { AuthService } from './modules/auth/auth.service';
import { GPTModule } from './modules/gpt/gpt.module';
import { MealModule } from './modules/meals/meals.module';
import { MealsService } from './modules/meals/meals.service';
import { PrismaService } from './modules/prisma/prisma.service';
import { UserModule } from './modules/user/user.module';
import { UserService } from './modules/user/user.service';

@Module({
  imports: [GPTModule, AuthModule, UserModule, MealModule],
  controllers: [AppController],
  providers: [
    Logger,
    AppService,
    PrismaService,
    AuthService,
    UserService,
    MealsService,
  ],
})
export class AppModule {}
