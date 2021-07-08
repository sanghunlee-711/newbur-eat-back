import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Order } from '../entities/order.entity';

@InputType()
export class EditOrderInput extends PickType(Order, ['id']) {}

@ObjectType()
export class EditOrderOutput extends CoreOutput {
  @Field(() => Order, { nullable: true })
  order?: Order;
}
