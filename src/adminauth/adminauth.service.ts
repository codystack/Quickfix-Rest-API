/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OTPPayloadDTO } from 'src/otp/dto/otp.dto';
import { OtpService } from 'src/otp/otp.service';

import { comparePasswords, encodePassword } from 'src/utils/bcrypt';
import {
  adminOnboardingEmailContent,
  passwordEmailContent,
  verificationEmailContent,
} from 'src/utils/email';
import { generateOTP } from 'src/utils/otp_generator';
import * as bcrypt from 'bcrypt';

import { AdminsService } from 'src/admins/admins.service';
import { Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Activities } from 'src/schemas/activities.schema';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { Admin } from 'src/schemas/admin.schema';
import { CreateAdminDTO } from 'src/admins/dtos/createadmin.dto';
import { MailerService } from '@nestjs-modules/mailer';
import generateRandomPassword from './utils/password_generator';
import { LoginAdminDTO } from './dto/login.dto';

@Injectable()
export class AdminAuthService {
  constructor(
    @Inject('ADMIN_SERVICE') private readonly adminService: AdminsService,
    private readonly mailerService: MailerService,
    @Inject('OTP_SERVICE') private readonly otpService: OtpService,
    @InjectModel(Activities.name)
    private activitiesRepository: Model<Activities>,
    @InjectModel(User.name) private userRepository: Model<User>,
    @InjectModel(Admin.name) private readonly adminRepository: Model<Admin>,
    private jwtService: JwtService,
  ) {}

  async validateAdmin(username: string, password: string) {
    const adminDB = await this.adminService.findAdminByUsername(username);

    if (adminDB && adminDB.password === password) {
      const matched = comparePasswords(password, adminDB.password);
      if (matched) {
        console.log('ADMIN DATA :: ', adminDB);
        const { password, ...usr } = adminDB;
        const payload = {
          sub: adminDB?.email_address,
          username: adminDB?.first_name,
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

  async validateCreateAdmin(adminData: CreateAdminDTO) {
    console.log('Admin Payload from Client :: ', adminData);
    if (!adminData) {
      throw new HttpException('Payload not provided !!!', HttpStatus.FORBIDDEN);
    }
    const adminDB = await this.adminService.findAdminByUsername(
      adminData?.email_address,
    );
    if (adminDB) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Account already exist',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (adminDB?.phone_number === adminData?.phone_number) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Phone number is taken',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const generatedPassword = generateRandomPassword();
    await this.adminService.createAdmin({
      password: generatedPassword,
      access: adminData.access,
      address: adminData.address,
      email_address: adminData?.email_address,
      first_name: adminData?.first_name,
      last_name: adminData?.last_name,
      phone_number: adminData?.phone_number,
      role: adminData?.role,
      type: adminData?.type,
      location: adminData?.location,
    });

    const emailSent = await this.mailerService.sendMail({
      to: adminData?.email_address,
      subject: 'New Admin Onboarding',
      html: adminOnboardingEmailContent(
        {
          email_address: adminData?.email_address,
          access: adminData?.access,
          password: generatedPassword,
          role: adminData?.role,
        },
        adminData?.first_name,
      ),
    });

    if (emailSent) {
      return {
        message: 'Account credentials sent to email successfully',
      };
    } else {
      return {
        message: 'Failed to send account credentials to email',
      };
    }
  }

  async sendOTP(email_address: string) {
    try {
      console.log('User Payload from Client :: ', email_address);
      if (!email_address) {
        throw new HttpException(
          'Payload not provided !!!',
          HttpStatus.FORBIDDEN,
        );
      }
      const adminData =
        await this.adminService.findAdminByUsername(email_address);
      if (!adminData) {
        throw new HttpException(
          'User email is not registered on this platform!',
          HttpStatus.NOT_FOUND,
        );
      }

      console.log('LJSK::: ', adminData);

      // Send OTP Code here
      const otpCode = generateOTP();
      console.log(otpCode);

      const emailSent = await this.mailerService.sendMail({
        to: email_address,
        subject: 'New OTP Request',
        html: verificationEmailContent(otpCode, adminData?.first_name),
      });

      // Save/Update OTP code for user here
      const currentUserOTP =
        await this.otpService.findOTPByEmail(email_address);

      if (currentUserOTP) {
        // OTP Already exists for this user so update it here
        await this.otpService.updateOTP({
          code: otpCode,
          email_address: email_address,
        });
      } else {
        // Create new
        await this.otpService.saveOTP({
          code: otpCode,
          email_address: email_address,
        });
      }

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
      console.log('ERR :: EMAIL ', error);
    }
  }

  async validateVerifyOTP(otpPayload: OTPPayloadDTO) {
    console.log('User Payload from Client :: ', otpPayload);
    if (
      otpPayload?.code === undefined ||
      otpPayload?.email_address === undefined
    ) {
      throw new HttpException('Payload not provided !!!', HttpStatus.FORBIDDEN);
    }

    const adminDb = await this.adminService.findAdminByUsername(
      otpPayload?.email_address,
    );
    if (!adminDb) {
      throw new HttpException('User record not found', HttpStatus.NOT_FOUND);
    }

    const otpDb = await this.otpService.findOTPByEmail(
      otpPayload?.email_address,
    );
    if (!otpDb) {
      throw new HttpException('OTP data not found', HttpStatus.NOT_FOUND);
    }

    // Now compare this otp code and the one saved to the database
    if (otpDb?.code !== otpPayload.code) {
      throw new HttpException('OTP code not valid', HttpStatus.FORBIDDEN);
    }

    await this.otpService.removeOTP(otpDb?.email_address);
    // Now set user's email_verified to true
    await this.adminService.updateAdmin(adminDb?.email_address, {
      is_email_verified: true,
      last_login: new Date(),
      next_login: new Date(),
    });

    const admini = await this.adminService.findAdminByUsername(
      otpPayload?.email_address,
    );

    const { password, ...admn } = admini;
    const payload = {
      sub: adminDb?.email_address,
      username: adminDb?.first_name,
    };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      message: 'Operation successful',
      user: admn,
    };
  }

  async validateLogin(loginAdminDTO: LoginAdminDTO, response: Response) {
    console.log('User Payload from Client :: ', loginAdminDTO);
    if (!loginAdminDTO) {
      throw new HttpException('Payload not provided !!!', HttpStatus.FORBIDDEN);
    }
    const adminDB = await this.adminService.findAdminByUsername(
      loginAdminDTO?.email_address,
    );
    console.log('ADMI ::: ', adminDB);

    if (!adminDB) {
      response.status(404).send({
        message: 'Account does not exist on our platform!',
        status: 'error',
      });
    }

    if (adminDB?.status === 'suspended') {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Your account is under suspension',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Now compare passwords before login
    if (
      adminDB &&
      bcrypt.compareSync(loginAdminDTO.password, adminDB?.password)
    ) {
      // update last_login here
      await this.adminRepository.updateOne(
        { email_address: adminDB?.email_address },
        {
          next_login: new Date(),
          last_login: adminDB?.next_login ?? new Date(),
        },
      );

      await new this.activitiesRepository({
        title: `You logged into your QuickFix admin portal on ${new Date().toLocaleString('en-GB')}`,
        category: 'login',
        admin: adminDB?._id ?? adminDB?.id,
      }).save();

      const usere = await this.adminService.findAdminById(
        adminDB?._id ?? adminDB?.id,
      );

      const { password, ...usr } = usere;
      const payload = {
        sub: adminDB?.email_address,
        username: adminDB?.first_name,
      };

      const token = await this.jwtService.signAsync(payload);

      return response.status(200).send({
        accessToken: token,
        message: 'Logged in successfully',
        user: usr,
        status: 'success',
      });
    } else {
      return response.status(400).send({
        message: 'Credentials do not match',
        status: 'error',
      });
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
    const adminData =
      await this.adminService.findAdminByUsername(email_address);

    if (!adminData) {
      throw new HttpException(
        'User email is not registered on this platform!',
        HttpStatus.NOT_FOUND,
      );
    }
    // Send OTP Code here
    const otpCode = generateOTP();
    const emailSent = await this.mailerService.sendMail({
      to: email_address,
      subject: 'Password Reset Request',
      html: passwordEmailContent(otpCode, adminData?.first_name),
    });

    // Save/Update OTP code for user here
    const currentUserOTP = await this.otpService.findOTPByEmail(
      adminData?.email_address,
    );
    console.log("CURRENT USER'S OTP ", currentUserOTP);

    if (currentUserOTP) {
      // OTP Already exists for this user so update it here
      await this.otpService.updateOTP({
        email_address: currentUserOTP?.email_address,
        code: otpCode,
      });
    } else {
      // No OTP so add new
      await this.otpService.saveOTP({
        code: otpCode,
        email_address: adminData?.email_address,
      });
    }

    if (emailSent) {
      return {
        message: 'OTP code sent to email successfully',
      };
    } else {
      return {
        message: 'Failed to send OTP email',
      };
    }
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

    const adminData =
      await this.adminService.findAdminByUsername(email_address);

    if (!adminData) {
      throw new HttpException(
        'User is not registered on this platform!',
        HttpStatus.NOT_FOUND,
      );
    }

    // Now hash the current password and update
    const hashed = await encodePassword(new_password);
    await this.adminService.updateAdmin(adminData?.email_address, {
      password: hashed,
    });

    return {
      message: 'Password reset successfully',
    };
  }
}
