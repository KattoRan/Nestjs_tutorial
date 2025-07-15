// Chứa logic xử lý đăng nhập, đăng ký, đăng xuất
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from './dto/signup.dto';
import { User } from '@prisma/client';
import { SignInDto } from './dto/signin.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}
  /**
   * Đăng ký
   * @param signUpDto
   */
  async signUp(signUpDto: SignUpDto) {
    const {email, username, password} = signUpDto;

    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await this.usersService.findOne(email);
    if (existingUser) {
      throw new ConflictException('Email đã tồn tại');
    }

    // Kiểm tra xem username đã tồn tại chưa
    const existingUsername = await this.usersService.findOne(username);
    if (existingUsername) {
      throw new ConflictException('Username đã tồn tại');
    }

    // Mã hóa password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Tạo user mới
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
  async validateUser(email: string, password: string): Promise<Omit<User, 'password'>> {
  const user = await this.usersService.findOne(email);
  if (!user) {
    throw new UnauthorizedException('Email không tồn tại');
  }
  const isPasswordValid = await bcrypt.compare(password, user?.password ?? '');
  if (!isPasswordValid) {
    throw new UnauthorizedException('Mật khẩu không chính xác');
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

}
