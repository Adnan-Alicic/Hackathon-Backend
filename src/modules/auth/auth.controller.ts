import { Body, Controller, Post } from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async userLogin(
    @Body() body: { email: string; password: string },
  ): Promise<User> {
    return this.authService.verifyUser(body.email, body.password);
  }

  @Post('/signup')
  async userSignup(
    @Body() body: { email: string; password: string; fullName: string },
  ): Promise<User> {
    return this.authService.createUser(
      body.email,
      body.fullName,
      body.password,
    );
  }
}
