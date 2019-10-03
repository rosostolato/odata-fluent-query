import { OQuery } from './src/oquery';
import { EnableQuery, EnableExpand } from './src/decorators';


class Permission {
  @EnableQuery
  id: number;

  @EnableQuery
  module: string;

  @EnableQuery
  value: boolean;
}

class UserMenu {
  @EnableQuery
  id: number;
  
  @EnableQuery
  module: string;
  
  @EnableQuery
  value: boolean;
}

class User {
  @EnableQuery
  id: number;

  @EnableQuery
  mail: string;

  @EnableQuery
  displayName: string;

  @EnableQuery
  createDate: Date;


  @EnableQuery
  @EnableExpand(Permission)
  permission: Permission;

  @EnableQuery
  @EnableExpand(UserMenu)
  menu: UserMenu[];
}

const result2 = new OQuery<User>(User)
  .expand('menu', q => q.)
  .toString();

console.log(result2);
