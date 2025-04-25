export abstract class SMSProviderInterface {
  abstract sendOTP(input: {
    phoneNumber: string;
    message: string;
  }): Promise<void>;
}
