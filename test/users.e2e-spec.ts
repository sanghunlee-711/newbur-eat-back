import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Verification } from 'src/users/entities/verification.entity';
import * as request from 'supertest';
import { getConnection, Repository } from 'typeorm';
import { AppModule } from '../src/app.module';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});
const GRAPHQL_ENDPOINT = '/graphql';
const testUser = {
  EMAIL: 'test@test.com',
  PASSWORD: '1234',
};

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let verificationRepository: Repository<Verification>;
  let jwtToken: string;

  const baseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
  const publicTest = (query: string) => baseTest().send({ query });
  const privateTest = (query: string) =>
    baseTest().set('X-JWT', jwtToken).send({ query });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    verificationRepository = module.get<Repository<Verification>>(
      getRepositoryToken(Verification),
    );
    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    app.close();
  });

  describe('createAccount', () => {
    it('should create account', () => {
      return publicTest(
        `mutation{
            createAccount(input:{
              email: "${testUser.EMAIL}",
              password: "${testUser.PASSWORD}",
              role:Owner
            }){
              ok
              error
            }
          }`,
      )
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBeTruthy();
          expect(res.body.data.createAccount.error).toBe(null);
        });
    });

    it('should fail if create exist', () => {
      return publicTest(`
          mutation{
            createAccount(input:{
              email: "${testUser.EMAIL}",
              password: "${testUser.PASSWORD}",
              role:Owner
            }){
              ok
              error
            }
          }
          `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { createAccount },
            },
          } = res;
          expect(createAccount.ok).toBe(false);
          expect(createAccount.error).toEqual(expect.any(String));
          //toBe??? ?????? ???????????? ?????? toEqual??? ?????? ???????????? ???????????? ???????????? ?????? ????????? ??????
        });
    });
  });

  describe('login', () => {
    it('should log in with correct credentials(token)', () => {
      return publicTest(`
          mutation{
            login(input:{
              email: "${testUser.EMAIL}",
              password:"${testUser.PASSWORD}",
            }){
              ok
              error
              token
            }
          }
          `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;

          expect(login.ok).toBeTruthy();
          expect(login.error).toBe(null);
          expect(login.token).toEqual(expect.any(String));
          jwtToken = login.token;
        });
    });

    it('should not be able to login with wrong credential(code)', () => {
      return publicTest(
        `
        mutation{
          login(input:{
            email: "${testUser.EMAIL}",
            password:"${testUser.PASSWORD}-testError",
          }){
            ok
            error
            token
          }
        }
        `,
      )
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;

          expect(login.ok).toBeFalsy();
          expect(login.error).toBe('Wrong Password');
          expect(login.token).toEqual(null);
        });
    });
  });

  describe('userProfile', () => {
    let userId: number;
    beforeAll(async () => {
      const [user] = await userRepository.find();
      //????????? ??? describe?????? beforeAll ???????????? module.get??? ?????? ????????? userRepository??? ??????
      //?????? DB??? ???????????? user??? ????????? ??? ??? ??????.
      //??? ???????????? ???????????? DB??? ???????????? DROP??????????????????
      //id??? 1?????? ?????? ????????? ???????????? ????????? ???????????? id??? 1??? ?????? ???????????? ??? ??? ?????????.
      userId = user.id;
    });

    it('should see a user profile', () => {
      return privateTest(
        `
          {
            userProfile(userId:${userId}){
              ok
              error
                user {
                  id
                }
            }
          }
        `,
      )
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                userProfile: {
                  ok,
                  error,
                  user: { id },
                },
              },
            },
          } = res;
          expect(ok).toBeTruthy();
          expect(error).toBe(null);
          expect(id).toBe(userId);
        });
    });

    //findByID
    it('should not find a profile', () => {
      return privateTest(
        `
          {
            userProfile(userId:${userId}222){
              ok
              error
                user {
                  id
                }
            }
          }
        `,
      )
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                userProfile: { ok, error, user },
              },
            },
          } = res;
          expect(ok).toBeFalsy();
          expect(error).toBe('User Not Found');
          expect(user).toBe(null);
        });
    });
  });

  describe('me', () => {
    it('should find my profile', () => {
      return privateTest(
        `
          {
            me {
              email
            }
          }
          `,
      )
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                me: { email },
              },
            },
          } = res;
          expect(email).toBe(testUser.EMAIL);
        });
    });

    it('should not allow logged out user', () => {
      return publicTest(
        `
        {
          me {
            email
          }
        }
        `,
      )
        .expect(200)
        .expect((res) => {
          const {
            body: { errors },
          } = res;
          const [error] = errors;
          expect(error.message).toBe('Forbidden resource');
        });
    });
  });

  describe('editProfile', () => {
    const NEW_EMAIL = 'test@change.com';

    it('should change Profile', () => {
      return privateTest(
        `
          mutation{
            editProfile(input:{
              email: "${NEW_EMAIL}"
            }) {
              ok
              error
            }
          }
        `,
      )
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                editProfile: { ok, error },
              },
            },
          } = res;

          expect(ok).toBeTruthy();
          expect(error).toBe(null);
        });
    });

    it('should have new email', () => {
      return privateTest(
        `
        {
          me{
            email
          }
        }
        `,
      )
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                me: { email },
              },
            },
          } = res;
          expect(email).toBe(NEW_EMAIL);
        });
    });
  });

  describe('verifyEmail', () => {
    let verificationCode: string;

    beforeAll(async () => {
      const [verification] = await verificationRepository.find(); // userProfiler??? ????????? ??????
      console.log(verification);
      verificationCode = verification.code;
    });

    it('should verify email', () => {
      return publicTest(
        `
          mutation {
            verifyEmail(input:{
              code:"${verificationCode}"
            }){
              ok
              error
            }
          }
        `,
      )
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                verifyEmail: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });

    it('should fail on verification code not found', () => {
      return publicTest(
        `
        mutation {
          verifyEmail(input:{
            code:"codeForFailTest"
          }){
            ok
            error
          }
        }
      `,
      ).expect((res) => {
        const {
          body: {
            data: {
              verifyEmail: { ok, error },
            },
          },
        } = res;
        expect(ok).toBe(false);
        expect(error).toBe('Verification not found');
      });
    });
  });
});
