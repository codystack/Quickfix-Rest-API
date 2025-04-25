import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { comparePasswords, encodePassword } from 'src/utils/bcrypt';
import { CreateUserDTO } from './dtos/createuser.dto';

import { User } from 'src/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from 'src/schemas/notification.schema';
import { ChangePasswordDTO } from './dtos/changepassword.dto';
import { AccountDeletionDTO } from './dtos/accountdeletion.dto';

import { v4 as uuidv4 } from 'uuid';
import { AccountDeletionWebDTO } from './dtos/accountdeletion.web.dto';
import { Requests } from 'src/schemas/requests.schema';
import { AccessRights, AdminType } from 'src/admins/dtos/createadmin.dto';
import { Activities } from 'src/schemas/activities.schema';
import { Admin } from 'src/schemas/admin.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userRepository: Model<User>,
    @InjectModel(Admin.name)
    private adminRepository: Model<Admin>,
    @InjectModel(Notification.name)
    private notificationRepository: Model<Notification>,
    @InjectModel(Requests.name)
    private requestsRepository: Model<Requests>,
    @InjectModel(Activities.name)
    private activityRepository: Model<Activities>,
  ) {}

  // Method to generate referral ID
  private generateReferralId(firstName: string): string {
    // Generate a short UUID or random string and append it to the first name
    const uniquePart = uuidv4().slice(0, 4); // Taking the first 6 characters of UUID
    return `${firstName}${uniquePart}`;
  }

  async findAllNotifications() {
    return this.notificationRepository.find({});
  }

  async usersList() {
    return this.userRepository
      .find({})
      .select('first_name last_name email_address phone_number photoUrl')
      .lean()
      .exec();
  }

  async findUsers(page: number, limit: number) {
    const skip = (page - 1) * limit; // Calculate the number of records to skip

    const [data, total] = await Promise.all([
      this.userRepository
        .find({})
        .skip(skip) // Skip the records
        .limit(limit) // Limit the number of records returned
        .exec(),
      this.userRepository.countDocuments(), // Count total documents for calculating total pages
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async createUser(createUserDto: CreateUserDTO): Promise<any> {
    let referralId: string;
    let isUnique = false;
    // Check if email or password is used
    const exists = await this.userRepository.findOne({
      email_address: createUserDto.email_address,
    });

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
      phone_number: createUserDto.phone_number,
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
      referralId = this.generateReferralId(createUserDto.first_name);
      const existingUser = await this.userRepository.findOne({
        where: { referral_code: referralId },
      });

      if (!existingUser) {
        isUnique = true;
      }
    }

    if (isUnique === true) {
      const encodedPassword = await encodePassword(createUserDto.password);
      const newUser = await new this.userRepository({
        password: encodedPassword,
        email_address: createUserDto?.email_address.trim(),
        first_name: createUserDto?.first_name.trim(),
        last_name: createUserDto.last_name.trim(),
        phone_number: createUserDto?.phone_number,
        international_phone_format: createUserDto?.international_phone_format,
        dial_code: createUserDto.dial_code,
        referral_code: referralId,
        is_profile_set: false,
        created_at: new Date(),
        updated_at: new Date(),
      }).save();

      await new this.notificationRepository({
        category: 'welcome',
        title: `Welcome to QuickFix`,
        user: newUser?.id ?? newUser?._id,
      }).save();

      return {
        message: 'Operation successful',
        data: newUser,
      };
    }
  }

  async findUserByUsername(email_address: string): Promise<User> {
    const foundUser = await this.userRepository
      .findOne({
        email_address: email_address,
      })
      .lean()
      .exec();

    return foundUser;
  }

  async findUserByPhone(phone_number: string): Promise<User> {
    const foundUser = await this.userRepository
      .findOne({
        international_phone_format: phone_number,
      })
      .lean()
      .exec();

    return foundUser;
  }

  findUserById(id: any): Promise<User> {
    return this.userRepository.findById(id);
  }

  async updateUser(email_address: string, payload: any) {
    // console.log('PAYLOAD PROFILE UPDATE ::: ', payload);

    if (!payload) {
      throw new HttpException('Payload not provided!', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userRepository.findOne({
      email_address: email_address,
    });

    if (!user) throw new HttpException('No user found.', HttpStatus.NOT_FOUND);

    await this.userRepository.updateOne(
      { email_address: email_address },
      { ...payload },
    );
    const updatedUser = await this.userRepository
      .findOne({
        email_address: email_address,
      })
      .lean()
      .exec();

    await new this.notificationRepository({
      status: 'unread',
      title: `You updated your profile on ${new Date().toLocaleString('en-GB')}`,
      type: 'profile',
      email_address: user?.email_address,
    }).save();

    const { password, ...data } = updatedUser;
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

  async deleteUser(email_address: string, id: string) {
    const admin = await this.adminRepository
      .findOne({
        email_address: email_address,
      })
      .lean()
      .exec();

    if (!admin)
      throw new HttpException('No admin record found.', HttpStatus.NOT_FOUND);

    if (
      admin.access !== AccessRights.READ_WRITE &&
      admin.type !== AdminType.SUPER_ADMIN
    ) {
      throw new HttpException('You are not permitted ', HttpStatus.FORBIDDEN);
    }

    await this.userRepository.deleteOne({ _id: id });

    await new this.activityRepository({
      title: `${admin?.first_name} ${admin?.last_name} deleted a user on ${new Date().toLocaleString('en-GB')}`,
      category: 'user',
      admin: admin?._id,
    }).save();

    return {
      message: 'User account deleted successfully',
      data: null,
    };
  }

  async fundWallet(email_address: string, payload: any) {
    if (!payload) {
      throw new HttpException('Payload not provided!', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userRepository.findOne({
      email_address: email_address,
    });

    if (!user) throw new HttpException('No user found.', HttpStatus.NOT_FOUND);
  }

  async changePassword(
    { current_password, new_password }: ChangePasswordDTO,
    email_address: string,
  ): Promise<any> {
    // First check if user exists
    const user = await this.userRepository.findOne({ email_address });
    if (!user) {
      throw new HttpException('No user record found.', HttpStatus.NOT_FOUND);
    }
    // Now check if the current password is correct
    const compare = comparePasswords(current_password, user?.password);
    if (!compare) {
      // Wrong current password
      throw new HttpException(
        'Current password is wrong.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const encodedPassword = await encodePassword(new_password);
    await this.userRepository.updateOne(
      { email_address },
      {
        password: encodedPassword,
      },
    );

    await new this.notificationRepository({
      category: 'password-change',
      title: `You updated your account password`,
      user: user?._id,
    }).save();

    return {
      message: 'Password changed successfully',
      action: 'logout',
      data: null,
    };
  }

  async requestAccountDeletion(
    { reason }: AccountDeletionDTO,
    userId: string,
  ): Promise<any> {
    const newRequest = await new this.requestsRepository({
      reason,
      requests_type: 'account_deletion',
      status: 'pending',
      user: userId,
      created_at: new Date(),
      updated_at: new Date(),
    }).save();

    return {
      message: 'Delete request submitted. Awaiting approval.',
      data: newRequest,
    };
  }

  async requestAccountDeletionWeb({
    emailAddress,
  }: AccountDeletionWebDTO): Promise<any> {
    // First check if account is registered
    const foundUser = await this.userRepository
      .findOne({ email_address: emailAddress })
      .lean()
      .exec();

    if (!foundUser) {
      return {
        message: 'User account not found.',
        data: null,
      };
    }
    const newRequest = await new this.requestsRepository({
      reason: 'Account deletion from web request',
      requests_type: 'account_deletion',
      status: 'pending',
      user: foundUser?._id,
      created_at: new Date(),
      updated_at: new Date(),
    }).save();

    return {
      message: `Hi ${foundUser?.first_name}. Delete request submitted`,
      data: newRequest,
    };
  }

  async findNotifications(page: number, limit: number, email_address: string) {
    // Get user data first
    const userObj = await this.userRepository
      .findOne({ email_address: email_address })
      .lean()
      .exec();

    if (!userObj) {
      throw new HttpException('User record not found', HttpStatus.NOT_FOUND);
    }
    const skip = (page - 1) * limit; // Calculate the number of records to skip

    const [data, total] = await Promise.all([
      this.notificationRepository
        .find({
          user: userObj?._id,
        })
        .skip(skip) // Skip the records
        .limit(limit) // Limit the number of records returned
        .exec(),
      this.notificationRepository.countDocuments({ user: userObj?._id }), // Count total documents for calculating total pages
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }
}
