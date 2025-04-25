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
import { JwtAuthGuard } from 'src/auth/guards/jwt_guard';
import { OrdersService } from './orders.service';
import { ValidationError } from 'class-validator';
import { CreateOrderDTO } from './dtos/createorder.dto';
import { TrackOrderDTO } from './dtos/track_order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private service: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('manual/create/:tx_ref')
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
  manualOrder(@Body() body: CreateOrderDTO, @Req() req: any) {
    return this.service.manualCreateOrder(
      body,
      req?.user?.sub,
      req?.param?.tx_ref,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async all(
    @Query('category') category?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 25,
  ) {
    return this.service.all(page, limit, category);
  }

  @UseGuards(JwtAuthGuard)
  @Get('all/status')
  async orderaByStatus(
    @Query('status') status: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 25,
  ) {
    return this.service.allOrderStatus(page, limit, status);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/update')
  async update(@Body() body: any, @Req() req: any) {
    return this.service.updateOrder(req.user?.sub, body, req?.params?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/delete')
  async delete(@Req() req: any) {
    return this.service.deleteOrder(req.user?.sub, req?.params?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/all')
  async userOrders(
    @Req() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 25,
  ) {
    return this.service.allUserOrders(
      page,
      limit,
      req?.query?.email_address ?? req?.user?.sub,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/trackables')
  async userTrackableOrder(
    @Req() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 25,
  ) {
    return this.service.userTrackableOrders(page, limit, req?.user?.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('express/all')
  async getExpress() {
    return await this.service.getExpress();
  }

  @Post('track')
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
  trackOrder(@Body() body: TrackOrderDTO) {
    return this.service.trackOrder(body);
  }
}
