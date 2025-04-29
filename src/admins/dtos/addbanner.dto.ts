import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddBannerDTO {
  @IsNotEmpty()
  title: string;

  @IsOptional()
  url: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  preview: string;
}
