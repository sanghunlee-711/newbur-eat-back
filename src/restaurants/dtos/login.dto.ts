import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/dtos/output.dto';
import { User } from 'src/users/entities/user.entity';

@ObjectType()
export class LoginOutput extends MutationOutput {
  @Field(() => String)
  token: string;
}

@InputType()
export class LoginInput extends PickType(User, ['email', 'password']) {}
