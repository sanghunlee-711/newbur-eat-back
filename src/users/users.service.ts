import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { LoginInput } from 'src/users/dtos/login.dto';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { EditProfileInput } from './dtos/edit-profile.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<{ ok: boolean; error?: string }> {
    //check email exist or not for user validate

    try {
      const exists = await this.users.findOne({ email });

      if (exists) {
        //make Error -> already registered account case
        return { ok: false, error: '중복된 이메일로 이미 유저가 존재합니다.' };
      }
      await this.users.save(this.users.create({ email, password, role }));
      return { ok: true };
    } catch (error) {
      //make error and return error
      console.error(error);
      return { ok: false, error: '계정을 생성할 수 없습니다.' };
    }
    //create User & hash password
  }

  async login({
    email,
    password,
  }: LoginInput): Promise<{ ok: boolean; error?: string; token?: string }> {
    //1. find user with email
    try {
      const user = await this.users.findOne({ email });

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
        error,
      };
    }
  }

  async findByID(id: number): Promise<User> {
    return this.users.findOne({ id });
  }

  async editProfile(userId: number, editProfileInput: EditProfileInput) {
    //update의 경우 Entitiy를 업데이트하지만 Db에 존재하는지 확인을 하지 않음
    //이 프로젝트의 경우 cookie에서 token을 가져와서 userId를 받아오는 것이 전제로 되어있음
    // 그래서 userId를 신뢰할 수 있다는 전제하에 update()메서드를 사용하게 됨
    // 그렇지 않고 graphql Input으로 즉시 id를 받는 경우라면 신뢰할 수 없으므로 update메서드를 사용하지 않을 것임.
    //그리고 로그인 되어있지 않다면 누구도 eidtprofile을건드릴 수 없는 구조임
    // console.log('@@@@', userId, email, password);

    //destructuring으로 email, password를 따로 받을 시에 password가
    //기입되지 않으면 undefined로 나타나서 db에 넣을 수 없으므로 에러가발생함
    //그래서 edtiProfileInput을 그대로 받고 스프레드복사를 통해서 null값으로 넘겨주는 것
    console.log('@@@', editProfileInput);
    this.users.update(userId, { ...editProfileInput });
  }
}
