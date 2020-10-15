import { QueryDescriptor } from '../models/query-descriptor';
export interface KeyValue<T> {
    key: string;
    value: T;
}
export declare function makeQuery(qd: QueryDescriptor): KeyValue<string>[];
export declare function makeQueryParentheses(query: string): string;
export declare function makeRelationQuery(rqd: QueryDescriptor): string;
