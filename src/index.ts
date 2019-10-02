import { OQuery } from '../lib/oquery';
import { Property } from '../lib/decorators';
// import { FilterBuilderComplex, FilterBuilderNumber, FilterBuilderString, FilterBuilderDate, FilterBuilderBoolean } from '../lib/filterbuilder.old';
// import { mk_query } from '../lib/query';

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

// const pfb: FilterBuilderComplex<Permission> = {
//     id: new FilterBuilderNumber('id'),
//     module: new FilterBuilderString('module'),
//     value: new FilterBuilderBoolean('value')
// }

// const fb: FilterBuilderComplex<User> = {
//     id: new FilterBuilderNumber('id'),
//     mail: new FilterBuilderString('mail'),
//     displayName: new FilterBuilderString('displayName'),
//     createDate: new FilterBuilderDate('createDate')
// }

// const query = mk_query<User>(
//     fb, {}, '', {} as any, {} as any
// );

// const result = query
//     .Select('id', 'displayName')
//     .Filter(x => x.mail.Contains('fugro.com'))
//     .Filter(x => x.id.BiggerThan(5))
//     .ToString();

// console.log(result);

const result2 = new OQuery<User>(User)
  .select('id', 'displayName')
  .filter(f => f.displayName.contains('rosostolato'))
  .toString();

console.log(result2);
