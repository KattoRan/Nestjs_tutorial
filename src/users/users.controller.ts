import {
  Controller,
  Get,
  UseGuards,
  Request,
  Body,
  Patch,
  Post,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { CurrentUser } from 'src/auth/types/current-user.interface';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@GetUser() user: User) {
    const fullUserInfo = await this.usersService.findById(user.id);
    return fullUserInfo;
  }

  @Patch('user')
  updateProfile(@GetUser() user: User, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(user.id, updateUserDto);
  }

  @Post('profiles/:username/follow')
  async followUser(
    @GetUser() currentUser: CurrentUser,
    @Param('username') username: string,
  ) {
    return this.usersService.followUser(currentUser, username);
  }

  @Delete('profiles/:username/follow')
  async unfollowUser(
    @GetUser() currentUser: CurrentUser,
    @Param('username') username: string,
  ) {
    return this.usersService.unfollowUser(currentUser, username);
  }
}
