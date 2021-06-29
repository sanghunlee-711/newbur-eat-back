import { Inject, Injectable } from '@nestjs/common';
import * as FormData from 'form-data';
import got from 'got';
import { CONFIG_OPTIONS } from '../common/common.constants';
import { EmailVars, MailModuleOptions } from './main.interface';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {}

  async sendEmail(
    subject: string,
    to: string,
    template: string,
    emailVars: EmailVars[],
  ): Promise<boolean> {
    const form = new FormData();
    form.append('from', `Hoon From Test PJT <mailgun@${this.options.domain}>`);
    form.append('to', `${to}`);
    form.append('subject', subject);
    // form.append('text', content);
    form.append('template', template);
    // form.append('v:code', 'testtest');
    // form.append('v:username', 'sanghun');
    emailVars.forEach((eVar) => form.append(`v:${eVar.key}`, eVar.value));

    try {
      await got.post(
        `https://api.mailgun.net/v3/${this.options.domain}/messages`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `api:${this.options.apiKey}`,
            ).toString('base64')}`,
          },

          body: form,
        },
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail('Verify Your Email', 'cloudlee711@gmail.com', 'test', [
      { key: 'code', value: code },
      { key: 'username', value: email },
    ]);
  }
}
