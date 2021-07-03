import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { AllowedRoles } from './role.decorator';

//authentication => who are you
//authorization => can you access this ?

@Injectable()
//CanActivate는 true또는 false밖에 리턴 못함 :)
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    //셋팅된 메타데이터를 가져오기 위해 Reflector를 사용
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );
    console.log('In AUTH GUARD', roles);

    if (!roles) {
      return true;
    }

    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user: User = gqlContext.user;
    if (!user) {
      return false;
    }

    if (roles.includes('Any')) {
      return true;
    }

    return roles.includes(user.role);
  }
}
