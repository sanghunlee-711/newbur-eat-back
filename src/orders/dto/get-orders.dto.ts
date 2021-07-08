import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Order, OrderStatus } from '../entities/order.entity';

@InputType()
export class GetOrdersInputType {
  @Field(() => OrderStatus, { nullable: true })
  status: OrderStatus;
}

@ObjectType()
export class GetOrdersOutputType extends CoreOutput {
  @Field(() => [Order], { nullable: true })
  orders?: Order[];
}
