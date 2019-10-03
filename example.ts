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
  .filter(x => x.createDate.isSame(new Date(), 'minute'))
  .toString();

console.log(result);
