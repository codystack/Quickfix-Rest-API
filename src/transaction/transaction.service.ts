import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction } from 'src/schemas/transactions.schema';
import { User, Wallet } from 'src/schemas/user.schema';
import { Notification } from 'src/schemas/notification.schema';
import { InitializeTransactionDTO } from './dtos/initializetransaction.dto';
import axios from 'axios';
import { TransactionType } from 'src/enums/transaction.enum';
import { CreateOrderDTO } from 'src/orders/dtos/createorder.dto';
import { OrdersService } from 'src/orders/orders.service';
import { DummyTransaction } from 'src/schemas/dummy.transactions.schema';
import { AdminWallet } from 'src/schemas/admin.wallet.schema';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(User.name)
    private userRepository: Model<User>,
    @InjectModel(DummyTransaction.name)
    private dummyTransactionRepository: Model<DummyTransaction>,
    @InjectModel(Transaction.name)
    private transactionRepository: Model<Transaction>,
    @InjectModel(Notification.name)
    private notificationsRepository: Model<Notification>,
    @InjectModel(AdminWallet.name)
    private adminWalletRepository: Model<AdminWallet>,
    private orderservice: OrdersService,
  ) {}

  async initializeTransaction(
    { amount, email }: InitializeTransactionDTO,
    email_address: string,
  ) {
    const usr = await this.userRepository
      .findOne({
        email_address: email_address,
      })
      .lean()
      .exec();
    if (!usr) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    }

    // Check amouont for capping
    // let extraAmount = 0;
    // // Apply 1.5% to amount
    // const mult = Math.floor(amount) * 0.015;
    // const capping = Math.floor(amount) - mult;
    // if (capping > 2000) {
    //   extraAmount = 2000;
    // } else {
    //   extraAmount = mult;
    // }

    // Paystack fee calculation
    let extraAmount = Math.ceil(amount / 0.985) - amount;

    // Apply the ₦2000 capping rule
    if (extraAmount > 2000) {
      extraAmount = 2000;
    }

    // const totalAmount = amount + extraAmount; // The final amount user pays
    const secKey = 'sk_test_b96aa0e09f52eeaf5247f75f15d3251dbe86226c';
    // 'sk_live_887ff92042d578e8f2aa6aa21812645ec1360c60';

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount, // amount + extraAmount,
        channels: ['card', 'bank', 'ussd', 'bank_transfer'],
      },
      {
        headers: {
          Authorization: `Bearer ${secKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    // Create transaction here
    await new this.dummyTransactionRepository({
      amount: Math.floor(amount / 100),
      description: response.data?.message ?? '',
      user: usr?._id,
      status: 'pending',
      trans_ref: response.data?.data?.reference,
      type: TransactionType.TOPUP,
      created_at: new Date(),
      updated_at: new Date(),
    }).save();

    console.log('RESPONSE :: ', response.data);

    return response.data;
  }

  async createTransaction(payload: CreateOrderDTO, email_address: string) {
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

    // Check if this user has sufficient balance
    if (usr?.wallet?.balance < payload?.amount) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Insufficient balance! Topup required.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Now ddeduct from user balance and create transaction
    const reducedBal = usr?.wallet?.balance - parseInt(`${payload?.amount}`);
    const updatedWallet: Wallet = {
      balance: reducedBal,
      prev_balance: usr?.wallet?.balance,
      last_updated: new Date(),
    };

    await this.userRepository.findOneAndUpdate(
      { email_address: usr?.email_address },
      { $set: { wallet: updatedWallet } },
    );

    const newTransaction = await new this.transactionRepository({
      amount: payload.amount,
      description: payload.description,
      user: usr?._id,
      status: 'pending',
      trans_ref: `Qfx-${new Date().getTime()}`,
      type: TransactionType.CHARGE,
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
      category: 'order',
      title: `You created a new order on ${Date.now().toLocaleString()}`,
      user: usr?._id,
    }).save();

    const newOrder = await this.orderservice.createOrder(
      {
        amount: payload?.amount,
        description: payload?.description,
        items: payload?.items,
        pickup_date: payload?.pickup_date,
        service: payload?.service,
        address: payload?.address,
        delivery_fee: payload?.delivery_fee,
        landmark: payload?.landmark,
        delivery_type: payload?.delivery_type,
        location: payload?.location,
      },
      email_address,
      newTransaction?.id ?? newTransaction?._id,
    );

    return {
      message: 'Order created successfully',
      data: newOrder,
    };
  }

  async all(page: number, limit: number) {
    const skip = (page - 1) * limit; // Calculate the number of records to skip

    const [data, total] = await Promise.all([
      this.transactionRepository
        .find({ deletedAt: null })
        .populate('user')
        .sort({ createdAt: -1 })
        .skip(skip) // Skip the records
        .limit(limit) // Limit the number of records returned
        .exec(),
      this.transactionRepository.countDocuments(), // Count total documents for calculating total pages
    ]);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  findTransactionById(id: any): Promise<Transaction> {
    return this.transactionRepository.findById(id).lean().exec();
  }

  //   async updateTransaction(email_address: string, payload: any, id: string) {
  //     if (!payload) {
  //       throw new HttpException('Payload not provided!', HttpStatus.BAD_REQUEST);
  //     }

  //     const usr = await this.userRepository
  //       .findOne({
  //         email_address: email_address,
  //       })
  //       .lean()
  //       .exec();

  //     if (!usr)
  //       throw new HttpException('No user record found.', HttpStatus.NOT_FOUND);

  //     await this.transactionRepository.updateOne({ _id: id }, { ...payload });

  //     const updatedOrder = await this.transactionRepository
  //       .findOne({
  //         _id: id,
  //       })
  //       .lean()
  //       .exec();

  //     await new this.notificationsRepository({
  //       title: `You updated order ${updatedOrder?.order_id} on ${new Date().toLocaleString('en-GB')}`,
  //       category: 'order',
  //       user: usr?._id,
  //     }).save();

  //     return {
  //       message: 'Order updated successfully',
  //       data: updatedOrder,
  //     };
  //   }

  async allUserTransactions(
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

    const [data, total] = await Promise.all([
      this.transactionRepository
        .find({
          user: userObj?._id,
        })
        .populate('user')
        .sort({ createdAt: -1 })
        .skip(skip) // Skip the records
        .limit(limit) // Limit the number of records returned
        .exec(),
      this.transactionRepository.countDocuments({ user: userObj?._id }), // Count total documents for calculating total pages
    ]);

    console.log('USER TRANS ::', data);

    return {
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: limit,
    };
  }

  async calcRevenues() {
    return this.orderservice.calcRevenues();
  }

  async webhookAction(data: any) {
    if (data) {
      console.log('DATA WEBHOOK CHECK ::--::', data);

      // Now find the transaction with reference
      const affectedDummyTransaction = await this.dummyTransactionRepository
        .findOne({
          trans_ref: data?.reference,
        })
        .lean()
        .exec();

      if (affectedDummyTransaction) {
        // Look for user
        // const user = await this.userRepository
        // .findOne({
        //   id: affectedDummyTransaction?.user?.,
        // })
        // .lean()
        // .exec();

        // Now createb from this found transaction
        const newTransaction = await new this.transactionRepository({
          amount: affectedDummyTransaction?.amount,
          description: affectedDummyTransaction?.description,
          user: affectedDummyTransaction?.user,
          status: affectedDummyTransaction?.status,
          trans_ref: affectedDummyTransaction?.trans_ref,
          type: affectedDummyTransaction?.type,
          created_at: new Date(),
          updated_at: new Date(),
        }).save();

        await new this.notificationsRepository({
          category: 'order',
          title: `You created a new order on ${Date.now().toLocaleString()}`,
          user: affectedDummyTransaction?.user,
        }).save();

        // Now update user wallet
        const usr = await this.userRepository
          .findOne({
            _id: newTransaction?.user,
          })
          .lean()
          .exec();

        console.log('AMOUNT CHECK :::: ', data?.amount);
        console.log('FEES CHECK :::: ', data?.amount);

        const diff = parseInt(`${data?.amount}`);
        console.log('DIFF :: ', diff);

        const valueToWallet = diff / 100;
        const toIntValue = Math.floor(valueToWallet);

        console.log('WALET VALUE :: ', toIntValue);

        const updateWallet: Wallet = {
          balance: usr.wallet?.balance + toIntValue,
          prev_balance: usr.wallet?.balance,
          last_updated: new Date(),
        };

        await this.userRepository.updateOne(
          { email_address: usr?.email_address },
          { $set: { wallet: updateWallet } },
        );

        await new this.notificationsRepository({
          category: 'transaction',
          title: `You funded your wallet on ${Date.now().toLocaleString()}`,
          user: usr?._id,
        }).save();
      }
    }
  }
}
