import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class AddSocialDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsUrl()
  url: string;

  @IsNotEmpty()
  @IsString()
  logo: string;
}
