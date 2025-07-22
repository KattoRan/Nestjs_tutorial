import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { I18nService } from 'nestjs-i18n';

@Controller('api/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly i18n: I18nService,
  ) {}

  @Post('signup')
  async signup(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('sign-in')
  async signin(@Body() signInDto: SignInDto) {
    const { email, password } = signInDto;
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException(
        this.i18n.translate('auth.invalid_credentials'),
      );
    }
    return this.authService.login(user);
  }
}
