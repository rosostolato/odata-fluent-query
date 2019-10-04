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

const result = new OQuery<User>()
.filter(u => u.mail.equals('test').and(u.displayName.contains('dave')))
.toString();

console.log(result);
