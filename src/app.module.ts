import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { InterestsModule } from './interests/interests.module';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationModule } from './notification/notification.module';
import { MailerModule } from '@nestjs-modules/mailer';

import { OtpModule } from './otp/otp.module';
import { AdminsModule } from './admins/admins.module';

import { AdminAuthModule } from './adminauth/adminauth.module';
import { AdminAuthService } from './adminauth/adminauth.service';
import { AdminsService } from './admins/admins.service';
import { OtpService } from './otp/otp.service';
import { Activities, ActivitiesSchema } from './schemas/activities.schema';
import { User, UserSchema } from './schemas/user.schema';
import { Admin, AdminSchema } from './schemas/admin.schema';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { OTP, OTPSchema } from './schemas/otp.schema';
import { AppMiddleware } from './app.middleware';
import { PassportModule } from '@nestjs/passport';
import { Social, SocialSchema } from './schemas/socials.schema';
import { Banner, BannerSchema } from './schemas/banner.schema';
import { Settings, SettingsSchema } from './schemas/settings.schema';
import { LocationSchema, Location } from './schemas/location.schema';
import { OrdersModule } from './orders/orders.module';
import { ServicesService } from './services/services.service';
import { ServicesController } from './services/services.controller';
import { ServicesModule } from './services/services.module';
import { TransactionModule } from './transaction/transaction.module';
import { Service, ServiceSchema } from './schemas/service.schema';
import { Orders, OrdersSchema } from './schemas/orders.schema';
import { Requests, RequestsSchema } from './schemas/requests.schema';
import { Transaction, TransactionSchema } from './schemas/transactions.schema';
import {
  Notification,
  NotificationSchema,
} from './schemas/notification.schema';
import { OrdersService } from './orders/orders.service';
import { LocationsController } from './locations/locations.controller';
import { LocationsModule } from './locations/locations.module';
import { LocationService } from './locations/locations.service';
import { Express, ExpressSchema } from './schemas/express.schema';
import {
  DummyTransaction,
  DummyTransactionSchema,
} from './schemas/dummy.transactions.schema';
import { AdminWallet, AdminWalletSchema } from './schemas/admin.wallet.schema';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://appquickpocket:nilZF8z0rIEEh7Ad@cluster0.qzppm.mongodb.net/quickfix',
      {},
    ),
    PassportModule,
    JwtModule.register({
      secret: 'abc123JakasMan123@09nmdhyuDiloe((30(())',
    }),
    MailerModule.forRoot({
      transport: {
        host: 'rbx116.truehost.cloud', // 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'hello@quickpocket.co', // app.quickpocket@gmail.com',
          pass: '$10Password!!', // 'savhpzwofeqzrhcd',
        },
      },
      defaults: {
        from: '"QuickFix" <hello@quickpocket.co>',
      },
    }),
    // ConfigModule
    UsersModule,
    AuthModule,
    MarketplaceModule,
    InterestsModule,
    NotificationModule,
    OtpModule,
    AdminsModule,
    AdminAuthModule,
    MongooseModule.forFeature([
      { name: Activities.name, schema: ActivitiesSchema },
      { name: Admin.name, schema: AdminSchema },
      { name: User.name, schema: UserSchema },
      { name: OTP.name, schema: OTPSchema },
      { name: Social.name, schema: SocialSchema },
      { name: Banner.name, schema: BannerSchema },
      { name: Settings.name, schema: SettingsSchema },
      { name: Location.name, schema: LocationSchema },
      { name: Express.name, schema: ExpressSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: Orders.name, schema: OrdersSchema },
      { name: Requests.name, schema: RequestsSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: AdminWallet.name, schema: AdminWalletSchema },
      { name: DummyTransaction.name, schema: DummyTransactionSchema },
    ]),
    OrdersModule,
    ServicesModule,
    TransactionModule,
    LocationsModule,
  ],
  controllers: [
    AppController,
    ServicesController,
    LocationsController,
  ],
  providers: [
    AppService,
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
    OrdersService,
    JwtService,
    LocationService,
    ServicesService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply the AddHeaderMiddleware to routes starting with '/api/v1'
    consumer.apply(AppMiddleware).forRoutes('/api/v1*');
  }
}
