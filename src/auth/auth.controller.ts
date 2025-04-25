/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Put,
  Req,
  Res,
  // UseGuards,
  UsePipes,
  ValidationError,
  ValidationPipe,
  // UseGuards,
} from '@nestjs/common';
// import { LocalAuthGuard } from './guards/local_guard';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDTO } from 'src/users/dtos/createuser.dto';
import { LoginUserDTO } from 'src/users/dtos/loginuser.dto';
import { AdminAuthService } from 'src/adminauth/adminauth.service';
import { CreateAdminDTO } from 'src/admins/dtos/createadmin.dto';
import { LoginAdminDTO } from 'src/adminauth/dto/login.dto';
import { OTPPayloadDTO } from 'src/otp/dto/otp.dto';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private authService: AuthService,
    @Inject('ADMIN_AUTH_SERVICE') private adminAuthService: AdminAuthService,
  ) {}

  @Post('login')
  @UsePipes(
    new ValidationPipe({
      exceptionFactory: (errors: ValidationError[]) => {
        const validationErrors = errors.map((error) => ({
          field: error.property,
          errors: Object.values(error.constraints || {}),
        }));

        // Extract the first error message from the validation errors
        const firstErrorField = validationErrors[0].field;
        const firstErrorMessage = validationErrors[0].errors[0];

        return new BadRequestException({
          statusCode: 400,
          message: `${firstErrorField}: ${firstErrorMessage}`,
          errors: validationErrors,
        });
      },
    }),
  )
  async login(@Body() loginUserDto: LoginUserDTO) {
    return await this.authService.validateLogin(loginUserDto);
  }

  @Post('signup')
  @UsePipes(
    new ValidationPipe({
      exceptionFactory: (errors: ValidationError[]) => {
        const validationErrors = errors.map((error) => ({
          field: error.property,
          errors: Object.values(error.constraints || {}),
        }));

        // Extract the first error message from the validation errors
        // const firstErrorField = validationErrors[0].field;
        const firstErrorMessage = validationErrors[0].errors[0];

        return new BadRequestException({
          statusCode: 400,
          message: `${firstErrorMessage}`,
          errors: validationErrors,
        });
      },
    }),
  )
  async signUp(@Body() createUserDto: CreateUserDTO) {
    const result = await this.authService.validateCreateUser(createUserDto);
    console.log('SIGNUP RESPONSE ', result);

    return result;
  }

  @Post('resend-otp')
  async resendOtp(@Req() req: Request) {
    console.log('RESEND_OTP REQ :: ', req.body);
    const { email_address } = req.body;
    const result = await this.authService.resendOtp(email_address);
    return result;
  }

  @Post('verify')
  async verifyAccount(@Req() req: Request) {
    const { code, email_address } = req.body;
    return await this.authService.validateVerifyOTP({
      code: code,
      email_address: email_address,
    });
  }

  @Post('forgot-password')
  async sendPasswordEmail(@Req() req: Request) {
    // console.log('RESEND_OTP REQ :: ', req.body);
    const { email_address } = req.body;
    const result = await this.authService.sendPasswordResetEmail(email_address);
    return result;
  }

  @Post('verify-forgot-password')
  async verifyResetPass(@Req() req: Request) {
    const { email_address, code } = req.body;
    return await this.authService.verifyResetPass({
      code,
      email_address,
    });
  }

  @Put('reset-password')
  async resetPassword(@Req() req: Request) {
    const { new_password, confirm_password, email_address } = req.body;
    const result = await this.authService.resetPassword(
      new_password,
      confirm_password,
      email_address,
    );
    return result;
  }

  @Get('status')
  async getAuthStatus(@Req() req: Request) {
    console.log('Inside AuthController status method');
    console.log(req.user);
    return req.user;
  }

  // ADMIN AUTHENTICATION PART HERE
  // ADMIN AUTHENTICATION PART HERE
  // ADMIN AUTHENTICATION PART HERE
  // ADMIN AUTHENTICATION PART HERE

  @Post('admin/login')
  @UsePipes(
    new ValidationPipe({
      exceptionFactory: (errors: ValidationError[]) => {
        const validationErrors = errors.map((error) => ({
          field: error.property,
          errors: Object.values(error.constraints || {}),
        }));

        // Extract the first error message from the validation errors
        // const firstErrorField = validationErrors[0].field;
        const firstErrorMessage = validationErrors[0].errors[0];

        return new BadRequestException({
          statusCode: 400,
          message: `${firstErrorMessage}`,
          errors: validationErrors,
        });
      },
    }),
  )
  async adminLogin(@Body() LoginAdminDTO: LoginAdminDTO, @Res() res: Response) {
    return await this.adminAuthService.validateLogin(LoginAdminDTO, res);
  }

  @Post('admin/signup')
  @UsePipes(
    new ValidationPipe({
      exceptionFactory: (errors: ValidationError[]) => {
        const validationErrors = errors.map((error) => ({
          field: error.property,
          errors: Object.values(error.constraints || {}),
        }));

        // Extract the first error message from the validation errors
        // const firstErrorField = validationErrors[0].field;
        const firstErrorMessage = validationErrors[0].errors[0];

        return new BadRequestException({
          statusCode: 400,
          message: `${firstErrorMessage}`,
          errors: validationErrors,
        });
      },
    }),
  )
  async adminSignup(@Body() createAdminDto: CreateAdminDTO) {
    console.log('REQUEST :::', createAdminDto);
    const result =
      await this.adminAuthService.validateCreateAdmin(createAdminDto);
    return result;
  }

  @Post('admin/resend-otp')
  async adminRresendOtp(@Req() req: Request) {
    console.log('RESEND_OTP REQ :: ', req.body);
    const { email_address } = req.body;
    const result = await this.adminAuthService.sendOTP(email_address);
    return result;
  }

  @Post('admin/verify')
  @UsePipes(
    new ValidationPipe({
      exceptionFactory: (errors: ValidationError[]) => {
        const validationErrors = errors.map((error) => ({
          field: error.property,
          errors: Object.values(error.constraints || {}),
        }));

        // Extract the first error message from the validation errors
        // const firstErrorField = validationErrors[0].field;
        const firstErrorMessage = validationErrors[0].errors[0];

        return new BadRequestException({
          statusCode: 400,
          message: `${firstErrorMessage}`,
          errors: validationErrors,
        });
      },
    }),
  )
  async adminVerifyAccount(@Body() body: OTPPayloadDTO) {
    const verifier = await this.adminAuthService.validateVerifyOTP(body);

    return verifier;
  }

  @Post('admin/send-password-reset')
  async adminSendPasswordEmail(@Req() req: Request) {
    // console.log('RESEND_OTP REQ :: ', req.body);
    const { email_address } = req.body;
    const result =
      await this.adminAuthService.sendPasswordResetEmail(email_address);
    return result;
  }

  @Put('admin/reset-password')
  async adminResetPassword(@Req() req: Request) {
    const { new_password, confirm_password, email_address } = req.body;
    const result = await this.adminAuthService.resetPassword(
      new_password,
      confirm_password,
      email_address,
    );
    return result;
  }
}
