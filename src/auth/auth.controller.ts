import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { RegisterDto } from './dto/register-user.dto';
import { AuthService } from './auth.service';
import { ResponseDto } from '../common/dto/response.dto';
import { LoginDto } from './dto/login-user.dto';

@Controller('/api/v1/auth')
export class AuthController {
  private readonly authService: AuthService;
  constructor(authService: AuthService) {
    this.authService = authService;
  }

  @Post('/sign-in')
  @HttpCode(HttpStatus.OK) 
  public async login(@Body() data: LoginDto) {
    const response = await this.authService.login(data);

    return new ResponseDto(HttpStatus.OK, 'login successful', response);
  }
  @Post('sign-up')
  public async register(@Body() data: RegisterDto) {
    const response = await this.authService.register(data);

    return new ResponseDto(HttpStatus.CREATED, response);
  }

}
