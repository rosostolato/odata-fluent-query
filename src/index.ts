import { OQuery } from '../lib/oquery';
import { Property, Type } from '../lib/decorators';


class Permission {
  @Property
  id: number;

  @Property
  module: string;

  @Property
  value: boolean;
}

class UserMenu {
  @Property
  id: number;
  
  @Property
  module: string;
  
  @Property
  value: boolean;
}

class User {
  @Property
  id: number;

  @Property
  mail: string;

  @Property
  displayName: string;

  @Property
  createDate: Date;


  @Property
  @Type(Permission)
  permission: Permission;

  @Property
  @Type(UserMenu)
  menu: UserMenu[];
}

const result2 = new OQuery<User>(User)
  .orderBy(x => x.permission().id)
  .toString();

console.log(result2);
