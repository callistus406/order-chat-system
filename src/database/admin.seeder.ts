import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '../common/repository/user.repository';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminSeeder {
  private readonly logger = new Logger(AdminSeeder.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {

  }

  public async seedAdminUser() {
    try {
      const adminData = {
        email: this.configService.get<string>('ADMIN_EMAIL',),
        username: this.configService.get<string>('ADMIN_USERNAME'),
        password: this.configService.get<string>('ADMIN_PASSWORD'),
        role: UserRole.ADMIN,
      };

      const adminUser = await this.userRepository.findUserByEmail(adminData.email);

      if (adminUser) {
        this.logger.warn('Admin user already exists. Skipping creation.');
        return;
      }

      const hashedPassword = await bcrypt.hash(adminData.password, 10);

      await this.userRepository.createUser({
        ...adminData,
        password: hashedPassword,
      });

      this.logger.log(' Admin user created successfully with default credentials:');
      this.logger.log(`📧 Email: ${adminData.email}`);
      this.logger.log(`🔑 Password: ${adminData.password}`);
    } catch (error) {
      this.logger.error(' Failed to seed admin user', error);
      throw error;
    }
  }
}
