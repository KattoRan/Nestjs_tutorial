import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
  }

  async findByName(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        username: username,
      },
    });
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (user) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const dataToUpdate: Prisma.UserUpdateInput = {};

    if (updateUserDto.username) {
      dataToUpdate.username = updateUserDto.username;
    }
    
    if (updateUserDto.bio) {
      dataToUpdate.bio = updateUserDto.bio;
    }

    if (updateUserDto.avatar) {
      dataToUpdate.avatar = updateUserDto.avatar;
    }

    if (updateUserDto.password) {
      const saltRounds = 10;
      dataToUpdate.password = await bcrypt.hash(
        updateUserDto.password,
        saltRounds,
      );
    }
    
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });
    
    const { password, ...result } = updatedUser;
    return result;
  }

}
