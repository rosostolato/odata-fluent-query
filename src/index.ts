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


  @Type(Permission)
  permission: Permission;

  @Type(UserMenu)
  menu: UserMenu[];
}

const result2 = new OQuery<User>(User)
  .expand('menu', q => q.filter(x => x.id.biggerThan(5)).select('id'))
  .toString();

console.log(result2);
