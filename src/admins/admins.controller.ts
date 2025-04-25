import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt_guard';
import { AdminsService } from './admins.service';
import { AddSocialDTO } from './dtos/addsocial.dto';
import { AddBannerDTO } from './dtos/addbanner.dto';
import { AdminAuthService } from 'src/adminauth/adminauth.service';
import { CreateAdminDTO } from './dtos/createadmin.dto';
import { AddExpressDTO } from './dtos/add.express.dto';
import { ValidationError } from 'class-validator';
import { AdminCreateUserDTO } from 'src/users/dtos/admin.createuser.dto';

@Controller('admins')
export class AdminsController {
  constructor(
    private adminService: AdminsService,
    @Inject('ADMIN_AUTH_SERVICE') private authAdminService: AdminAuthService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async allAdmins(
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 25,
  ) {
    return await this.adminService.findAdmins(page, limit);
  }

  @Post('admin/create')
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
  async createAdmin(@Body() body: CreateAdminDTO) {
    return await this.authAdminService.validateCreateAdmin(body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('user/create')
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
  async createUser(@Body() body: AdminCreateUserDTO, @Req() req: any) {
    console.log('EMAIL CHECK ::: ', req?.user?.sub);

    return this.adminService.createUser(req?.user?.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/:id/suspend')
  async suspendAdmin(@Req() req: any) {
    console.log('Admiin :::: ', req?.params);

    return await this.adminService.suspendAdmin(
      req?.user?.sub,
      req?.params?.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/:id/pardon')
  async pardonAdmin(@Req() req: any) {
    return await this.adminService.pardonAdmin(req?.user?.sub, req?.params?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/:id/delete')
  async deleteAdmin(@Req() req: any) {
    return await this.adminService.deleteAdmin(req?.user?.sub, req?.params?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('current/profile')
  async profile(@Req() req: any) {
    return await this.adminService.findCurrentAdmin(req?.user?.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('socials/add')
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
  async saveSocial(@Req() req: any, @Body() body: AddSocialDTO) {
    return await this.adminService.saveSocial(body, req?.user?.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('socials/all')
  async getSocials(@Req() req: any) {
    console.log('CURRENT ADMIN', req.user);
    return await this.adminService.getSocials();
  }

  @UseGuards(JwtAuthGuard)
  @Get('wallet/get')
  async getWallet(@Req() req: any) {
    console.log('CURRENT ADMIN', req.user);
    return await this.adminService.getAdminWallet();
  }

  @UseGuards(JwtAuthGuard)
  @Post('banners/add')
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
  async saveBanner(@Req() req: any, @Body() body: AddBannerDTO) {
    return await this.adminService.saveBannerAd(body, req?.user?.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('banners/all')
  async getBanners(@Req() req: any) {
    console.log('CURRENT ADMIN', req.user);
    return await this.adminService.getBanners();
  }

  @UseGuards(JwtAuthGuard)
  @Get('banners/active/all')
  async getActiveBanners(@Req() req: any) {
    console.log('CURRENT ADMIN', req.user);
    return await this.adminService.getActiveBanners();
  }

  @UseGuards(JwtAuthGuard)
  @Put('banners/:id/update')
  async updateBanner(@Req() req: any) {
    const bannerId = req.params?.id;
    const currUsername = req.user?.sub;
    return await this.adminService.updateBannerAd(
      req.body,
      currUsername,
      bannerId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('banners/:id/delete')
  async deleteBanner(@Req() req: any) {
    const bannerId = req.params?.id;
    const currUsername = req.user?.sub;
    return await this.adminService.deleteBannerAd(currUsername, bannerId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('socials/:id/update')
  async updateSocial(@Req() req: any) {
    const socialId = req.params?.id;
    const currUsername = req.user?.sub;
    return await this.adminService.updateSocial(
      req.body,
      currUsername,
      socialId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('socials/:id/delete')
  async deletSocial(@Req() req: any) {
    const socialId = req.params?.id;
    const currUsername = req.user?.sub;
    return await this.adminService.deleteSocial(currUsername, socialId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('settings/manage')
  async manageSettings(@Req() req: any, @Body() body: any) {
    const currUsername = req.user?.sub;
    return await this.adminService.manageSettings(body, currUsername);
  }

  @Get('settings/all')
  async getSettings() {
    return await this.adminService.findSettings();
  }

  @UseGuards(JwtAuthGuard)
  @Post('express/add')
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
  async saveLocation(@Req() req: any, @Body() body: AddExpressDTO) {
    return await this.adminService.addExpress(req?.user?.sub, body);
  }

  @Get('express/all')
  async getExpress() {
    return await this.adminService.findExpress();
  }

  @UseGuards(JwtAuthGuard)
  @Put('express/:id/update')
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
  async updateExpress(@Req() req: any, @Body() body: AddExpressDTO) {
    const expressId = req.params?.id;
    const currUsername = req.user?.sub;
    return await this.adminService.updateExpress(currUsername, expressId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Put('express/:id/delete')
  async deleteExpress(@Req() req: any) {
    const expressid = req.params?.id;
    const currUsername = req.user?.sub;
    return await this.adminService.deleteExpress(currUsername, expressid);
  }

  @UseGuards(JwtAuthGuard)
  @Get('activities/all')
  async allActivities(
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 25,
  ) {
    return await this.adminService.allActivities(page, limit);
  }
}
