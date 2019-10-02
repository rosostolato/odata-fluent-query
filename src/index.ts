import { OQuery } from '../lib/oquery';
import { Property } from '../lib/decorators';


class User {
  @Property id: number;
  @Property mail: string;
  @Property displayName: string;
  @Property createDate: Date;
}

interface Permission {
  id: number;
  module: string;
  value: boolean;
}

const result2 = new OQuery<User>(User)
  .select('id', 'displayName')
  .filter(f => f.displayName.contains('rosostolato').and(f.id.biggerThan(5)).not())
  .filter(f => f.mail.contains('fugro.com'))
  .toString();

console.log(result2);
