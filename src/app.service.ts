import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from './modules/prisma/prisma.service';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(private readonly prismaService: PrismaService) {}
  async onApplicationBootstrap() {
    const found = await this.prismaService.settings.findUnique({
      where: {
        name: 'DEMO',
      },
    });

    if (!found) {
      await this.prismaService.settings.create({
        data: {
          name: 'DEMO',
          config: {
            foo: true,
          },
        },
      });
    }

    const foundSecond = await this.prismaService.settings.findFirst({
      where: {
        name: 'DEMO',
      },
    });

    if (foundSecond) {
      console.log('**** Bootstrap success! ****');
      return;
    }
    console.error('Something went wrong with application bootstrap!');
  }
  getHello(): string {
    return 'Hello World!';
  }
}
