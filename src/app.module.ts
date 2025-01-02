import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ChatService } from './chat/chat.service';
import { ChatModule } from './chat/chat.module';
import { OrderController } from './order/order.controller';
import { OrderModule } from './order/order.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import {ConfigModule} from "@nestjs/config"
import { AdminSeeder } from './database/admin.seeder';
import { UserRepository } from './common/repository/user.repository';
import { EnvValidationService } from './config/envValidation';
import { DatabaseModule } from './database/database.module';
@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true}),
    AuthModule, UserModule,ChatModule,  OrderModule, PrismaModule,DatabaseModule],
  controllers: [AppController, ],
  providers: [AppService, PrismaService,EnvValidationService],
})
export class AppModule implements OnModuleInit{

  constructor(private readonly adminSeeder: AdminSeeder, private readonly envValidationService: EnvValidationService) {
    // console.log('UserRepository:', adminSeeder);
    // console.log('ConfigService:', envValidationService);
    // console.log('AdminSeeder Loaded:', this.adminSeeder);
    // console.log('EnvValidationService Loaded:', this.envValidationService);
  }
  public async onModuleInit() {
    this.envValidationService
   await  this.adminSeeder.seedAdminUser()
  }

}
