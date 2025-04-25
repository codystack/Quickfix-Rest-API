import { IsOptional, IsString } from 'class-validator';
// import { Address } from 'src/typeorm/entities/address';

export class UpdateLocation {
  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  city?: string;
}
