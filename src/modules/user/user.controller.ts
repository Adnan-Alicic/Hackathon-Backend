import { Body, Controller, Post } from '@nestjs/common';
import { PreferencesDto } from './dto/preferences-dto';
import { UserService } from './user.service';


@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}


  @Post('/update')
  async addPreferences(
    @Body() body: { preferences: PreferencesDto, userId: string },
  ): Promise<any> {
    const { preferences, userId } = body;

    return this.userService.addUserPreferences(preferences, userId);
  }
}

