import { IsNotEmpty, IsString } from 'class-validator';
// import { Address } from 'src/typeorm/entities/address';

export class AddLocation {
  @IsNotEmpty()
  @IsString()
  region: string;

  @IsNotEmpty()
  @IsString()
  city: string;
}
