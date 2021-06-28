import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { LoginInput, LoginOutput } from 'src/users/dtos/login.dto';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verification: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<{ ok: boolean; error?: string }> {
    //check email exist or not for user validate

    try {
      const exists = await this.users.findOne({ email });
      // console.log(exists);

      if (exists) {
        //make Error -> already registered account case
        return { ok: false, error: '중복된 이메일로 이미 유저가 존재합니다.' };
      }

      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      //make new User's verification code;
      //with using BeforeInserHook in verification Entity
      const verification = await this.verification.save(
        this.verification.create({
          user,
        }),
      );

      this.mailService.sendVerificationEmail(user.email, verification.code);
      return { ok: true };
    } catch (error) {
      //make error and return error
      return { ok: false, error: '계정을 생성할 수 없습니다.' };
    }
    //create User & hash password
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    //1. find user with email
    try {
      const user = await this.users.findOne(
        { email },
        { select: ['password', 'id'] }, //password는 무조건 불러온다 뭐 이런건데 Sequelize의 개념과 유사함
      );

      if (!user) {
        return {
          ok: false,
          error: 'User not found',
        };
      }
      //2. check if the pw is correct
      const passwordCorrect = await user.checkPassword(password);

      if (!passwordCorrect) {
        return {
          ok: false,
          error: 'Wrong Password',
        };
      }

      const token = this.jwtService.sign(user.id);

      //3. make jwt and give it to user
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Cant log user in',
      };
    }
  }

  async findByID(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOneOrFail({ id });

      return {
        ok: true,
        user,
      };
    } catch (error) {
      return { ok: false, error: 'User Not Found' };
    }
  }

  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    //1.
    //update의 경우 Entitiy를 업데이트하지만 Db에 존재하는지 확인을 하지 않음
    //이 프로젝트의 경우 cookie에서 token을 가져와서 userId를 받아오는 것이 전제로 되어있음
    // 그래서 userId를 신뢰할 수 있다는 전제하에 update()메서드를 사용하게 됨
    // 그렇지 않고 graphql Input으로 즉시 id를 받는 경우라면 신뢰할 수 없으므로 update메서드를 사용하지 않을 것임.
    //그리고 로그인 되어있지 않다면 누구도 eidtprofile을건드릴 수 없는 구조임
    // console.log('@@@@', userId, email, password);

    //2.
    //destructuring으로 email, password를 따로 받을 시에 password가
    //기입되지 않으면 undefined로 나타나서 db에 넣을 수 없으므로 에러가발생함
    //그래서 edtiProfileInput을 그대로 받고 스프레드복사를 통해서 null값으로 넘겨주는 것

    //3.
    //update는 entity를 체크하지 않으므로 @BeforeUPdate를 호출하지 못하게 됨
    //save는 entities를 체크하고 없으면 db에 create and Insert하고 있으면update를 체크하게 된다.

    try {
      const user = await this.users.findOne(userId);

      if (email) {
        user.email = email;
        user.verified = false;
        //verification code make or update
        //with using BeforeInserHook in verification Entity

        const verification = await this.verification.save(
          this.verification.create({
            user,
          }),
        );
        this.mailService.sendVerificationEmail(user.email, verification.code);
      }

      if (password) {
        user.password = password;
      }
      this.users.save(user);

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not update profile',
      };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verification.findOne(
        { code },
        { relations: ['user'] }, //이렇게하면 sequelize의 includes 메서드처럼 관련된 유저의 정보를 가져올수도 있음
      );

      if (verification) {
        // console.log(verification); //TypeORM에서 relations나 loadRelations... :true로 셋팅하면 관련된 것을 받을 수 있음.
        verification.user.verified = true;
        this.users.save(verification.user);
        //user당 하나의 verfication만 가질 수 있기때문에 기존에 verification에 있던것을 지워줌
        await this.verification.delete(verification.id);
        return { ok: true };
      }

      return { ok: false, error: 'Verification not found' };
    } catch (error) {
      return { ok: false, error: 'Could not verify email' };
    }
  }
}
