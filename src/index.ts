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
  id: number;
  module: string;
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


  @Type(Permission)
  permission: Permission;

  @Type(UserMenu)
  menu: UserMenu[];
}

const result2 = new OQuery<User>(User)
  .filter(f => f.mail.contains('fugro.com'))
  .expand('permission', q => q.filter(x => x.module.contains('DDPR')))
  .toString();

console.log(result2);
