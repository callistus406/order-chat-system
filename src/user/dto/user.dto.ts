import { IsEmail, IsInt, IsNotEmpty, IsPositive, IsString, MinLength } from 'class-validator';

export class GetProfileDto {
  
  @IsInt({ message: 'User ID must be an integer' })
  @IsPositive({ message: 'User ID must be a positive integer' })
  @IsNotEmpty({ message: 'UserId is required' })
  userId: number;
}



 

export class RegisterAdminDto{
    @IsString()
    username: String
    @IsEmail()
    email: string
    @IsString()
    @MinLength(6)
    password: string

}





