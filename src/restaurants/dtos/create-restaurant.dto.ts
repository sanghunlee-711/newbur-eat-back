//dto: data transfer object

import { InputType, OmitType } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';

// @InputType()
//input 타입과 다르게 args타입은 분리하여 인자들을 선언하며 사용할 수 있음.
//input 타입은 그냥 하나의 객체로 보면 됨 (필드 전체를 가진)
@InputType()
export class CreateRestaurantDto extends OmitType(
  Restaurant,
  ['id'],
  //이쪽인자에 값을 넣으면 Type을 변경할 수 있음 :)
  InputType,
) {}
