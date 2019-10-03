import { OQuery } from './src/oquery';
import { EnableQuery } from './src/decorators';


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
  @EnableQuery()
  id: number;
  mail: string;
  displayName: string;
  createDate: Date;

  
  @EnableQuery(Permission)
  permission: Permission;
  
  @EnableQuery(Permission)
  menu: UserMenu[];
}

const result = new OQuery<User>(User)
  .expand('menu', q => q.filter('id', c => c.biggerThan(5)))
  .toString();

console.log(result);
