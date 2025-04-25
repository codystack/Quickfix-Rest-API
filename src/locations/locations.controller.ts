import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { LocationService } from './locations.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt_guard';
import { ValidationError } from 'class-validator';
import { AddLocation } from './dto/Add.Location.dto';

@Controller('locations')
export class LocationsController {
  constructor(private service: LocationService) {}

  @UseGuards(JwtAuthGuard)
  @Post('save')
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
  saveLocation(@Body() body: AddLocation, @Req() req: any) {
    return this.service.saveLocation(body, req?.user?.sub);
  }

  //   @UseGuards(JwtAuthGuard)
  @Get('all')
  async all(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 25,
  ) {
    return this.service.allLocations(page, limit);
  }

  @Get('list')
  async list() {
    return this.service.findAllLocations();
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/update')
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
  updateLocation(@Body() body: AddLocation, @Req() req: any) {
    return this.service.updateLocation(req?.user?.sub, req?.params?.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/delete')
  async deleteLocation(@Req() req: any) {
    return this.service.deleteLocation(req?.user?.sub, req?.params?.id);
  }
}
