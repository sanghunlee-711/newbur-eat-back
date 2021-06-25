import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
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

  @OneToOne(() => User, { onDelete: 'CASCADE' }) //user를 삭제하면 verfication도 삭제하게 되는 옵션 -> CASCADE
  @JoinColumn()
  user: User;

  @BeforeInsert()
  //user.service에서 createAccount와 editProfile두 곳
  //모두 verification을 생성할 수 있도록 하기 위해서 entity에서 코드 생성 로직을 짜게 됨.
  createCode(): void {
    //this.code = Math.random().toString(36).substring(2);
    this.code = uuidv4();
  }
}
