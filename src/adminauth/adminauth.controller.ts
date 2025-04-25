/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Inject } from '@nestjs/common';
import { AdminAuthService } from './adminauth.service';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(
    @Inject('ADMIN_AUTH_SERVICE') private adminAuthService: AdminAuthService,
  ) {}

  // @Post('login')
  // @UsePipes(
  //   new ValidationPipe({
  //     exceptionFactory: (errors: ValidationError[]) => {
  //       const validationErrors = errors.map((error) => ({
  //         field: error.property,
  //         errors: Object.values(error.constraints || {}),
  //       }));

  //       // Extract the first error message from the validation errors
  //       // const firstErrorField = validationErrors[0].field;
  //       const firstErrorMessage = validationErrors[0].errors[0];

  //       return new BadRequestException({
  //         statusCode: 400,
  //         message: `${firstErrorMessage}`,
  //         errors: validationErrors,
  //       });
  //     },
  //   }),
  // )
  // async login(@Body() LoginAdminDTO: LoginAdminDTO, @Res() res: Response) {
  //   return await this.adminAuthService.validateLogin(LoginAdminDTO, res);
  // }

  // @Post('signup')
  // @UsePipes(
  //   new ValidationPipe({
  //     exceptionFactory: (errors: ValidationError[]) => {
  //       const validationErrors = errors.map((error) => ({
  //         field: error.property,
  //         errors: Object.values(error.constraints || {}),
  //       }));

  //       // Extract the first error message from the validation errors
  //       // const firstErrorField = validationErrors[0].field;
  //       const firstErrorMessage = validationErrors[0].errors[0];

  //       return new BadRequestException({
  //         statusCode: 400,
  //         message: `${firstErrorMessage}`,
  //         errors: validationErrors,
  //       });
  //     },
  //   }),
  // )
  // async signUp(@Body() createAdminDto: CreateAdminDTO) {
  //   console.log('REQUEST :::', createAdminDto);
  //   const result =
  //     await this.adminAuthService.validateCreateAdmin(createAdminDto);
  //   return result;
  // }

  // @Post('resend-otp')
  // async resendOtp(@Req() req: Request) {
  //   console.log('RESEND_OTP REQ :: ', req.body);
  //   const { email_address } = req.body;
  //   const result = await this.adminAuthService.sendOTP(email_address);
  //   return result;
  // }

  // @Post('verify')
  // async verifyAccount(@Req() req: Request) {
  //   console.log('REQUEST USER ::: ', req.user);
  //   const { code, email_address } = req.body;
  //   const verifier = await this.adminAuthService.validateVerifyOTP({
  //     code: code,
  //     email_address: email_address,
  //   });

  //   return verifier;
  // }

  // @Post('send-password-reset')
  // async sendPasswordEmail(@Req() req: Request) {
  //   // console.log('RESEND_OTP REQ :: ', req.body);
  //   const { email_address } = req.body;
  //   const result =
  //     await this.adminAuthService.sendPasswordResetEmail(email_address);
  //   return result;
  // }

  // @Put('reset-password')
  // async resetPassword(@Req() req: Request) {
  //   const { new_password, confirm_password, email_address } = req.body;
  //   const result = await this.adminAuthService.resetPassword(
  //     new_password,
  //     confirm_password,
  //     email_address,
  //   );
  //   return result;
  // }

  // @Get('status')
  // async getAuthStatus(@Req() req: Request) {
  //   console.log('Inside AuthController status method');
  //   console.log(req.user);
  //   return req.user;
  // }
}
