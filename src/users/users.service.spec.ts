import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UsersService } from './users.service';

//users repository를 가짜로 만듦
const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
});

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

const mockMailService = {
  sendVerificationEmail: jest.fn(),
};

type MockRepository<T = any> = Partial<
  Record<keyof Repository<User>, jest.Mock>
>;

describe('User Service', () => {
  //유저 서비스를 테스트하게 됨.

  let service: UsersService;
  let usersRepository: MockRepository<User>;
  let verificationRepository: MockRepository<Verification>;
  let mailService: MailService;

  beforeAll(async () => {
    //1.테스트 하고 싶은 모듈을 만든다.
    const module = await Test.createTestingModule({
      //모듈로 Imports하고 싶은것들이 포함된다.
      providers: [
        //constructor에서 받아오는 것들을 mocking하는 과정
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
          //TypeORM에서 repository를 불러오는게 아닌 MockRepository를 만들어서 제공할 것임.
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
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
    mailService = module.get<MailService>(MailService);
    usersRepository = module.get(getRepositoryToken(User));
    verificationRepository = module.get(getRepositoryToken(Verification));
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    const createAccountArgs = {
      email: '',
      password: '',
      role: 0,
    };

    it('Should fail if user exists', async () => {
      //유저서비스의 createAccount 메서드 중 아래의 코드를 테스트 해봄
      // 전체 반응을 테스트하는 것은 E2E테스트에 가깝고 unitTest의 경우 각 줄의 코드가
      //원하는데로 정상작동하는지를 보는 것이기 때문
      // const exists = await this.users.findOne({ email });
      // if (exists) {
      //   //make Error -> already registered account case
      //   return { ok: false, error: '중복된 이메일로 이미 유저가 존재합니다.' };
      // }

      usersRepository.findOne.mockResolvedValue({
        // const exists = await this.users.findOne({ email });
        //위의 코드부분을 목킹하여 가짜 return 값을 설정해주는 과정
        //jest와 Mock을 사용하여 실제 user.service.ts에 있는 dependencies에 포함된 함수의 반환값을 속일 수 있다.
        id: 1,
        email: '',
      });

      const result = await service.createAccount(createAccountArgs);

      expect(result).toMatchObject({
        ok: false,
        error: '중복된 이메일로 이미 유저가 존재합니다.',
      });
    });

    it('Shold Create New User', async () => {
      //Set Repositories Return value
      usersRepository.findOne.mockResolvedValue(undefined);
      usersRepository.create.mockReturnValue(createAccountArgs);
      usersRepository.save.mockResolvedValue(createAccountArgs);

      verificationRepository.create.mockReturnValue({
        user: createAccountArgs,
      });
      verificationRepository.save.mockResolvedValue({
        code: 'code',
      });
      //End Setting

      const result = await service.createAccount(createAccountArgs);
      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);

      expect(verificationRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationRepository.create).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      expect(verificationRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationRepository.save).toHaveBeenCalledWith({
        user: createAccountArgs,
      });
      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        //어떤 타입으로 호출 되는지를 확인하는 방법 여기서는 user.email, verification.code가 string임
        expect.any(String),
        expect.any(String),
      );

      expect(result).toEqual({ ok: true });
    });

    it('Should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error('Hello Error'));
      const result = await service.createAccount(createAccountArgs);
      console.log(result);
      expect(result).toEqual({
        ok: false,
        error: '계정을 생성할 수 없습니다.',
      });
    });
  });

  it.todo('login');
  it.todo('findByID');
  it.todo('editProfile');
  it.todo('verifyEmail');
});
