import { Inject, Injectable } from '@nestjs/common';
import * as FormData from 'form-data';
import got from 'got';
import { CONFIG_OPTIONS } from '../common/common.constants';
import { MailModuleOptions } from './main.interface';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    this.sendEmail('testing', 'test');
  }

  private async sendEmail(subject: string, template: string) {
    const form = new FormData();
    form.append('from', `Excited User <mailgun@${this.options.domain}>`);
    form.append('to', `cloudlee711@gmail.com`);
    form.append('subject', subject);
    // form.append('text', content);
    form.append('template', template);
    form.append('v:code', 'testtest');
    form.append('v:username', 'sanghun');

    const response = await got(
      `https://api.mailgun.net/v3/${this.options.domain}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(
            `api:${this.options.apiKey}`,
          ).toString('base64')}`,
        },

        body: form,
      },
    );

    console.log('@@@@@', response.body);
  }
}
