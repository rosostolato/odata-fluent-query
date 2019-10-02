import { OQuery } from '../lib/oquery';
import { Property } from '../lib/decorators';


class User {
  @Property id: number;
  @Property mail: string;
  @Property displayName: string;
  @Property createDate: Date;
  permission: Permission;
  menu: UserMenu;
}

interface Permission {
  id: number;
  module: string;
  value: boolean;
}

interface UserMenu {
  id: number;
  module: string;
  value: boolean;
}

const result2 = new OQuery<User>(User)
  .select('id')
  .expand('permission', q => q.select('id'))
  .toString();

console.log(result2);
