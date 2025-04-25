import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

enum AppointmentType {
  FAST_TRACK = 'fast-track',
  BOOK_SESSION = 'book-session',
  WORKING_CLASS = 'working-class',
}

enum ReasonType {
  EDUCATION = 'education',
  MEDICAL = 'medical',
  RENT = 'rent',
  TRAVEL = 'travel',
  BUSINESS = 'business',
  EVENTS = 'events',
  OTHERS = 'others',
  HOUSE_KEEP = 'house keep',
}

export class AddAppointmentDTO {
  @IsNotEmpty()
  @IsString()
  @IsEnum(ReasonType)
  reason: ReasonType;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(AppointmentType)
  category: AppointmentType;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  asset?: string;

  @IsOptional()
  @IsString()
  employer_name?: string;

  @IsOptional()
  @IsString()
  work_address?: string;

  @IsNotEmpty()
  @IsString()
  upload_url: string;

  @IsNotEmpty()
  @IsString()
  @IsDateString()
  appointment_date: string;
}
