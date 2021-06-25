import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthUser } from 'src/auth/auth.user.decorator';
import { LoginInput, LoginOutput } from 'src/users/dtos/login.dto';
import {
  CreateAccountInput,
  CreateAccountOutPut,
} from './dtos/create-account.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verify-email.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => CreateAccountOutPut)
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutPut> {
    return this.usersService.createAccount(createAccountInput);
  }

  @Mutation(() => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    return this.usersService.login(loginInput);
  }

  //사용자가 누군지 판단하기 위해 토큰을 받고 인증을 해주는 쿼리
  //현재 로그인 되어있는 유저를 리턴해줌
  @Query(() => User)
  @UseGuards(AuthGuard)
  me(@AuthUser() authUser: User) {
    console.log('@@@@', authUser);
    return authUser;
  }

  //user profile을 보여주는 query
  @UseGuards(AuthGuard)
  @Query(() => UserProfileOutput)
  async userProfile(
    @Args() userProfileInput: UserProfileInput,
  ): Promise<UserProfileOutput> {
    return this.usersService.findByID(userProfileInput.userId);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => EditProfileOutput)
  async editProfile(
    @AuthUser() authUser: User,
    @Args('input') editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    return this.usersService.editProfile(authUser.id, editProfileInput);
  }

  @Mutation(() => VerifyEmailOutput) // VerifyEmailOutput for graphQL
  async verifyEmail(
    @Args('input') verifyEmailInput: VerifyEmailInput, // VerifyEmailInput for Nest js
  ): Promise<VerifyEmailOutput> {
    return this.usersService.verifyEmail(verifyEmailInput.code);
  }
}
