import { Body, Controller, Post, UnauthorizedException, UseGuards, Request,Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';

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
      throw new UnauthorizedException("Không lấy được thông tin người dùng");
    }
    return this.authService.login(user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt')) // Áp dụng Guard
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
