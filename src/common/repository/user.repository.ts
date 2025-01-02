import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class UserRepository {
  private readonly userModel: PrismaService;
  constructor(userModel: PrismaService) {
    this.userModel = userModel;
  }
  public async findUserByEmail(email: string) {
    const user = await this.userModel.user.findFirst({ where: { email } });
    return user;
  }

  public async findUserByUsername(username: string) {
    const user = await this.userModel.user.findFirst({ where: { username } });
    return user;
  }

  public async findUserById(userId: number) {
    const user = await this.userModel.user.findFirst({ where: { id: userId } });
    return user;
  }

  public async findUserByEmailAndUsername(email: string, username: string) {
    const user = await this.userModel.user.findFirst({
      where: { AND: [{ email }, { username }] },
    });
    return user;
  }

  public async createUser(data2: any) {


      return await this.userModel.$transaction(async (prisma) => {
        return await this.userModel.user.create({
          data: data2,
        });
      });
  
  }
  public async createAdminUser(data2: any) {
    console.log('Incoming data2:', data2);

    try {
      return await this.userModel.$transaction(async (prisma) => {
        // Create user directly, handle unique error explicitly
        return await prisma.user.create({
          data: data2,
        });
      });
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target.includes('username')) {
        throw new Error(`Username "${data2.username}" is already taken.`);
      }
      throw error;
    }
  }
  

    public async fetchUserprofile(userId: number) {
      
    return  await this.userModel.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });
    }
    public async findAllUsers() {
      const user = await this.userModel.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          role:true
      } });
      return user;
    }
  
    
}
