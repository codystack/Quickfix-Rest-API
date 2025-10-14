import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from 'src/schemas/notification.schema';
import { Orders } from 'src/schemas/orders.schema';
import { User } from 'src/schemas/user.schema';
import { CreateOrderDTO } from './dtos/createorder.dto';
import { Service } from 'src/schemas/service.schema';
import { Express } from 'src/schemas/express.schema';
import { Admin } from 'src/schemas/admin.schema';
import {
  AccessRights,
  AdminRoles,
  AdminType,
} from 'src/admins/dtos/createadmin.dto';
import { TrackOrderDTO } from './dtos/track_order.dto';
import { Activities } from 'src/schemas/activities.schema';
import { AdminWallet } from 'src/schemas/admin.wallet.schema';

function generateUniqueCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 7; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(User.name)
    private userRepository: Model<User>,
    @InjectModel(Admin.name)
    private adminRepository: Model<Admin>,
    @InjectModel(Orders.name) private ordersRepository: Model<Orders>,
    @InjectModel(Service.name) private serviceRepository: Model<Service>,
    @InjectModel(AdminWallet.name)
    private adminWalletRepository: Model<AdminWallet>,
    @InjectModel(Notification.name)
    private notificationsRepository: Model<Notification>,
    @InjectModel(Express.name)
    private expressRepository: Model<Express>,
    @InjectModel(Activities.name)
    private activityRepository: Model<Activities>,
  ) {}

  async createOrder(
    payload: CreateOrderDTO,
    email_address: string,
    transactionID: string,
  ) {
    //First check if user exist and marketplace exists
    const usr = await this.userRepository
      .findOne({
        email_address: email_address,
      })
      .lean()
      .exec();
    if (!usr) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    }

    const newOrder = await new this.ordersRepository({
      amount: payload.amount,
      originalAmount: payload?.originalAmount,
      discount: payload?.discount,
      description: payload.description,
      service: payload.service,
      address: payload?.address,
      delivery_fee: payload?.delivery_fee,
      deliver_type: payload?.delivery_type,
      landmark: payload?.landmark,
      pickup_date: payload?.pickup_date,
      location: payload?.location,
      transaction: transactionID,
      express: payload?.express,
      order_id: generateUniqueCode(),
      user: usr?._id,
      items: payload.items,
      created_at: new Date(),
      updated_at: new Date(),
    }).save();

    await new this.notificationsRepository({
      title: `You just placed a new order (${newOrder.order_id})}`,
      user: usr?._id,
    }).save();

    return newOrder;
  }

  async manualCreateOrder(
    payload: CreateOrderDTO,
    email_address: string,
    transactionID: string,
  ) {
    if (!payload?.userId) {
      throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
    }

    const adm = await this.adminRepository.findOne({
      email_address: email_address,
    });
    if (!adm) {
      throw new HttpException('No admin found.', HttpStatus.NOT_FOUND);
    }

    if (
      adm.type !== AdminType.SUPER_ADMIN &&
      adm.role !== AdminRoles.MANAGER &&
      adm.access !== AccessRights.READ_WRITE
    ) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'You do not hava necessary privileges for this action',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const usr = await this.userRepository
      .findOne({
        _id: payload.userId,
      })
      .lean()
      .exec();
    if (!usr) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    }

    const newOrder = await new this.ordersRepository({
      amount: payload.amount,
      originalAmount: payload?.originalAmount,
      discount: payload?.discount,
      description: payload.description,
      service: payload.service,
      address: payload?.address,
      delivery_fee: payload?.delivery_fee,
      deliver_type: payload?.delivery_type,
      landmark: payload?.landmark,
      pickup_date: payload?.pickup_date,
      location: payload?.location,
      transaction: transactionID,
      order_id: generateUniqueCode(),
      user: usr?._id,
      items: payload.items,
      created_at: new Date(),
      updated_at: new Date(),
    }).save();

    // Now record to admin wallet
    const adminWallet = await this.adminWalletRepository.find({}).lean().exec();
    if (adminWallet && adminWallet.length > 0) {
      // It does exists. Now Update amounts
      await this.adminWalletRepository.updateOne(
        { id: adminWallet[0]?._id },
        {
          $set: {
            balance:
              adminWallet[0]?.balance + parseInt(`${payload?.amount}`, 10),
            prev_balance: adminWallet[0]?.balance,
          },
        },
      );
    } else {
      // Create new
      await new this.adminWalletRepository({
        balance: 0 + payload.amount,
        prev_balance: 0,
      }).save();
    }

    await new this.notificationsRepository({
      title: `You just placed a new order (${newOrder.order_id})}`,
      user: usr?._id,
    }).save();

    return newOrder;
  }

  async all(page: number, limit: number, category?: string) {
    const skip = (page - 1) * limit; // Calculate the number of records to skip

    if (category) {
      const services = await this.serviceRepository
        .find({ category: category })
        .lean()
        .exec();

      if (!services || services.length < 1) {
        throw new HttpException('No services found', HttpStatus.NOT_FOUND);
      }

      const servicesIds: string[] = services?.map((item) =>
        item?._id?.toString(),
      );

      const [data, total] = await Promise.all([
        this.ordersRepository
          .find({
            deletedAt: null,
            service: { $in: servicesIds }, // serviceIds is the array of IDs to filter by
          })
          .populate('user')
          .populate('service')
          .populate('location')
          .populate('transaction')
          .sort({ createdAt: -1 })
          .skip(skip) // Skip the records
          .limit(limit) // Limit the number of records returned
          .exec(),
        this.ordersRepository.countDocuments({
          deletedAt: null,
          service: { $in: servicesIds },
        }), // Count total documents for calculating total pages
      ]);

      return {
        data,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        perPage: limit,
      };
    } else {
      const [data, total] = await Promise.all([
        this.ordersRepository
          .find({ deletedAt: null })
          .populate('user')
          .populate('service')
          .populate('location')
          .populate('transaction')
          .sort({ createdAt: -1 })
          .skip(skip) // Skip the records
          .limit(limit) // Limit the number of records returned
          .exec(),
        this.ordersRepository.countDocuments(), // Count total documents for calculating total pages
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

  findServiceById(id: any): Promise<Orders> {
    return this.ordersRepository.findById(id).lean().exec();
  }

  async updateOrder(email_address: string, payload: any, id: string) {
    if (!payload) {
      throw new HttpException('Payload not provided!', HttpStatus.BAD_REQUEST);
    }

    const adm = await this.adminRepository
      .findOne({
        email_address: email_address,
      })
      .lean()
      .exec();

    if (!adm)
      throw new HttpException('No admin record found.', HttpStatus.NOT_FOUND);

    if (
      adm.access !== AccessRights.READ_WRITE &&
      adm.role !== AdminRoles.MANAGER &&
      adm.role !== AdminRoles.DEVELOPER
    ) {
      throw new HttpException('You are forbidden', HttpStatus.FORBIDDEN);
    }

    await this.ordersRepository.updateOne({ _id: id }, { ...payload });

    const updatedOrder = await this.ordersRepository
      .findOne({
        _id: id,
      })
      .lean()
      .exec();

    return {
      message: 'Order updated successfully',
      data: updatedOrder,
    };
  }

  async deleteOrder(email_address: string, id: string) {
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

    await this.ordersRepository.deleteOne({ _id: id });

    await new this.activityRepository({
      title: `${admin?.first_name} ${admin?.last_name} deleted a order on ${new Date().toLocaleString('en-GB')}`,
      category: 'order',
      admin: admin?._id,
    }).save();

    return {
      message: 'Order deleted successfully',
      data: null,
    };
  }

  async allOrderStatus(page: number, limit: number, status: string) {
    const skip = (page - 1) * limit; // Calculate the number of records to skip

    const [data, total] = await Promise.all([
      this.ordersRepository
        .find({
          status: status.toLowerCase(),
        })
        .populate('user')
        .populate('service')
        .populate('location')
        .populate('transaction')
        .sort({ createdAt: -1 })
        .skip(skip) // Skip the records
        .limit(limit) // Limit the number of records returned
        .exec(),
      this.ordersRepository.countDocuments({ status: status.toLowerCase() }), // Count total documents for calculating total pages
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async allUserOrders(page: number, limit: number, email_address: string) {
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
      this.ordersRepository
        .find({
          user: userObj?._id,
        })
        .populate('user')
        .populate('service')
        .populate('location')
        .populate('transaction')
        .sort({ createdAt: -1 })
        .skip(skip) // Skip the records
        .limit(limit) // Limit the number of records returned
        .exec(),
      this.ordersRepository.countDocuments({ user: userObj?._id }), // Count total documents for calculating total pages
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async userTrackableOrders(
    page: number,
    limit: number,
    email_address: string,
  ) {
    // Get user data first
    const userObj = await this.userRepository
      .findOne({ email_address: email_address })
      .lean()
      .exec();

    if (!userObj) {
      throw new HttpException('User record not found', HttpStatus.NOT_FOUND);
    }
    const skip = (page - 1) * limit; // Calculate the number of records to skip

    // Query trackable orders and total count
    const [data, total] = await Promise.all([
      this.ordersRepository
        .find({
          user: userObj?._id,
          status: { $nin: ['delivered', 'declined'] }, // Exclude delivered and declined statuses
        })
        .populate('user')
        .populate('service')
        .populate('location')
        .populate('transaction')
        .skip(skip) // Skip the records
        .limit(limit) // Limit the number of records returned
        .exec(),
      this.ordersRepository.countDocuments({
        user: userObj?._id,
        status: { $nin: ['delivered', 'declined'] }, // Same condition for count
      }),
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async getExpress() {
    return await this.expressRepository.find({}).lean().exec();
  }

  async trackOrder(payload: TrackOrderDTO) {
    const order = await this.ordersRepository
      .findOne({
        order_id: payload?.order_id,
      })
      .populate('service')
      .populate('location')
      .lean()
      .exec();

    if (!order) {
      throw new HttpException('Order not found!', HttpStatus.NOT_FOUND);
    }

    return order;
  }

  async calcRevenues() {
    const trans = await this.ordersRepository.find({}).lean().exec();
    let chargeTotal = 0;
    let overall = 0;
    let counter = 0;

    for (let index = 0; index < trans.length; index++) {
      const order = trans[index];
      counter = counter + 1;
      overall = overall + order?.amount;
      chargeTotal = chargeTotal + order?.amount;
    }

    // if (counter >= trans.length) {
    //   return {
    //     charges: chargeTotal,
    //     topups: topupTotal,
    //     total: overall,
    //   };
    // }

    return {
      charges: chargeTotal,
      total: overall,
    };
  }
}
