import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt_guard';
import { ValidationError } from 'class-validator';
import { AddServiceDTO } from './dtos/addservice.dto';

@Controller('services')
export class ServicesController {
  constructor(private service: ServicesService) {}

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
  addService(@Body() body: AddServiceDTO, @Req() req: any) {
    return this.service.addService(body, req?.user?.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async all() {
    return this.service.allService();
  }

  @UseGuards(JwtAuthGuard)
  @Get('categorized')
  async categorize(@Query('category') category: string) {
    return this.service.findServiceByCategory(category);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/update')
  async update(@Body() body: any, @Req() req: any) {
    return this.service.updateService(req.user?.sub, body, req?.params?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/delete')
  async delete(@Req() req: any) {
    return this.service.deleteService(req?.user?.sub, req?.params?.id);
  }
}
