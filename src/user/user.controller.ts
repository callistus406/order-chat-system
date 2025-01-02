import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Request,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ResponseDto } from '../common/dto/response.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { AuthGuard } from '@nestjs/passport';
import { RegisterAdminDto } from './dto/user.dto';
import { Roles } from '../auth/decorators/roles.decorators';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('api/v1/user')
@UseGuards(JwtGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/create-admin')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  public async createAdmin(@Body() createAdminDto: RegisterAdminDto) {
   const response =  await this.userService.createAdminUser(createAdminDto);
    return new ResponseDto(HttpStatus.CREATED, 'Admin user created',response);
  }
  @Get('/profile')
  public async profile(@Request() req) {
    const userId = req.user.userId;
    const response = await this.userService.getProfile(userId);

    return new ResponseDto(HttpStatus.OK, 'Request successful');
  }
  @Get('/accounts')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  public async getAccounts(@Request() req) {
    const response = await this.userService.getAllAccounts();

    return new ResponseDto(HttpStatus.OK, 'Request successful', response);
  }
}

// return new ResponseDto(HttpStatus.OK, 'Chat room closed', response);
