import { LoginDto } from './dto/login-user.dto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { UserRepository } from '../common/repository/user.repository';
import { RegisterDto } from './dto/register-user.dto';
import { JwtService } from '@nestjs/jwt';
import { CustomException } from '../common/exceptions/custom.exception';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {
  
  }

  public async register(data: RegisterDto): Promise<string> {
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);

      await this.userRepository.createUser({
        ...data,
        password: hashedPassword,
      });

      return 'Account created successfully!';
    } catch (error) {
      console.log(error)
      throw new CustomException(
        'Unable to process registration at this time',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async login(data: LoginDto) {
    const user = await this.userRepository.findUserByUsername(data.username);
    if (!user)
      throw new CustomException('Invalid Credentials', HttpStatus.UNAUTHORIZED);


    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid)
      throw new CustomException(
        'incorrect username or password',
        HttpStatus.UNAUTHORIZED,
      );

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };
    const token = this.jwtService.sign(payload);

    return { access_token: token };
  }
}
