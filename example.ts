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

  @EnableQuery
  @EnableExpand(UserMenu)
  menu: UserMenu[];
}

const result = new OQuery(User)
  .filter(x => x.id.biggerThan(4))
  .expand('permission', q => q.select('id'))
  .expand('menu', q => q.paginate(5, 10).filter(x => x.module.startsWith('test')))
  .orderBy(x => x.id)
  .toString();

console.log(result);
