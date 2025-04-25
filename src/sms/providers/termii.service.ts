import { HttpException, Injectable, Logger } from '@nestjs/common';
import { SMSProviderInterface } from './sms-provider.interface';
import axios from 'axios';

@Injectable()
export class TermiiService implements SMSProviderInterface {
  async sendOTP(input: {
    phoneNumber: string;
    message: string;
  }): Promise<void> {
    const response = await axios.post(
      `https://v3.api.termii.com/api/sms/send`,
      {
        api_key:
          'TLmOvQaVGeSrboUNtIiKGgaJiPREQWgCygnOEawqkurdmksYKlJUDnWrGsjyio',
        from: 'QuickFix',
        to: input.phoneNumber,
        sms: input.message,
        type: 'plain',
        channel: 'generic',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    Logger.log(JSON.stringify(response.data), 'TermiiService');
    if (response.status !== 200) {
      throw new HttpException('Termii failed to send sms,', response?.status);
    }
  }
}
