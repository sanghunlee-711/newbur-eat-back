import { Test } from '@nestjs/testing';
import * as FormData from 'form-data';
import got from 'got';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailService } from './mail.service';

const TEST_DOMAIN = 'test-domain';

const MOCK_MAILOPTION = {
  apiKey: 'test-apiKey',
  domain: TEST_DOMAIN,
  fromEmail: 'test-fromEmail',
};
jest.mock('got');
jest.mock('form-data');

describe('Mail Service', () => {
  let service: MailService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: { ...MOCK_MAILOPTION },
        },
      ],
    }).compile();
    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    it('should call sendEmail', () => {
      const sendVerificationEmailArgs = {
        email: 'email',
        code: 'code',
      };
      jest.spyOn(service, 'sendEmail').mockImplementation(async () => true);

      service.sendVerificationEmail(
        sendVerificationEmailArgs.email,
        sendVerificationEmailArgs.code,
      );
      //1. 아래는 함수를 모킹하는 것임-> 실제 함수 두개이상의 연동과정을 보고 싶을때는 mocking이 아닌 spying을 하면 됨
      //service.sendEmail = jest.fn();

      //2. 아래는 함수가 실제로 실행될 때 중간을 가로채서 원하는 설정을 할 수 있게 됨.

      expect(service.sendEmail).toHaveBeenCalledTimes(1);
      expect(service.sendEmail).toHaveBeenCalledWith(
        'Verify Your Email',
        'cloudlee711@gmail.com',
        'test',
        [
          { key: 'code', value: sendVerificationEmailArgs.code },
          { key: 'username', value: sendVerificationEmailArgs.email },
        ],
      );
    });
  });

  describe('sendEmail', () => {
    it('sends email', async () => {
      const ok = await service.sendEmail('', '', '', []);
      //form-data라이브러리 전체를 mocking 시킨 뒤 prototype을 활용하여 append 메서드를 스파이함
      const formSpy = jest.spyOn(FormData.prototype, 'append');
      expect(formSpy).toHaveBeenCalled();
      expect(got.post).toHaveBeenCalledTimes(1);
      expect(got.post).toHaveBeenCalledWith(
        `https://api.mailgun.net/v3/${TEST_DOMAIN}/messages`,
        expect.any(Object),
      );
      expect(ok).toBeTruthy();
    });

    it('fails on error', async () => {
      jest.spyOn(got, 'post').mockImplementation(() => {
        throw new Error();
      });

      const ok = await service.sendEmail('', '', '', []);
      expect(ok).toBeFalsy();
    });
  });
});
