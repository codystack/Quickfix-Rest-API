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
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt_guard';
import { ValidationError } from 'class-validator';
import { InitializeTransactionDTO } from './dtos/initializetransaction.dto';
import { Request } from 'express';
import { CreateOrderDTO } from 'src/orders/dtos/createorder.dto';

@Controller('transactions')
export class TransactionController {
  constructor(private service: TransactionService) {}

  @UseGuards(JwtAuthGuard)
  @Post('initialize')
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
  initTransaction(@Body() body: InitializeTransactionDTO, @Req() req: any) {
    console.log('INITIALIZE CALLED HERE ::::::');
    return this.service.initializeTransaction(body, req?.user?.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create')
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
  addTransaction(@Body() body: CreateOrderDTO, @Req() req: any) {
    return this.service.createTransaction(body, req?.user?.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async all(
    @Req() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 25,
  ) {
    return this.service.all(page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/all')
  async userTransactions(
    @Req() req: any,
    @Query('email_address') email_address: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 25,
  ) {
    return this.service.allUserTransactions(
      page,
      limit,
      email_address ?? req?.user?.sub,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('revenue')
  async getRevenues() {
    return this.service.calcRevenues();
  }

  @Post('webhook')
  async paymentWebHook(@Req() req: Request) {
    console.log('PAYMENT DATA ::: ', req.body);
    // console.log('PAYMENT DATA ::: ', res.json);

    if (req.body?.event === 'charge.success') {
      // Payment was successful
      // now update transaction here and credit user's wallet here
      // if (req.body?.data?.status === 'success') {
      this.service.webhookAction(req.body?.data);
      // }
    }
  }
}
