/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin } from 'src/schemas/admin.schema';
import {
  AccessRights,
  AdminRoles,
  AdminType,
  CreateAdminDTO,
} from './dtos/createadmin.dto';
import { encodePassword } from 'src/utils/bcrypt';
import { Activities } from 'src/schemas/activities.schema';
import { AddSocialDTO } from './dtos/addsocial.dto';
import { Social } from 'src/schemas/socials.schema';
import { AddBannerDTO } from './dtos/addbanner.dto';
import { Banner } from 'src/schemas/banner.schema';
import { Settings } from 'src/schemas/settings.schema';
import { Express } from 'src/schemas/express.schema';
import { AddExpressDTO } from './dtos/add.express.dto';
import { User } from 'src/schemas/user.schema';
import { AdminCreateUserDTO } from 'src/users/dtos/admin.createuser.dto';

import { v4 as uuidv4 } from 'uuid';
import generateRandomPassword from 'src/adminauth/utils/password_generator';
import { Notification } from 'src/schemas/notification.schema';
import { AdminWallet } from 'src/schemas/admin.wallet.schema';

@Injectable()
export class AdminsService {
  constructor(
    @InjectModel(Admin.name)
    private adminRepository: Model<Admin>,
    @InjectModel(User.name)
    private userRepository: Model<User>,
    @InjectModel(Activities.name)
    private activitiesRepository: Model<Activities>,
    @InjectModel(Social.name)
    private socialRepository: Model<Social>,
    @InjectModel(Banner.name)
    private bannerRepository: Model<Banner>,
    @InjectModel(Settings.name)
    private settingsRepository: Model<Settings>,
    @InjectModel(Express.name)
    private expressRepository: Model<Express>,
    @InjectModel(Notification.name)
    private notificationRepository: Model<Notification>,
    @InjectModel(AdminWallet.name)
    private adminWalletRepository: Model<AdminWallet>,
  ) {}

  private generateReferralId(firstName: string): string {
    // Generate a short UUID or random string and append it to the first name
    const uniquePart = uuidv4().slice(0, 4); // Taking the first 6 characters of UUID
    return `${firstName}${uniquePart}`;
  }

  async findAdmins(page: number, limit: number) {
    const skip = (page - 1) * limit; // Calculate the number of records to skip

    const [data, total] = await Promise.all([
      this.adminRepository
        .find({})
        .populate('location')
        .skip(skip) // Skip the records
        .limit(limit) // Limit the number of records returned
        .exec(),
      this.adminRepository.countDocuments(), // Count total documents for calculating total pages
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async createAdmin(createAdmin: CreateAdminDTO): Promise<any> {
    // Check if email or password is used
    const exists = await this.adminRepository
      .findOne({
        email_address: createAdmin.email_address,
      })
      .lean()
      .exec();

    if (exists) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Email address already in use',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const phoneExists = await this.adminRepository.findOne({
      phone_number: createAdmin.phone_number,
    });

    if (phoneExists) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Phone number already in use',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const encodedPassword = await encodePassword(createAdmin.password);
    const newAdmin = await new this.adminRepository({
      password: encodedPassword,
      email_address: createAdmin?.email_address,
      first_name: createAdmin?.first_name,
      last_name: createAdmin.last_name,
      phone_number: createAdmin?.phone_number,
      role: createAdmin?.role,
      access: createAdmin?.access,
      is_email_verified: false,
      is_profile_set: false,
      type: createAdmin?.type,
      location: createAdmin?.location,
      photo: '',
      address: createAdmin.address,
      created_at: new Date(),
      updated_at: new Date(),
    }).save();

    await new this.activitiesRepository({
      category: 'welcome',
      title: `Welcome to QuickFix`,
      admin: newAdmin?.id ?? newAdmin?._id,
    }).save();

    return {
      message: 'Operation successful',
      data: newAdmin,
    };
  }

  async createUser(
    email_address: string,
    payload: AdminCreateUserDTO,
  ): Promise<any> {
    let referralId: string;
    let isUnique = false;

    const adm = await this.adminRepository
      .findOne({
        email_address: email_address,
      })
      .lean()
      .exec();

    if (!adm) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'Admin not found!',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (
      adm.type !== AdminType.SUPER_ADMIN &&
      adm.role !== AdminRoles.MANAGER &&
      adm.role !== AdminRoles.DEVELOPER &&
      adm.access !== AccessRights.READ_WRITE
    ) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'You are forbidden!',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    // Check if email or password is used
    const exists = await this.userRepository
      .findOne({
        email_address: payload.email_address,
      })
      .lean()
      .exec();

    if (exists) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Email address already in use',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const phoneExists = await this.userRepository.findOne({
      phone_number: payload.phone_number,
    });

    if (phoneExists) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Phone number already in use',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Now create referral code
    while (!isUnique) {
      referralId = this.generateReferralId(payload.first_name);
      const existingUser = await this.userRepository.findOne({
        where: { referral_code: referralId },
      });

      if (!existingUser) {
        isUnique = true;
      }
    }

    if (isUnique === true) {
      const generatedPassword = generateRandomPassword();
      const encodedPassword = await encodePassword(generatedPassword);
      const newUser = await new this.userRepository({
        password: encodedPassword,
        email_address: payload?.email_address,
        first_name: payload?.first_name,
        last_name: payload.last_name,
        phone_number: payload?.phone_number,
        international_phone_format: payload?.international_phone_format,
        dial_code: payload.dial_code,
        referral_code: referralId,
        is_email_verified: false,
        is_profile_set: false,
        created_at: new Date(),
        updated_at: new Date(),
      }).save();

      await new this.activitiesRepository({
        category: 'user',
        title: `${adm?.first_name} ${adm?.last_name} created a new user`,
        admin: adm?._id,
      }).save();

      await new this.notificationRepository({
        category: 'welcome',
        title: `Welcome to QuickFix`,
        user: newUser?.id ?? newUser?._id,
      }).save();

      return {
        message: 'New user successfully created',
        data: newUser,
      };
    }
  }

  async findAdminByUsername(email_address: string): Promise<any> {
    const foundAdmin = await this.adminRepository
      .findOne({
        email_address: email_address,
      })
      .lean()
      .exec();

    return foundAdmin;
  }

  findAdminById(id: any): Promise<Admin> {
    return this.adminRepository.findById(id).lean().exec();
  }

  async updateAdmin(email_address: string, payload: any) {
    // console.log('PAYLOAD PROFILE UPDATE ::: ', payload);

    if (!payload) {
      throw new HttpException('Payload not provided!', HttpStatus.BAD_REQUEST);
    }

    const user = await this.adminRepository.findOne({
      email_address: email_address,
    });

    if (!user)
      throw new HttpException('No record found.', HttpStatus.NOT_FOUND);

    await this.adminRepository.updateOne(
      { email_address: email_address },
      { ...payload },
    );
    const updatedAdmin = await this.adminRepository
      .findOne({
        email_address: email_address,
      })
      .lean()
      .exec();

    await new this.activitiesRepository({
      status: 'success',
      title: `You updated ${updatedAdmin?.first_name} ${updatedAdmin?.last_name}'s profile on ${new Date().toLocaleString('en-GB')}`,
      type: 'profile',
      admin: user?.id ?? user?._id,
    }).save();

    const { password, ...data } = updatedAdmin;
    console.log('REMOVED PASWORD ::: ', password);

    global.io?.emit('profile-updated', {
      message: 'You updated your profile',
      user: data,
    });

    return {
      message: 'Profile updated successfully',
      user: data,
    };
  }

  async suspendAdmin(email_address: string, id: string) {
    try {
      //First check if user exist and marketplace exists
      const adm = await this.adminRepository.findOne({
        email_address: email_address,
      });
      if (!adm) {
        throw new HttpException('No admin found.', HttpStatus.NOT_FOUND);
      }

      if (
        adm.type !== 'superadmin' &&
        adm.role !== 'manager' &&
        adm.role !== 'developer' &&
        adm.access !== 'read/write'
      ) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: 'You do not hava necessary privileges for this action',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const foundAdmin = await this.adminRepository.findOne({
        _id: id,
      });
      if (!foundAdmin) {
        throw new HttpException(
          'Admin record not found.',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.adminRepository
        .updateOne(
          { _id: foundAdmin?.id ?? foundAdmin?._id ?? id },
          { $set: { status: 'suspended' } },
        )
        .lean()
        .exec();

      await new this.activitiesRepository({
        category: 'admin',
        title: `${adm?.first_name} ${adm?.last_name} suspended the admin account (${foundAdmin?.first_name} ${foundAdmin?.last_name}) on ${Date.now().toLocaleString('en-US')}`,
        admin: adm?._id ?? adm?.id,
      }).save();

      return {
        message: 'Admin account suspended successfully',
        data: null,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async pardonAdmin(email_address: string, id: string) {
    try {
      //First check if user exist and marketplace exists
      const adm = await this.adminRepository.findOne({
        email_address: email_address,
      });
      if (!adm) {
        throw new HttpException('No admin found.', HttpStatus.NOT_FOUND);
      }

      if (
        adm.type !== 'superadmin' &&
        adm.role !== 'manager' &&
        adm.role !== 'developer' &&
        adm.access !== 'read/write'
      ) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: 'You do not hava necessary privileges for this action',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const foundAdmin = await this.adminRepository.findOne({
        _id: id,
      });
      if (!foundAdmin) {
        throw new HttpException(
          'Admin record not found.',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.adminRepository
        .updateOne(
          { _id: foundAdmin?.id ?? foundAdmin?._id ?? id },
          { $set: { status: 'active' } },
        )
        .lean()
        .exec();

      await new this.activitiesRepository({
        category: 'admin',
        title: `${adm?.first_name} ${adm?.last_name} pardoned the admin account (${foundAdmin?.first_name} ${foundAdmin?.last_name}) on ${Date.now().toLocaleString('en-US')}`,
        admin: adm?._id ?? adm?.id,
      }).save();

      return {
        message: 'Admin account pardoned successfully',
        data: null,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async deleteAdmin(email_address: string, id: string) {
    try {
      //First check if user exist and marketplace exists
      const adm = await this.adminRepository.findOne({
        email_address: email_address,
      });
      if (!adm) {
        throw new HttpException('No admin found.', HttpStatus.NOT_FOUND);
      }

      if (
        adm.type !== 'superadmin' &&
        adm.role !== 'manager' &&
        adm.access !== 'read/write'
      ) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: 'You do not hava necessary privileges for this action',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const foundAdmin = await this.adminRepository.findOne({
        _id: id,
      });
      if (!foundAdmin) {
        throw new HttpException(
          'Admin record not found.',
          HttpStatus.NOT_FOUND,
        );
      }

      await new this.activitiesRepository({
        category: 'admin',
        title: `${adm?.first_name} ${adm?.last_name} deleted the admin account (${foundAdmin?.first_name} ${foundAdmin?.last_name}) on ${Date.now().toLocaleString('en-US')}`,
        admin: adm?._id ?? adm?.id,
      }).save();

      await this.adminRepository
        .deleteOne({ _id: foundAdmin?.id ?? foundAdmin?._id ?? id })
        .lean()
        .exec();

      return {
        message: 'Admin account deleted successfully',
        data: null,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async findCurrentAdmin(email_address: string) {
    const admin = await this.adminRepository
      .findOne({ email_address: email_address })
      .lean()
      .exec();

    const { password: ingnore, ...rest } = admin;

    return rest;
  }

  async saveSocial({ logo, name, url }: AddSocialDTO, email_address: string) {
    try {
      //First check if user exist and marketplace exists
      const adm = await this.adminRepository.findOne({
        email_address: email_address,
      });
      if (!adm) {
        throw new HttpException('No admin found.', HttpStatus.NOT_FOUND);
      }

      if (
        adm.role !== AdminRoles.MANAGER &&
        adm.role !== AdminRoles.DEVELOPER &&
        adm.role !== AdminRoles.EDITOR &&
        adm.access !== AccessRights.READ_WRITE
      ) {
        throw new HttpException(
          'You do not have the right privilege.',
          HttpStatus.FORBIDDEN,
        );
      }

      await new this.socialRepository({
        logo: logo,
        name: name,
        url: url,
        created_at: new Date(),
        updated_at: new Date(),
      }).save();

      await new this.activitiesRepository({
        category: 'social',
        title: `${adm?.first_name} ${adm?.last_name} added a new social platform on ${Date.now().toLocaleString('en-US')}`,
        admin: adm?._id ?? adm?.id,
      }).save();

      return {
        message: 'Social platform added successfully.',
        data: null,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async saveBannerAd(
    { endDate, preview, startDate, title, type, url }: AddBannerDTO,
    email_address: string,
  ) {
    try {
      //First check if user exist and marketplace exists
      const adm = await this.adminRepository.findOne({
        email_address: email_address,
      });
      if (!adm) {
        throw new HttpException('No admin found.', HttpStatus.NOT_FOUND);
      }

      await new this.bannerRepository({
        amount: 0,
        preview: preview,
        status: 'inactive',
        title: title,
        type: type,
        url: url,
        created_at: new Date(),
        updated_at: new Date(),
      }).save();

      await new this.activitiesRepository({
        category: 'banner',
        title: `${adm?.first_name} ${adm?.last_name} added a new banner advert on ${Date.now().toLocaleString('en-US')}`,
        admin: adm?._id ?? adm?.id,
      }).save();

      return {
        message: 'Banner advert added successfully. Awaiting approval',
        data: null,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async updateBannerAd(
    { status, type, preview, title, url }: any,
    email_address: string,
    id: string,
  ) {
    try {
      //First check if user exist and marketplace exists
      const adm = await this.adminRepository.findOne({
        email_address: email_address,
      });
      if (!adm) {
        throw new HttpException('No admin found.', HttpStatus.NOT_FOUND);
      }

      const foundBanner = await this.bannerRepository.findOne({
        _id: id,
      });
      if (!foundBanner) {
        throw new HttpException('Banner not found.', HttpStatus.NOT_FOUND);
      }

      const updatedBanner = await this.bannerRepository
        .updateOne(
          { _id: id },
          {
            status: status,
            type: type,
            preview: preview,
            title: title,
            amount: 0,
            url: url,
          },
        )
        .lean()
        .exec();

      await new this.activitiesRepository({
        category: 'banner',
        title: `${adm?.first_name} ${adm?.last_name} update banner advert (${foundBanner?.title}) on ${Date.now().toLocaleString('en-US')}`,
        admin: adm?._id ?? adm?.id,
      }).save();

      return {
        message: 'Banner advert update successfully',
        data: updatedBanner,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async deleteBannerAd(email_address: string, id: string) {
    try {
      //First check if user exist and marketplace exists
      const adm = await this.adminRepository.findOne({
        email_address: email_address,
      });
      if (!adm) {
        throw new HttpException('No admin found.', HttpStatus.NOT_FOUND);
      }

      const foundBanner = await this.bannerRepository.findOne({
        _id: id,
      });
      if (!foundBanner) {
        throw new HttpException('Banner not found.', HttpStatus.NOT_FOUND);
      }

      await new this.activitiesRepository({
        category: 'banner',
        title: `${adm?.first_name} ${adm?.last_name} update banner advert (${foundBanner?.title}) on ${Date.now().toLocaleString('en-US')}`,
        user: adm?._id ?? adm?.id,
      }).save();

      //       await this.userRepository.updateOne({ _id: userId }, { $set: { status: 'active' } }).exec();
      // await this.bannerRepository.deleteOne({ _id: userId }).exec();

      await this.bannerRepository.deleteOne({ _id: id });

      return {
        message: 'Banner advert deleted successfully',
        data: null,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async updateSocial(
    { name, logo, url }: any,
    email_address: string,
    id: string,
  ) {
    try {
      //First check if user exist and marketplace exists
      const adm = await this.adminRepository.findOne({
        email_address: email_address,
      });
      if (!adm) {
        throw new HttpException('No admin found.', HttpStatus.NOT_FOUND);
      }

      const foundSocial = await this.socialRepository.findOne({
        _id: id,
      });
      if (!foundSocial) {
        throw new HttpException(
          'Social record not found.',
          HttpStatus.NOT_FOUND,
        );
      }

      const updatedSocial = await this.socialRepository
        .updateOne(
          { _id: foundSocial?.id ?? foundSocial?._id ?? id },
          {
            name: name,
            logo: logo,
            url: url,
          },
        )
        .lean()
        .exec();

      await new this.activitiesRepository({
        category: 'social',
        title: `${adm?.first_name} ${adm?.last_name} updated ${foundSocial?.name} account info on ${Date.now().toLocaleString('en-US')}`,
        admin: adm?._id ?? adm?.id,
      }).save();

      return {
        message: 'Social account info update successfully',
        data: updatedSocial,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async deleteSocial(email_address: string, id: string) {
    try {
      //First check if user exist and marketplace exists
      const adm = await this.adminRepository.findOne({
        email_address: email_address,
      });
      if (!adm) {
        throw new HttpException('No admin found.', HttpStatus.NOT_FOUND);
      }

      const foundSocial = await this.socialRepository.findOne({
        _id: id,
      });
      if (!foundSocial) {
        throw new HttpException(
          'Social record not found.',
          HttpStatus.NOT_FOUND,
        );
      }

      await new this.activitiesRepository({
        category: 'social',
        title: `${adm?.first_name} ${adm?.last_name} update banner advert (${foundSocial?.name}) on ${Date.now().toLocaleString('en-US')}`,
        admin: adm?._id ?? adm?.id,
      }).save();

      await this.socialRepository
        .deleteOne({ _id: foundSocial?.id ?? foundSocial?._id ?? id })
        .lean()
        .exec();

      return {
        message: 'Social account deleted successfully',
        data: null,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async getAdminWallet() {
    return await this.adminWalletRepository.find({}).lean().exec();
  }

  async getSocials() {
    return await this.socialRepository.find({}).lean().exec();
  }

  async getBanners() {
    return await this.bannerRepository.find({}).lean().exec();
  }

  async getActiveBanners() {
    return await this.bannerRepository.find({ status: 'active' }).lean().exec();
  }

  async manageSettings(
    {
      email_address: appEmail,
      phone_number,
      office_address,
      get_started,
      delivery_fee,
      pickup_fee,
      pickup_n_delivery,
      get_started_title,
    }: any,
    email_address: string,
  ) {
    try {
      //First check if user exist and marketplace exists
      const adm = await this.adminRepository.findOne({
        email_address: email_address,
      });
      if (!adm) {
        throw new HttpException('No admin found.', HttpStatus.NOT_FOUND);
      }

      const foundSettings = await this.settingsRepository.find({});
      if (foundSettings.length < 1) {
        // Create new
        await new this.settingsRepository({
          phone_number: phone_number,
          email_address: appEmail,
          office_address: office_address,
          get_started: get_started,
          get_started_title: get_started_title,
          delivery_fee: delivery_fee,
          pickup_n_delivery: pickup_n_delivery,
          pickup_fee: pickup_fee,
          created_at: new Date(),
          updated_at: new Date(),
        }).save();

        await new this.activitiesRepository({
          category: 'settings',
          title: `${adm?.first_name} ${adm?.last_name} updated platform settings`,
          admin: adm?._id ?? adm?.id,
        }).save();
      } else {
        // Update current
        console.log('TRIGGER HERE JAREH');

        await this.settingsRepository
          .updateOne(
            { _id: foundSettings[0]?.id ?? foundSettings[0]?._id },
            {
              phone_number: phone_number,
              email_address: appEmail,
              office_address: office_address,
              get_started: get_started,
              get_started_title: get_started_title,
              delivery_fee: delivery_fee,
              pickup_n_delivery: pickup_n_delivery,
              pickup_fee: pickup_fee,
            },
          )
          .lean()
          .exec();

        await new this.activitiesRepository({
          category: 'settings',
          title: `${adm?.first_name} ${adm?.last_name} update platform settings on ${Date.now().toLocaleString('en-US')}`,
          user: adm?._id ?? adm?.id,
        }).save();
      }

      return {
        message: 'Operation completed successfully',
        data: null,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async findSettings() {
    return await this.settingsRepository.find({}).lean().exec();
  }

  async allActivities(page: number, limit: number) {
    const skip = (page - 1) * limit; // Calculate the number of records to skip

    const [data, total] = await Promise.all([
      this.activitiesRepository
        .find({})
        .skip(skip) // Skip the records
        .limit(limit) // Limit the number of records returned
        .populate(
          'admin',
          'first_name last_name email_address phone_number photoUrl role type',
        )
        .exec(),
      this.activitiesRepository.countDocuments(), // Count total documents for calculating total pages
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async addExpress(email_address: string, { fee, name }: AddExpressDTO) {
    try {
      //First check if user exist and marketplace exists
      const adm = await this.adminRepository.findOne({
        email_address: email_address,
      });
      if (!adm) {
        throw new HttpException('No admin found.', HttpStatus.NOT_FOUND);
      }

      if (
        adm.type !== AdminType.SUPER_ADMIN &&
        adm.role !== AdminRoles.MANAGER &&
        adm.role !== AdminRoles.DEVELOPER &&
        adm.access !== AccessRights.READ_WRITE
      ) {
        throw new HttpException(
          'You do not have the right privilege.',
          HttpStatus.FORBIDDEN,
        );
      }

      await new this.expressRepository({
        fee: fee,
        name: name,
        created_at: new Date(),
        updated_at: new Date(),
      }).save();

      await new this.activitiesRepository({
        category: 'express',
        title: `${adm?.first_name} ${adm?.last_name} added a new express information`,
        admin: adm?._id ?? adm?.id,
      }).save();

      return {
        message: 'Express charge added successfully.',
        data: null,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async findExpress() {
    return await this.expressRepository.find({}).lean().exec();
  }

  async updateExpress(
    email_address: string,
    id: string,
    payload: AddExpressDTO,
  ) {
    try {
      //First check if user exist and marketplace exists
      const adm = await this.adminRepository.findOne({
        email_address: email_address,
      });
      if (!adm) {
        throw new HttpException('No admin found.', HttpStatus.NOT_FOUND);
      }

      if (
        adm.type !== AdminType.SUPER_ADMIN &&
        adm.role !== AdminRoles.MANAGER &&
        adm.role !== AdminRoles.DEVELOPER &&
        adm.access !== AccessRights.READ_WRITE
      ) {
        throw new HttpException(
          'You do not have the right privilege.',
          HttpStatus.FORBIDDEN,
        );
      }

      const foundExpress = await this.expressRepository.findOne({
        _id: id,
      });
      if (!foundExpress) {
        throw new HttpException(
          'Express charge record not found.',
          HttpStatus.NOT_FOUND,
        );
      }

      const updatedExpress = await this.expressRepository
        .updateOne(
          { _id: foundExpress?.id ?? foundExpress?._id ?? id },
          {
            name: payload?.name ?? foundExpress?.name,
            fee: payload?.fee ?? foundExpress?.fee,
          },
        )
        .lean()
        .exec();

      await new this.activitiesRepository({
        category: 'express',
        title: `${adm?.first_name} ${adm?.last_name} updated express ${payload?.name}`,
        admin: adm?._id ?? adm?.id,
      }).save();

      return {
        message: 'Express charge was updated successfully',
        data: null,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async deleteExpress(email_address: string, id: string) {
    try {
      //First check if user exist and marketplace exists
      const adm = await this.adminRepository.findOne({
        email_address: email_address,
      });
      if (!adm) {
        throw new HttpException('No admin found.', HttpStatus.NOT_FOUND);
      }

      if (
        adm.role !== AdminRoles.MANAGER &&
        adm.role !== AdminRoles.DEVELOPER &&
        adm.type !== AdminType.SUPER_ADMIN &&
        adm.access !== AccessRights.READ_WRITE
      ) {
        throw new HttpException(
          'You do not have the right privilege.',
          HttpStatus.FORBIDDEN,
        );
      }

      const foundExpress = await this.expressRepository.findOne({
        _id: id,
      });
      if (!foundExpress) {
        throw new HttpException(
          'Express record not found.',
          HttpStatus.NOT_FOUND,
        );
      }

      await new this.activitiesRepository({
        category: 'express',
        title: `${adm?.first_name} ${adm?.last_name} deleted express ${foundExpress?.name}`,
        admin: adm?._id ?? adm?.id,
      }).save();

      await this.expressRepository
        .deleteOne({ _id: foundExpress?.id ?? foundExpress?._id ?? id })
        .lean()
        .exec();

      return {
        message: 'Express deleted successfully',
        data: null,
      };
    } catch (error) {
      console.log(error);
    }
  }
}
