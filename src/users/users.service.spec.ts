import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';

describe('User Service', () => {
  //유저 서비스를 테스트하게 됨.

  let service: UsersService;
  beforeAll(async () => {
    //1.테스트 하고 싶은 모듈을 만든다.
    const module = await Test.createTestingModule({
      //모듈로 Imports하고 싶은것들이 포함된다.
      providers: [UsersService],
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
