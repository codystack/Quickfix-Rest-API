import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OTP } from 'src/schemas/otp.schema';
import { OTPPayloadDTO } from './dto/otp.dto';

@Injectable()
export class OtpService {
  constructor(@InjectModel(OTP.name) private otpRepository: Model<OTP>) {}

  findOTPs() {
    return this.otpRepository.find();
  }

  async saveOTP(payload: OTPPayloadDTO): Promise<any> {
    //First check if OTP already exist for this user's email address
    const foundOTP = await this.findOTPByEmail(payload?.email_address);

    if (!foundOTP || foundOTP === null) {
      const currentTime = new Date(); // Get the current time
      const expirationTime = new Date(currentTime.getTime() + 10 * 60000);
      new this.otpRepository({
        ...payload,
        expiresAt: expirationTime,
        created_at: new Date(),
        updated_at: new Date(),
      }).save();
    } else {
      await this.updateOTP(payload);
    }
  }

  async findOTPByEmail(email_address: string): Promise<OTP | null> {
    const foundOTP = await this.otpRepository.findOne({
      email_address: email_address,
    });

    return foundOTP;
  }

  async updateOTP(payload: OTPPayloadDTO) {
    const currentTime = new Date(); // Get the current time
    const expirationTime = new Date(currentTime.getTime() + 10 * 60000);
    await this.otpRepository.updateOne(
      { email_address: payload?.email_address },
      { code: payload?.code, expiresAt: expirationTime },
    );
  }

  async verifyOTP(payload: OTPPayloadDTO): Promise<any> {
    const dbOTP = await this.findOTPByEmail(payload?.email_address);

    if (dbOTP.code === payload?.code) {
      const currentTime = new Date();
      if (currentTime > dbOTP.expiresAt) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'OTP code has expired',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      // await this.removeOTP(dbOTP?.email_address);
      return {
        message: 'Verification was successful',
        data: null,
      };
    }

    throw new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        error: 'Incorrect OTP code',
      },
      HttpStatus.BAD_REQUEST,
    );
  }

  async removeOTP(email: any) {
    await this.otpRepository.deleteOne({ email_address: email });
  }
}
