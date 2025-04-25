import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsPositive,
  IsArray,
} from 'class-validator';
// import { Address } from 'src/typeorm/entities/address';

export class AddMarketplaceItem {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsNotEmpty()
  @IsString()
  detail: string;

  @IsNotEmpty()
  @IsArray()
  images: string[];
}
