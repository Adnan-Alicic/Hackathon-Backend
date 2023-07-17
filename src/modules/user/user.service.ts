import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user-dto';
import { PreferencesDto } from './dto/preferences-dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) { }

  async createUser(userData: CreateUserDto) {
    return this.prismaService.user.create({
      data: {
        ...userData,
      },
    });
  }

  async addUserPreferences(preferences: PreferencesDto, userId: string) {
    const user = this.prismaService.user.findUnique({
      where: {
        id: userId,

      }

    })
    if (!user) {
      throw new Error("User is not found!")

    }
    return this.prismaService.user.upsert({
      where: {
        id: userId,
      },
      update: {

        ...preferences,
      },
      create: {
        email: "unesimail",
        fullName: "LALA LALIC",
        password: "sifra",
        ...preferences,
      },
    });
  }
}
