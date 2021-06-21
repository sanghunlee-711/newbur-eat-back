import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { LoginInput, LoginOutput } from 'src/restaurants/dtos/login.dto';
import {
  CreateAccountInput,
  CreateAccountOutPut,
} from './dtos/create-account.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => Boolean)
  hi() {
    return true;
  }

  @Mutation(() => CreateAccountOutPut)
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutPut> {
    try {
      const { ok, error } = await this.usersService.createAccount(
        createAccountInput,
      );

      return {
        ok,
        error,
      };
    } catch (error) {
      return {
        error,
        ok: false,
      };
    }
  }

  @Mutation(() => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    try {
      const { ok, error, token } = await this.usersService.login(loginInput); //미친

      return {
        ok,
        error,
        token,
      };

      //return this.usersService.login(loginInput); 로 바꿔줘도 같은결과이나 내가 나중에 못알아볼것 같다
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  //사용자가 누군지 판단하기 위해 토큰을 받고 인증을 해주는 쿼리
  //현재 로그인 되어있는 유저를 리턴해줌
  @Query(() => User)
  me(@Context() context) {
    if (!context.user) {
      return;
    } else {
      return context.user;
    }
  }
}
