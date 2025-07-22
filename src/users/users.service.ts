import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from 'src/constants/bcrypt.constant';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

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
    if (!user) {
      throw new NotFoundException(this.i18n.translate('user.user_not_found'));
    }
    const { password, ...result } = user;
    return result;
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
      dataToUpdate.password = await bcrypt.hash(
        updateUserDto.password,
        BCRYPT_SALT_ROUNDS,
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
