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
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(() => 'signed-token-return'),
  verify: jest.fn(),
});

const mockMailService = () => ({
  sendVerificationEmail: jest.fn(),
});

type MockRepository<T = any> = Partial<
  Record<keyof Repository<User>, jest.Mock>
>;

describe('User Service', () => {
  //유저 서비스를 테스트하게 됨.

  let service: UsersService;
  let usersRepository: MockRepository<User>;
  let verificationRepository: MockRepository<Verification>;
  let mailService: MailService;
  let jwtService: JwtService;

  beforeEach(async () => {
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
          useValue: mockJwtService(),
        },
        {
          provide: MailService,
          useValue: mockMailService(),
        },
      ],
    }).compile();

    //2.만든 모듈에서 service만을 가져오는 방법
    service = module.get<UsersService>(UsersService);
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
    usersRepository = module.get(getRepositoryToken(User));
    verificationRepository = module.get(getRepositoryToken(Verification));
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    const createAccountArgs = {
      email: 'test@test.com',
      password: 'testtest22',
      role: 'Client',
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

      const result = await service.createAccount({ ...createAccountArgs });

      expect(result).toMatchObject({
        ok: false,
        error: '중복된 이메일로 이미 유저가 존재합니다.',
      });
    });

    it('Shold create New User', async () => {
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
      expect(result).toEqual({
        ok: false,
        error: '계정을 생성할 수 없습니다.',
      });
    });
  });

  describe('login', () => {
    const loginArgs = {
      email: 'test@test.com',
      password: 'test@test.com',
    };
    it("Should fail if user doesn't exist", async () => {
      usersRepository.findOne.mockResolvedValue(null);

      const result = await service.login(loginArgs);
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );
      expect(result).toEqual({
        ok: false,
        error: 'User not found',
      });
    });

    it('Should fail if the password is wrong', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(false)), //이렇게하면 await user.checkPassword() 는 false 반환하게 됨 ㅎㅅㅎ
      };

      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(result).toEqual({
        ok: false,
        error: 'Wrong Password',
      });
    });

    it('Should return token, if password correct', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };

      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));
      expect(result).toEqual({
        ok: true,
        token: 'signed-token-return',
      });
    });

    it('Should fail on exception login', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.login(loginArgs);
      expect(result).toEqual({
        ok: false,
        error: 'Cant log user in',
      });
    });
  });

  describe('findByID', () => {
    const findByIdArgs = { id: 1 };
    it('Should find an existing user', async () => {
      usersRepository.findOneOrFail.mockResolvedValue(findByIdArgs);

      const result = await service.findByID(1);
      expect(result).toEqual({ ok: true, user: findByIdArgs });
    });

    it('Should fail if user is not found', async () => {
      usersRepository.findOneOrFail.mockRejectedValue(new Error());
      const result = await service.findByID(1);
      expect(result).toEqual({ ok: false, error: 'User Not Found' });
    });
  });

  describe('editProfile', () => {
    it('should change email', async () => {
      const oldUser = {
        email: 'bs@old',
        verified: true,
      };

      const editProfileArgs = {
        userId: 1,
        input: { email: 'bs@new' },
      };

      const newVerification = {
        code: 'code',
      };

      const newUser = {
        email: editProfileArgs.input.email,
        verified: false,
      };

      usersRepository.findOne.mockResolvedValue(oldUser);
      verificationRepository.create.mockReturnValue(newVerification);
      verificationRepository.save.mockResolvedValue(newVerification);

      await service.editProfile(editProfileArgs.userId, editProfileArgs.input);

      expect(usersRepository.findOne).toHaveReturnedTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        editProfileArgs.userId,
      );

      expect(verificationRepository.create).toHaveBeenCalledWith({
        user: newUser,
      });
      expect(verificationRepository.save).toHaveBeenCalledWith(newVerification);

      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        newUser.email,
        newVerification.code,
      );
    });

    it('should change password', async () => {
      const editProfileArgs = {
        userId: 1,
        input: { password: 'newPw' },
      };

      usersRepository.findOne.mockResolvedValue({ password: 'oldPw' });

      const result = await service.editProfile(
        editProfileArgs.userId,
        editProfileArgs.input,
      );
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(editProfileArgs.input);
      expect(result).toEqual({
        ok: true,
      });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.editProfile(1, { email: '1' });
      expect(result).toEqual({
        ok: false,
        error: 'Could not update profile',
      });
    });

    it('should unique user', async () => {
      const oldUser = {
        email: 'bs@old',
        verified: true,
      };

      const editProfileArgs = {
        userId: 1,
        input: { email: 'bs@new' },
      };

      usersRepository.findOne.mockRejectedValue(
        oldUser.email === editProfileArgs.input.email ? new Error() : oldUser,
      );

      const result = await service.editProfile(1, { email: '1' });
      expect(result).toEqual({
        ok: false,
        error: 'Could not update profile',
      });
    });
  });

  describe('verifyEmail', () => {
    it('should verify email', async () => {
      const mockVerification = {
        user: {
          verified: false,
        },
        id: 1,
      };

      verificationRepository.findOne.mockResolvedValue(mockVerification);

      const result = await service.verifyEmail('code');
      expect(verificationRepository.findOne).toHaveBeenCalledTimes(1);
      expect(verificationRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith({ verified: true });

      expect(verificationRepository.delete).toHaveBeenCalledTimes(1);
      expect(verificationRepository.delete).toHaveBeenCalledWith(
        mockVerification.id,
      );

      expect(result).toEqual({ ok: true });
    });
    it('should fail on verification not found', async () => {
      verificationRepository.findOne.mockResolvedValueOnce(undefined);
      const result = await service.verifyEmail('code');
      expect(result).toEqual({ ok: false, error: 'Verification not found' });
    });
    it('should fail on exception', async () => {
      verificationRepository.findOne.mockRejectedValue(new Error());
      const result = await service.verifyEmail('code');
      expect(result).toEqual({ ok: false, error: 'Could not verify email' });
    });
  });
});
