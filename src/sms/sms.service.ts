import { Injectable } from '@nestjs/common';
import { SendChampService } from './providers/sendchamp.service';
import { TermiiService } from './providers/termii.service';
import { SMSProviderType } from 'src/enums/sms.providers.enum';

@Injectable()
export class SmsService {
  constructor(
    private sendChampService: SendChampService,
    private termiiService: TermiiService,
  ) {}

  async sendOTP(
    input: { phoneNumber: string; message: string },
    provider: SMSProviderType,
  ) {
    switch (provider) {
      case SMSProviderType.SENDCHAMP:
        return this.sendChampService.sendOTP(input);
      case SMSProviderType.TERMII:
        return this.termiiService.sendOTP(input);
      default:
        break;
    }
  }
}
