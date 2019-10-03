import { OQuery } from './src/oquery';


class UserMenu {
  id: number;
  module: string;
  value: boolean;
}

class Permission {
  id: number;
  module: string;
  value: boolean;
  menu: UserMenu[];
}

class User {
  id: number;
  mail: string;
  displayName: string;
  createDate: Date;

  permission: Permission;
  menu: UserMenu[];
}

const result = new OQuery<User>(User)
  .filter(x => x.id.biggerThan(5))
  .filter('id', id => id.biggerThan(5))
  .toString();

console.log(result);
