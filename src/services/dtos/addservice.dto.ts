import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsEnum,
  IsUrl,
  IsOptional,
} from 'class-validator';
import { CategoryType } from 'src/enums/category.enum';
import { ServiceItem } from 'src/schemas/service.schema';

export class AddServiceDTO {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsEnum(CategoryType)
  category: CategoryType;

  @IsNotEmpty()
  @IsString()
  @IsUrl()
  icon_url: string;

  @IsOptional()
  description: string;

  @IsNotEmpty()
  @IsArray()
  items: ServiceItem[];
}
