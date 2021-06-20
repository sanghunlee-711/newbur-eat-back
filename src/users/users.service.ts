import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { LoginInput } from 'src/restaurants/dtos/login.dto';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
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
}
