//dto: data transfer object

import { ArgsType, Field } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';

// @InputType()
//input 타입과 다르게 args타입은 분리하여 인자들을 선언하며 사용할 수 있음.
//input 타입은 그냥 하나의 객체로 보면 됨 (필드 전체를 가진)
@ArgsType()
export class CreateRestaurantDto {
  @Field((type) => String)
  @IsString()
  @Length(5, 10)
  name: string;

  @Field((type) => Boolean)
  isVegan: boolean;

  @Field((type) => String)
  @IsString()
  address: string;

  @Field(() => String)
  @IsString()
  ownerName: string;
}
