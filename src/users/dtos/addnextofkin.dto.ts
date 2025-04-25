import {
  IsAlpha,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
// import { Address } from 'src/typeorm/entities/address';

enum RelationshipType {
  SIBLING = 'sibling',
  PARENT = 'parent',
  GRAND_PARENT = 'grand-parent',
  COUSIN = 'cousin',
  CHILD = 'child',
  STEP_CHILD = 'step-child',
  COLLEAGUE = 'colleague',
  EMPLOYEE = 'employee',
  EMPLOYER = 'employer',
  MENTOR = 'mentor',
  NEPHEW = 'nephew',
  NIECE = 'neice',
  AUNTY = 'aunty',
  UNCLE = 'uncle',
  NEIGHBOUR = 'neighbour',
  STEP_SIBLING = 'step-sibling',
}

export class AddNextofKinDTO {
  @IsNotEmpty()
  @IsString()
  @IsAlpha()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  @IsAlpha()
  last_name: string;

  @IsEmail()
  @IsNotEmpty()
  email_address: string;

  @IsNotEmpty()
  @IsString()
  phone_number: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(RelationshipType)
  relationship: RelationshipType;
}
