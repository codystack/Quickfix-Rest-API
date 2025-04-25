import { IsAlpha, IsNotEmpty, IsString } from 'class-validator';
// import { Address } from 'src/typeorm/entities/address';

export class CreateNotificationDTO {
  @IsNotEmpty()
  @IsString()
  @IsAlpha()
  title: string;

  @IsNotEmpty()
  @IsString()
  @IsAlpha()
  category: string;
}
