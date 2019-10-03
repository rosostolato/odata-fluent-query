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
  
  @EnableQuery()
  mail: string;
  
  @EnableQuery()
  displayName: string;
  
  @EnableQuery()
  createDate: Date;

  
  @EnableQuery(Permission)
  permission: Permission;
  
  @EnableQuery(Permission)
  menu: UserMenu[];
}

const result = new OQuery<User>(User)
  .filter(x => x.id.biggerThan(5))
  .expand('menu', q => q.filter(x => x.id.biggerThan(5)))
  .toString();

console.log(result);
