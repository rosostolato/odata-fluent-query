import { FilterBuilderComplex, FilterBuilderNumber, FilterBuilderString, FilterBuilderDate, FilterBuilderBoolean, FilterBuilderCollection } from '../lib/filterbuilder';
import { mk_query, RelationBuilder, mk_rel_query } from '../lib/query';


console.log('test');

interface User {
    id: number;
    mail: string;
    displayName: string;
    createDate: Date;
    permission: Permission;
}

interface Permission {
    id: number;
    module: string;
    value: boolean;
}

const pfb: FilterBuilderComplex<Permission> = {
    id: new FilterBuilderNumber('id'),
    module: new FilterBuilderString('module'),
    value: new FilterBuilderBoolean('value')
}

const rb: RelationBuilder<User> = {
    permission: () => mk_rel_query<Permission>('permission', pfb, {}, {} as any)
}

const fb: FilterBuilderComplex<User> = {
    id: new FilterBuilderNumber('id'),
    mail: new FilterBuilderString('mail'),
    displayName: new FilterBuilderString('displayName'),
    createDate: new FilterBuilderDate('createDate'),
    permission: () => pfb
}

const query = mk_query<User>(
    fb, rb, '', {} as any, {} as any
);

const result = query
    .Select('id', 'displayName')
    .Filter(x => x.mail.Contains('fugro.com'))
    .Expand('permission', q => q.Select('id'))
    .ToString();

console.log(result);
