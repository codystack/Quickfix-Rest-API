import { Module } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { AdminsController } from './admins.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Activities, ActivitiesSchema } from 'src/schemas/activities.schema';
import { Admin, AdminSchema } from 'src/schemas/admin.schema';

import { Social, SocialSchema } from 'src/schemas/socials.schema';
import { Banner, BannerSchema } from 'src/schemas/banner.schema';
import { AdminAuthService } from 'src/adminauth/adminauth.service';
import { OTP, OTPSchema } from 'src/schemas/otp.schema';
import { OtpService } from 'src/otp/otp.service';
import { User, UserSchema } from 'src/schemas/user.schema';
import { LocalStrategy } from 'src/adminauth/utils/local_strategy';
import { JwtStrategy } from 'src/adminauth/utils/jwt_strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { Settings, SettingsSchema } from 'src/schemas/settings.schema';
import { Location, LocationSchema } from 'src/schemas/location.schema';
import { Express, ExpressSchema } from 'src/schemas/express.schema';
import {
  Notification,
  NotificationSchema,
} from 'src/schemas/notification.schema';
import {
  AdminWallet,
  AdminWalletSchema,
} from 'src/schemas/admin.wallet.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: Activities.name, schema: ActivitiesSchema },
      { name: Social.name, schema: SocialSchema },
      { name: Banner.name, schema: BannerSchema },
      { name: OTP.name, schema: OTPSchema },
      { name: User.name, schema: UserSchema },
      { name: Settings.name, schema: SettingsSchema },
      { name: Location.name, schema: LocationSchema },
      { name: Express.name, schema: ExpressSchema },
      { name: AdminWallet.name, schema: AdminWalletSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
    PassportModule,
    JwtModule.register({
      secret: 'abc123JakasMan123@09nmdhyuDiloe((30(())',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [
    AdminsService,
    {
      provide: 'ADMIN_AUTH_SERVICE',
      useClass: AdminAuthService,
    },
    {
      provide: 'ADMIN_SERVICE',
      useClass: AdminsService,
    },
    {
      provide: 'OTP_SERVICE',
      useClass: OtpService,
    },
    LocalStrategy,
    JwtStrategy,
  ],
  controllers: [AdminsController],
})
export class AdminsModule {}
