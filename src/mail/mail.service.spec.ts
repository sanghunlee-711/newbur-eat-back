import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailService } from './mail.service';

const MOCK_MAILOPTION = {
  apiKey: 'test-apiKey',
  domain: 'test-domain',
  fromEmail: 'test-fromEmail',
};

jest.mock('form-data', () => {
  append: jest.fn(() => {
    return {
      append: jest.fn(),
    };
  });
});

describe('Mail Service', () => {
  let service: MailService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: { MOCK_MAILOPTION },
        },
      ],
    }).compile();
    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it.todo('sendEmail');
  it.todo('sendVerificationEmail');
});
