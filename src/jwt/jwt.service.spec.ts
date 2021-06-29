import { Test } from '@nestjs/testing';
import * as jwt from 'jsonwebtoken';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtService } from 'src/jwt/jwt.service';

const TOKEN = 'TOKEN';
const TEST_KEY = 'testKey';
const USER_ID = 1;

//이렇게 라이브러리 명을 지정해주면 라이브러리의 함수를 모킹시킬 수 있게된다.
jest.mock('jsonwebtoken', () => {
  return {
    sign: jest.fn(() => TOKEN),
    verify: jest.fn(() => ({
      id: USER_ID,
    })),
  };
});

describe('Test jwt Service', () => {
  let service: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: CONFIG_OPTIONS,
          //jwtModuleOptions 참고
          useValue: { privateKey: TEST_KEY },
        },
      ],
    }).compile();

    service = module.get<JwtService>(JwtService);
  });

  it('be defined', async () => {
    expect(service).toBeDefined();
  });
  describe('sign', () => {
    it('Should return a signed token', () => {
      const token = service.sign(1);
      expect(typeof token).toBe('string');
      expect(jwt.sign).toHaveBeenCalledTimes(USER_ID);
      expect(jwt.sign).toHaveBeenCalledWith({ id: USER_ID }, TEST_KEY);
      expect(jwt.sign({ id: USER_ID }, TEST_KEY)).toEqual(TOKEN);
    });
  });

  describe('verify', () => {
    it('Should return the decoed token', () => {
      const _USER = { id: USER_ID };
      const decodedToken = service.verify(TOKEN);
      expect(decodedToken).toEqual(_USER);
      expect(jwt.verify).toHaveBeenCalledTimes(1);
      expect(jwt.verify).toHaveBeenCalledWith(TOKEN, TEST_KEY);
    });
  });
});
