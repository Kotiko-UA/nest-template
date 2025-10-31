import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { BadRequestAppException } from 'src/common/exceptions';
import { ErrorCodes } from 'src/common/statusCodes';
import * as NodeMailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('resend.resendApiKey');
    this.fromEmail = 'Kotiko <no-reply@kotiko.work>';
    this.resend = new Resend(apiKey);
  }

  async sendMail(to: string[], subject: string, html: string): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
      });
    } catch (e) {
      console.log({ e });
      throw new BadRequestAppException(ErrorCodes.SendEmailError);
    }
  }
}

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
      throw new BadRequestAppException(ErrorCodes.SendEmailError);
    }
  }
}
