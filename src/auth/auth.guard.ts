import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate {
  //CanActivate는 true를 리턴하면 request를 진행시키고 false면 request를 멈추게한다.
  //여기서의 context는 graphql의 context가 아닌
  //request pipeline의 context인데 이미 graphql의 context를 통해
  //request에 user를 할당한 상태라 뭐 ..

  canActivate(context: ExecutionContext) {
    //http context -> gql context방식으로 변경
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user = gqlContext.user;
    if (!user) {
      return false;
    }
    return true;
  }
}
