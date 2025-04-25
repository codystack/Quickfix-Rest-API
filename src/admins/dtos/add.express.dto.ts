import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddExpressDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  fee: number;
}
