import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvValidationService {
  private readonly logger = new Logger(EnvValidationService.name);

  constructor(private readonly configService: ConfigService) {
    this.validateEnvironmentVariables();
  }

  private validateEnvironmentVariables() {
    const requiredVariables = [
      'ADMIN_EMAIL',
      'ADMIN_USERNAME',
      'ADMIN_PASSWORD',
      'JWT_SECRET',
      'JWT_EXPIRES_IN',
    ];

    for (const variable of requiredVariables) {
      const value = this.configService.get(variable);
      if (!value) {
        this.logger.error(`Missing environment variable: ${variable}`);
        throw new Error(`Missing required environment variable: ${variable}`);
      }
    }

 
    if (!this.configService.get<string>('ADMIN_EMAIL')?.includes('@')) {
      throw new Error(' ADMIN_EMAIL must be a valid email address');
    }

    if (this.configService.get<string>('ADMIN_PASSWORD')?.length < 8) {
      throw new Error(' ADMIN_PASSWORD must be at least 8 characters long');
    }

    this.logger.log(' Environment variables validation passed');
  }
}
