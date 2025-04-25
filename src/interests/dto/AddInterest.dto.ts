import { IsNotEmpty, IsString } from 'class-validator';
// import { Address } from 'src/typeorm/entities/address';

export class AddInterestDTO {
  @IsNotEmpty()
  @IsString()
  marketplaceId: string;
}
