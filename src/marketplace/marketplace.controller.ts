import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt_guard';
import { Request } from 'express';
import { uploadMultipleImages } from 'src/utils/image-upload';

@Controller('marketplace')
export class MarketplaceController {
  constructor(private service: MarketplaceService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload/images')
  async imagesUpload(@Body() body: any, @Req() req: Request) {
    console.log('USER INFO ::: ', req.user);

    return uploadMultipleImages(body?.images);
  }
}
