import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SMSProviderInterface } from './sms-provider.interface';
// import axios from 'axios';
import Sendchamp from 'sendchamp-sdk';
import {
  SendchampMode,
  // SenderUseCase,
  SMSRoute,
} from 'sendchamp-sdk/lib/constants/types';

@Injectable()
export class SendChampService implements SMSProviderInterface {
  constructor() {}

  // 08157746432

  async sendOTP(input: {
    phoneNumber: string;
    message: string;
  }): Promise<void> {
    try {
      const sendchamp = new Sendchamp({
        mode: SendchampMode.live,
        publicKey: '', // "",
      });

      // Initialize a service
      const sms = sendchamp.SMS;

      sms
        .send({
          to: input.phoneNumber,
          message: input.message,
          sender_name: 'QuickFix',
          route: SMSRoute.dnd,
        })
        .then((response) => {
          console.log('SENDCHAMP ', response);
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error: unknown) {
      throw new HttpException((error as Error).message, HttpStatus.FORBIDDEN);
    }
  }
}
