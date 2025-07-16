import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
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

  async validate(payload: { sub: number; email: string }) {
    const user = await this.usersService.findOne(payload.email);
    if (!user) {
      throw new UnauthorizedException('User not found or token is invalid');
    }
    return {
      id: payload.sub,
      email: payload.email,
      username: user.username,
      avatar: user.avatar,
    };
  }
}
