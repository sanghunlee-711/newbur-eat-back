import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UsersService } from './users.service';

//users repository를 가짜로 만듦
const mockRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

const mockMailService = {
  sendVerificationEmail: jest.fn(),
};

describe('User Service', () => {
  //유저 서비스를 테스트하게 됨.

  let service: UsersService;
  beforeAll(async () => {
    //1.테스트 하고 싶은 모듈을 만든다.
    const module = await Test.createTestingModule({
      //모듈로 Imports하고 싶은것들이 포함된다.
      providers: [
        //constructor에서 받아오는 것들을 mocking하는 과정
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
          //TypeORM에서 repository를 불러오는게 아닌 MockRepository를 만들어서 제공할 것임.
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    //2.만든 모듈에서 service만을 가져오는 방법
    service = module.get<UsersService>(UsersService);
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  it.todo('createAccount');
  it.todo('login');
  it.todo('findByID');
  it.todo('editProfile');
  it.todo('verifyEmail');
});
