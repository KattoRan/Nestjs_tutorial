import { Controller, Get, UseGuards, Request, Body, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator/get-user.decorator';

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
}
