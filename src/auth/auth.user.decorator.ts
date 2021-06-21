import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const AuthUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    //auth.guard.ts의 canActivate와 유사한 방식
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user = gqlContext['user'];
    return user;
  },
);
