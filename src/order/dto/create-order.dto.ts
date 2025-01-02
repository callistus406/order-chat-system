import { IsString, IsInt, Min, IsNotEmpty } from 'class-validator';

export class CreateOrderDto {
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsString({ message: 'Specifications must be a string' })
  @IsNotEmpty({ message: 'Specifications is required' })
  specifications: string;

  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  @IsNotEmpty({ message: 'Quantity is required' })
  quantity: number;
}
