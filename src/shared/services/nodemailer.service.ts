import { ConfigService } from '@nestjs/config';
import * as NodeMailer from 'nodemailer';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ErrorCodes } from 'src/common/statusCodes';

@Injectable()
export class NodemailerService {
  private readonly transporter: any;
  private readonly smtpName: string;
  private readonly port: number;
  private readonly secure: boolean;
  private readonly smtpLogin: string;
  private readonly smtpPass: string;

  constructor(private readonly configService: ConfigService) {
    this.smtpName = this.configService.get('smtp.name');
    this.port = this.configService.get('smtp.port');
    this.secure = Boolean(this.configService.get('smtp.secure'));
    this.smtpLogin = this.configService.get('smtp.smtpLogin');
    this.smtpPass = this.configService.get('smtp.smtpPass');
    this.transporter = NodeMailer.createTransport({
      host: this.smtpName,
      port: this.port,
      secure: this.secure,
      auth: {
        user: this.smtpLogin,
        pass: this.smtpPass,
      },
    });
  }

  async sendMail(to: string[], subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        to: to.toLocaleString(),
        subject,
        html,
      });
    } catch (e) {
      console.log({ e });
      throw new BadRequestException(ErrorCodes.SendEmailError);
    }
  }
}
