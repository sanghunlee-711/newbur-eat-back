import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { getConnection } from 'typeorm';
import { AppModule } from '../src/app.module';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});
const GRAPHQL_ENDPOINT = '/graphql';

describe('UserModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    app.close();
  });

  describe('createAccount', () => {
    const EMAIL = 'test@test.com';

    it('should create account', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation{
            createAccount(input:{
              email: "${EMAIL}",
              password: "1234",
              role:Owner
            }){
              ok
              error
            }
          }`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBeTruthy();
          expect(res.body.data.createAccount.error).toBe(null);
        });
    });

    it('should fail if create exist', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation{
            createAccount(input:{
              email: "${EMAIL}",
              password: "1234",
              role:Owner
            }){
              ok
              error
            }
          }`,
        })
        .expect(200)
        .expect((res) => {
          console.log(res.body.data);
          expect(res.body.data.createAccount.ok).toBe(false);
          expect(res.body.data.createAccount.error).toEqual(expect.any(String));
          //toBe는 완전 똑같아야 하고 toEqual의 경우 위와같이 타입으로 유사정도 확인 가능함 ㅇㅇ
        });
    });
  });
  it.todo('userProfile');
  it.todo('login');
  it.todo('me');
  it.todo('verifyEmail');
  it.todo('editProfile');
});
