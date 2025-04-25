import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsPositive,
  IsNumber,
} from 'class-validator';
import { TransactionType } from 'src/enums/transaction.enum';

export class CreateTransactionDTO {
  @IsNotEmpty()
  @IsPositive()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNotEmpty()
  @IsString()
  trans_ref: string;

  @IsOptional()
  description: string;

  @IsNotEmpty()
  @IsString()
  status: string;
}
