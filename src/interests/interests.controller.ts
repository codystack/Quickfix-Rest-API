// import { Controller } from '@nestjs/common';

// @Controller('interests')
// export class InterestsController {
//   // constructor(private service: InterestsService) {}
//   // @UseGuards(JwtAuthGuard)
//   // @Post('save')
//   // @UsePipes(
//   //   new ValidationPipe({
//   //     exceptionFactory: (errors: ValidationError[]) => {
//   //       const validationErrors = errors.map((error) => ({
//   //         field: error.property,
//   //         errors: Object.values(error.constraints || {}),
//   //       }));
//   //       // Extract the first error message from the validation errors
//   //       const firstErrorField = validationErrors[0].field;
//   //       const firstErrorMessage = validationErrors[0].errors[0];
//   //       return new BadRequestException({
//   //         statusCode: 400,
//   //         message: `${firstErrorField}: ${firstErrorMessage}`,
//   //         errors: validationErrors,
//   //       });
//   //     },
//   //   }),
//   // )
//   // showInterest(@Body() body: AddInterestDTO, @Req() req: any) {
//   //   return this.service.saveInterest(body, req?.user?.sub);
//   // }
//   // @UseGuards(JwtAuthGuard)
//   // @Get('all')
//   // async all(
//   //   @Req() req: any,
//   //   @Query('page') page: number = 1,
//   //   @Query('limit') limit: number = 25,
//   // ) {
//   //   return this.service.allInterests(page, limit);
//   // }
// }
