import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  IsNumber,
  IsPositive,
  IsEnum,
} from 'class-validator';
import { DeliveryType, OrderItem } from 'src/schemas/orders.schema';

export class CreateOrderDTO {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsNumber()
  originalAmount?: number;

  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsOptional()
  @IsNumber()
  delivery_fee?: number;

  @IsNotEmpty()
  @IsEnum(DeliveryType)
  delivery_type: DeliveryType;

  @IsNotEmpty()
  @IsString()
  service: string;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  pickup_date?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  landmark?: string;

  @IsNotEmpty()
  @IsArray()
  items: OrderItem[];

  @IsOptional()
  @IsString()
  express?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}
