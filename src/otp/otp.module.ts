import { Module } from '@nestjs/common';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';
import { MongooseModule } from '@nestjs/mongoose';
import { OTP, OTPSchema } from 'src/schemas/otp.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: OTP.name, schema: OTPSchema }])],
  controllers: [OtpController],
  providers: [OtpService],
})
export class OtpModule {}
