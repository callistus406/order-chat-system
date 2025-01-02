import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from '../common/repository/user.repository';
import { AdminSeeder } from '../database/admin.seeder';

@Module({
  controllers: [UserController],
  providers: [UserService,UserRepository,],
  exports:[UserRepository,]
})
export class UserModule {}
