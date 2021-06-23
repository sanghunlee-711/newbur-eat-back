import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Verification extends CoreEntity {
  //1:1(one to one)관계를 가지게 됨 유저 한명당 하나의 verification이므로 !
  @Column()
  @Field(() => String)
  code: string;

  //JoinColumn
  //만약 유저로'부터' verification'에' 접근하고 싶다면
  //@JoinColumn은 '유저' class쪽에 있어야한다.

  //반대로 verification으로 '부터' User'에' 접근하고 싶으면
  //@JoinColumn은 Verification class에 있어야한다

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
