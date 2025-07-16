import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  /**
   * Validate sẽ được gọi nếu token hợp lệ.
   * Trả về object sẽ được gắn vào req.user
   */
  async validate(payload: { sub: number; email: string }) {
    const user = await this.usersService.findOne(payload.email);
    if (!user) {
      throw new UnauthorizedException('User not found or token is invalid');
    }
    return {
      userId: payload.sub,
      email: payload.email,
      username: user.username,
      avatar: user.avatar,
    };
  }
}
