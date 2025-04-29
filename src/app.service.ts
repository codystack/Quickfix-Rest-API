import { Injectable, OnModuleInit } from '@nestjs/common';
import { uploadImage, uploadMultipleImages } from './utils/image-upload';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminWallet } from './schemas/admin.wallet.schema';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @InjectModel(AdminWallet.name)
    private adminWalletRepository: Model<AdminWallet>,
  ) {}

  onModuleInit() {
    return this.initWallet();
  }

  getHello(): string {
    return 'Hello World!';
  }

  private initWallet = async () => {
    const wallets = await this.adminWalletRepository.find({}).lean().exec();
    if (!wallets || wallets?.length == 0) {
      // INitialize here
      const wallet = await this.adminWalletRepository.create({
        balance: 0,
        prev_balance: 0,
      });

      wallet.save();
    }
  };

  imageUploader(image: any) {
    return uploadImage(image);
  }

  imagesUploader(images: any[]) {
    return uploadMultipleImages(images);
  }
}
