import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  // ParseIntPipe,
  // Post,
  Put,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationError,
  ValidationPipe,
  // UsePipes,
  // ValidationPipe,
} from '@nestjs/common';
import { CreateUserDTO } from './dtos/createuser.dto';
import { UserService } from './users.services';
// import { UserAddressDTO } from './dtos/createuseraddress.dto';
// import { UserGeoDTO } from './dtos/createusergeo.dto';
// import { LoginUserDTO } from './dtos/loginuser.dto';
// import { Request } from 'express';
// import { LocalAuthGuard } from 'src/auth/guards/local_guard';
// import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/guards/jwt_guard';
import { ChangePasswordDTO } from './dtos/changepassword.dto';
import { AccountDeletionDTO } from './dtos/accountdeletion.dto';
import { UpdateUserDTO } from './dtos/updateuser.dto';
import { AccountDeletionWebDTO } from './dtos/accountdeletion.web.dto';
import { UpdateUser2DTO } from './dtos/updateuser2.dto';

@Controller('users')
export class UsersController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('notifications/general')
  getUsers() {
    return this.userService.findAllNotifications();
  }

  // @UseGuards(JwtAuthGuard)
  // @Post('create')
  // @UsePipes(new ValidationPipe())
  createUser(@Body() createUserDto: CreateUserDTO) {
    return this.userService.createUser(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('update')
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
  updateProfile(@Body() body: UpdateUserDTO, @Req() req: any) {
    console.log('ID :: ', req.user);

    if (!req?.user) {
      throw new HttpException(
        'You are highly forbidden!!!',
        HttpStatus.FORBIDDEN,
      );
    }
    return this.userService.updateUser(req?.user?.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @Put('info/update')
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
  updateUser(@Body() body: UpdateUser2DTO, @Req() req: any) {
    if (!req?.user) {
      throw new HttpException(
        'You are highly forbidden!!!',
        HttpStatus.FORBIDDEN,
      );
    }
    return this.userService.updateUser(body?.email_address, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    console.log('PROFILE :: ', req?.user);
    // Now look for this user

    if (!req.user) {
      throw new HttpException(
        'You are highly forbidden!!!',
        HttpStatus.FORBIDDEN,
      );
    }

    const currentUser = await this.userService.findUserByUsername(
      `${req?.user?.sub}`,
    );

    if (!currentUser)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    // Convert Mongoose object to plain JavaScript object
    // const userObject = currentUser.toObject();

    if (currentUser?.password) {
      const { ...rest } = currentUser;

      // console.info(password);

      return {
        user: rest,
      };
    } else {
      return {
        user: currentUser,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async allUsers(
    @Query('page') page: number = 1, // Capture the 'page' query param (optional, with default value)
    @Query('limit') limit: number = 25,
  ) {
    return await this.userService.findUsers(page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get('list')
  async usersList() {
    return await this.userService.usersList();
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
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
  async changePassword(@Body() body: ChangePasswordDTO, @Req() req: any) {
    if (!req.user) {
      throw new HttpException(
        'You are highly forbidden!!!',
        HttpStatus.FORBIDDEN,
      );
    }

    return await this.userService.changePassword(body, req?.user?.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('notifications')
  async userNotifications(
    @Req() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 25,
  ) {
    return await this.userService.findNotifications(page, limit, req.user?.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/account/delete')
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
  async requestSoftDeleteAcc(
    @Param('id') id: string,
    @Body() body: AccountDeletionDTO,
  ) {
    return await this.userService.requestAccountDeletion(body, id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/delete')
  async deleteUser(@Param('id') id: string, @Req() req: any) {
    return await this.userService.deleteUser(req?.user?.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('account/delete')
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
  async deleteAccountWeb(@Body() body: AccountDeletionWebDTO) {
    return await this.userService.requestAccountDeletionWeb(body);
  }
}
