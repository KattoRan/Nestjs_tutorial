import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from './dto/signup.dto';
import { User } from '@prisma/client';
import { SignInDto } from './dto/signin.dto';
import { BCRYPT_SALT_ROUNDS } from 'src/constants/bcrypt.constant';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly i18n: I18nService,
  ) {}
  /**
   * Đăng ký
   * @param signUpDto
   */
  async signUp(signUpDto: SignUpDto) {
    const { email, username, password } = signUpDto;

    const existingUser = await this.usersService.findOne(email);
    if (existingUser) {
      throw new ConflictException(this.i18n.translate('auth.email_exists'));
    }

    const existingUsername = await this.usersService.findByName(username);
    if (existingUsername) {
      throw new ConflictException(this.i18n.translate('auth.username_exists'));
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const user = await this.usersService.create({
      email,
      username,
      password: hashedPassword,
      avatar: '',
    });
    return this.login(user);
  }

  /**
   * Đăng nhập
   * @param user
   */
  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * validate user
   * @param email
   * @param password
   */
  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new UnauthorizedException(
        this.i18n.translate('auth.email_not_exists'),
      );
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      user?.password ?? '',
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        this.i18n.translate('auth.invalid_password'),
      );
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
