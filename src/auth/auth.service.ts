/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDTO } from 'src/users/dtos/createuser.dto';
import { LoginUserDTO } from 'src/users/dtos/loginuser.dto';
import { UserService } from 'src/users/users.services';
import { comparePasswords, encodePassword } from 'src/utils/bcrypt';
import {
  passwordEmailContent,
  verificationEmailContent,
} from 'src/utils/email';
import { generateOTP } from 'src/utils/otp_generator';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OtpService } from 'src/otp/otp.service';
import { NotificationService } from 'src/notification/notification.service';
import { OTPPayloadDTO } from 'src/otp/dto/otp.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { SmsService } from 'src/sms/sms.service';
import { SMSProviderType } from 'src/enums/sms.providers.enum';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_SERVICE') private readonly userService: UserService,
    private readonly mailerService: MailerService,
    @Inject('OTP_SERVICE') private readonly otpService: OtpService,
    private jwtService: JwtService,
    private smsService: SmsService,
  ) {}

  async validateUser(username: string, password: string) {
    const userDB = await this.userService.findUserByUsername(username);

    if (userDB && userDB.password === password) {
      const matched = comparePasswords(password, userDB.password);
      if (matched) {
        console.log('USER DATA :: ', userDB);
        const { password, ...usr } = userDB;
        const payload = {
          sub: userDB?.email_address,
          username: userDB?.first_name,
        };
        return {
          accessToken: await this.jwtService.signAsync(payload),
          user: usr,
        };
      } else {
        console.log('No matching password was found!!!');
        return null;
      }
    }
    return null;
  }

  async validateCreateUser(userData: CreateUserDTO) {
    console.log('User Payload from Client :: ', userData);
    if (!userData) {
      throw new HttpException('Payload not provided !!!', HttpStatus.FORBIDDEN);
    }
    const userDB = await this.userService.findUserByUsername(
      userData?.email_address,
    );
    if (userDB) {
      return {
        message: 'Account already exist',
      };
    }
    if (userDB?.phone_number === userData.phone_number) {
      return {
        message: 'Phone number is taken',
      };
    }
    const createdUsr = await this.userService.createUser(userData);
    console.log('CREATED USER ', createdUsr);

    // Send OTP Code here
    try {
      const otpCode = generateOTP();
      // send to phone here using termii and also send to email optionally
      await this.smsService.sendOTP(
        {
          message: `Use OTP code to verify your account ${otpCode}`,
          phoneNumber: userData?.international_phone_format,
        },
        SMSProviderType.TERMII,
      );
      const emailSent = await this.mailerService.sendMail({
        to: userData?.email_address,
        subject: 'New Account Creation',
        html: verificationEmailContent(otpCode, userData?.first_name),
      });

      await this.otpService.saveOTP({
        email_address: userData?.email_address,
        code: otpCode,
      });

      if (emailSent) {
        return {
          message: 'OTP code sent successfully',
        };
      } else {
        return {
          message: 'Failed to send OTP code',
        };
      }
    } catch (error) {
      console.log('OTP ERRO ::: ', error);
    }
  }

  async resendOtp(phone_number: string) {
    console.log('User Payload from Client :: ', phone_number);
    if (!phone_number) {
      throw new HttpException('Payload not provided !!!', HttpStatus.FORBIDDEN);
    }
    const userData = await this.userService.findUserByPhone(phone_number);
    if (!userData) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'Phone number not recognized!',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    console.log('LJSK::: ', userData);

    // Send OTP Code here
    const otpCode = generateOTP();
    console.log(otpCode);

    // send to phone here using termii and also send to email optionally
    try {
      await this.smsService.sendOTP(
        {
          message: `Use OTP code to verify your account ${otpCode}`,
          phoneNumber: userData?.international_phone_format,
        },
        SMSProviderType.TERMII,
      );

      const emailSent = await this.mailerService.sendMail({
        to: userData?.email_address,
        subject: 'New Account Creation OTP Resend',
        html: verificationEmailContent(otpCode, userData?.first_name),
      });

      await this.otpService.saveOTP({
        email_address: userData?.email_address,
        code: otpCode,
      });

      if (emailSent) {
        return {
          message: 'OTP email sent successfully',
        };
      } else {
        return {
          message: 'Failed to send OTP email',
        };
      }
    } catch (error) {
      console.log('ERRO ', error);
    }
  }

  async validateVerifyOTP(otpPayload: OTPPayloadDTO) {
    if (
      otpPayload?.code === undefined ||
      otpPayload?.email_address === undefined
    ) {
      throw new HttpException('Payload not provided !!!', HttpStatus.FORBIDDEN);
    }

    const userDb = await this.userService.findUserByUsername(
      otpPayload?.email_address,
    );
    if (!userDb) {
      throw new HttpException('User record not found', HttpStatus.NOT_FOUND);
    }

    const verifyResponse = await this.otpService.verifyOTP(otpPayload);
    console.log('VERIFY OTP RESPONSE ::: ', verifyResponse);

    // Now set user's email_verified to true
    const updatedUser = await this.userService.updateUser(
      userDb?.email_address,
      {
        is_email_verified: true,
        last_login: new Date(),
        next_login: new Date(),
      },
    );
    console.log('USER UPDATED ::: ', updatedUser);

    const payload = {
      sub: userDb?.email_address,
      username: userDb?.first_name,
    };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: updatedUser,
    };
  }

  async validateLogin(loginUserDto: LoginUserDTO) {
    console.log('User Payload from Client :: ', loginUserDto);
    if (!loginUserDto) {
      throw new HttpException('Payload not provided !!!', HttpStatus.FORBIDDEN);
    }
    const userDB = await this.userService.findUserByUsername(
      loginUserDto?.email_address,
    );
    // console.log(userDB);

    if (!userDB) {
      throw new HttpException(
        'Account does not exist on our platform!',
        HttpStatus.NOT_FOUND,
      );
    }

    // Now compare passwords before login
    if (userDB && bcrypt.compareSync(loginUserDto.password, userDB?.password)) {
      // Now check if this account is verified
      if (!userDB?.is_email_verified) {
        // Verifiy account first.
        // Send email OTP code to this email
        // Send OTP Code here
        const otpCode = generateOTP();
        console.log(otpCode);

        try {
          await this.smsService.sendOTP(
            {
              message: `Use OTP code to verify your account ${otpCode}`,
              phoneNumber: userDB?.international_phone_format,
            },
            SMSProviderType.TERMII,
          );

          const emailSent = await this.mailerService.sendMail({
            to: userDB?.email_address,
            subject: 'Account Verification OTP',
            html: verificationEmailContent(otpCode, userDB?.first_name),
          });

          await this.otpService.saveOTP({
            email_address: userDB?.email_address,
            code: otpCode,
          });

          if (emailSent) {
            return {
              message: 'OTP email sent successfully',
              action: 'verify account first',
            };
          } else {
            return {
              message: 'Failed to send OTP email',
              action: 'verify account first',
            };
          }
        } catch (error) {
          console.log('EERO ', error);
        }
      } else {
        if (userDB?.status === 'suspended') {
          throw new HttpException(
            {
              status: HttpStatus.BAD_REQUEST,
              message: 'Your account is under suspension',
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        if (userDB?.status === 'deleted') {
          throw new HttpException(
            {
              status: HttpStatus.NOT_FOUND,
              message: 'Account no longer exist',
            },
            HttpStatus.NOT_FOUND,
          );
        }
        // update last_login here
        await this.userService.updateUser(userDB?.email_address, {
          next_login: new Date(),
          last_login: userDB?.next_login ?? new Date(),
        });

        const usere = await this.userService.findUserByUsername(
          userDB?.email_address,
        );

        const { password, ...usr } = usere;
        const payload = {
          sub: userDB?.email_address,
          username: userDB?.first_name,
        };

        return {
          accessToken: await this.jwtService.signAsync(payload),
          message: 'Logged in successfully',
          user: usr,
        };
      }
    } else {
      throw new HttpException(
        'Incorrect credentials. Check and try again',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async sendPasswordResetEmail(email_address: string) {
    console.log('User Payload from Client :: ', email_address);
    if (!email_address) {
      throw new HttpException(
        'Email address not provided !!!',
        HttpStatus.FORBIDDEN,
      );
    }
    const userData = await this.userService.findUserByUsername(email_address);

    if (!userData) {
      throw new HttpException(
        'User email is not registered on this platform!',
        HttpStatus.NOT_FOUND,
      );
    }
    // Send OTP Code here
    const otpCode = generateOTP();
    try {
      await this.smsService.sendOTP(
        {
          message: `Use OTP code to reset your password ${otpCode}`,
          phoneNumber: userData?.international_phone_format,
        },
        SMSProviderType.TERMII,
      );
      const emailSent = await this.mailerService.sendMail({
        to: email_address,
        subject: 'Password Reset Request',
        html: passwordEmailContent(otpCode, userData?.first_name),
      });

      await this.otpService.saveOTP({
        email_address: userData?.email_address,
        code: otpCode,
      });

      if (emailSent) {
        return {
          message: 'OTP code sent to email successfully',
        };
      } else {
        return {
          message: 'Failed to send OTP email',
        };
      }
    } catch (error) {
      console.log('OTP ERROR', error);
    }
  }

  async verifyResetPass(payload: OTPPayloadDTO) {
    return await this.otpService.verifyOTP(payload);
  }

  async resetPassword(
    new_password: string,
    confirm_password: string,
    email_address: string,
  ) {
    // console.log('User Payload from Client :: ', email_address);
    if (!new_password) {
      throw new HttpException(
        'New password not provided !!!',
        HttpStatus.FORBIDDEN,
      );
    }
    if (!confirm_password) {
      throw new HttpException(
        'New password confirmation not provided !!!',
        HttpStatus.FORBIDDEN,
      );
    }

    if (new_password !== confirm_password) {
      throw new HttpException('Password mismatch!', HttpStatus.FORBIDDEN);
    }

    const userData = await this.userService.findUserByUsername(email_address);

    if (!userData) {
      throw new HttpException(
        'User is not registered on this platform!',
        HttpStatus.NOT_FOUND,
      );
    }

    // Now hash the current password and update
    const hashed = await encodePassword(new_password);
    await this.userService.updateUser(userData?.email_address, {
      password: hashed,
    });

    // await this.historyService.saveHistory({
    //   status: 'success',
    //   title: 'Your Afrikunet account password was reset',
    //   type: 'password',
    //   email_address: email_address,
    // });

    return {
      message: 'Password reset successfully',
    };
  }
}
