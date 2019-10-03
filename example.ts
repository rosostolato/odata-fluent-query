import { OQuery } from './src/oquery';
import { EnableQuery, EnableExpand } from './src/decorators';


class UserMenu {
  @EnableQuery
  id: number;
  
  @EnableQuery
  module: string;
  
  @EnableQuery
  value: boolean;
}

class Permission {
  @EnableQuery
  id: number;

  @EnableQuery
  module: string;

  @EnableQuery
  value: boolean;

  @EnableQuery
  @EnableExpand(UserMenu)
  menu: UserMenu[];
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
}

const result = new OQuery<User>(User)
  .expand('permission', q => q
    .expand('menu', q2 => q2
      .filter(x => x.id.biggerThan(5))))
  .toString();

console.log(result);
