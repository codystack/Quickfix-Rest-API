import {
  IsNotEmpty,
  IsString,
  IsPositive,
  IsNumber,
  IsEmail,
} from 'class-validator';

export class InitializeTransactionDTO {
  @IsNotEmpty()
  @IsPositive()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
