import { OQuery } from './src/oquery';


class UserMenu {
  id: number;
  title: string;
  value: boolean;
  reactions: UserMenu[];
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
  blogs: UserMenu[];
}

const result = new OQuery<User>()
.orderBy(x => x.permission.id)
.toString();

console.log(result);
