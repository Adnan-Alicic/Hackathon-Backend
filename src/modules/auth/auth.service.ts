import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  async verifyUser(email: string, password: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        email: email,
        password: password,
      },
    });

    if (!user) throw new Error('User not found');

    return user;
  }

  async createUser(email: string, fullName: string, password: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        email: email,
      },
    });
    if (user) throw new Error('User with these credentials already exists');

    return this.userService.createUser({ email, fullName, password });
  }
}
