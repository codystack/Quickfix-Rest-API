import { Module } from '@nestjs/common';
import { AdminAuthService } from './adminauth.service';
import { Activities, ActivitiesSchema } from 'src/schemas/activities.schema';
import { Admin, AdminSchema } from 'src/schemas/admin.schema';
import { OTP, OTPSchema } from 'src/schemas/otp.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { AdminsService } from 'src/admins/admins.service';
import { OtpService } from 'src/otp/otp.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './utils/local_strategy';
import { JwtStrategy } from './utils/jwt_strategy';
import { AdminAuthController } from './adminauth.controller';

import { Banner, BannerSchema } from 'src/schemas/banner.schema';
import { Social, SocialSchema } from 'src/schemas/socials.schema';
import { Settings, SettingsSchema } from 'src/schemas/settings.schema';
import { LocationSchema, Location } from 'src/schemas/location.schema';
import { Express, ExpressSchema } from 'src/schemas/express.schema';
import {
  Notification,
  NotificationSchema,
} from 'src/schemas/notification.schema';
import { SmsService } from 'src/sms/sms.service';
import { SendChampService } from 'src/sms/providers/sendchamp.service';
import { TermiiService } from 'src/sms/providers/termii.service';
import {
  AdminWallet,
  AdminWalletSchema,
} from 'src/schemas/admin.wallet.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: User.name, schema: UserSchema },
      { name: OTP.name, schema: OTPSchema },
      { name: Activities.name, schema: ActivitiesSchema },
      { name: Social.name, schema: SocialSchema },
      { name: Banner.name, schema: BannerSchema },
      { name: Settings.name, schema: SettingsSchema },
      { name: Location.name, schema: LocationSchema },
      { name: Express.name, schema: ExpressSchema },
      { name: AdminWallet.name, schema: AdminWalletSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
    PassportModule,
    JwtModule.register({
      secret: 'abc123JakasMan123@09nmdhyuDiloe((30(())',
    }),
  ],
  controllers: [AdminAuthController],
  providers: [
    {
      provide: 'ADMIN_SERVICE',
      useClass: AdminsService,
    },
    {
      provide: 'ADMIN_AUTH_SERVICE',
      useClass: AdminAuthService,
    },
    {
      provide: 'OTP_SERVICE',
      useClass: OtpService,
    },
    SmsService,
    SendChampService,
    TermiiService,
    LocalStrategy,
    JwtStrategy,
  ],
})
export class AdminAuthModule {}
