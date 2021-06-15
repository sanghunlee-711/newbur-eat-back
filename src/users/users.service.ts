import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
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
}
