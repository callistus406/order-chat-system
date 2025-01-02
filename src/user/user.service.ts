import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../common/repository/user.repository';
import { CustomException } from '../common/exceptions/custom.exception';
import { IsInt } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { GetProfileDto, RegisterAdminDto } from './dto/user.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  public async createAdminUser(adminDto: RegisterAdminDto) {
    try {
      const hashedPassword = await bcrypt.hash(adminDto.password, 10);

     const admin =  await this.userRepository.createUser({
        ...adminDto,
        password: hashedPassword,
       role: "ADMIN"
        
      });

      return admin;
    } catch (error) {
      console.log(error)
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
      
          throw new ConflictException(
            `A user with the provided ${error.meta?.target} already exists.`,
          );
        }
      }
      throw new CustomException(
        'Unable to process registration at this time',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  public async getProfile(userId: number) {
    try {
      if (!userId)
        throw new CustomException(
          'Sorry something went wrong',
          HttpStatus.NOT_FOUND,
        );
      const user = await this.userRepository.fetchUserprofile(userId);
      return user;
    } catch (error) {
      throw new CustomException(
        'Unable to process request.Please try again',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  public async getAllAccounts() {
    // if (isNaN(profile.userId)) throw new CustomException("Sorry something went wrong", HttpStatus.BAD_REQUEST);
    const user = await this.userRepository.findAllUsers();
    return user;
  }
}
