import { Body, Controller, Post, UnauthorizedException} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('sign-in')
  async signin(@Body() signInDto: SignInDto) {
    const {email, password} = signInDto;
    const user = await this.authService.validateUser(email,password);
    if (!user)
    {
      throw new UnauthorizedException("Thông tin đăng nhập ko hợp lệ");
    }
    return this.authService.login(user);
  }

}
