import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/users/entities/user.entity';

export type AllowedRoles = keyof typeof UserRole | 'Any';

//metaData는 resolver의 extra data라고 생각하면 된다.
//타입을 강하게 해주기 위해 decorator를 return 하는 decorator를 만듦
export const Role = (roles: AllowedRoles[]) => SetMetadata('roles', roles);
