import { IsString } from 'class-validator';

export class TokenDto {
  @IsString()
  access_token: string;
}
