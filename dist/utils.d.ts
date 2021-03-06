import { QueryDescriptor } from "./odata-query";
export declare function mk_query(qd: QueryDescriptor): {
    key: string;
    value: string;
}[];
export declare function mk_query_string_parentheses(query: string): string;
export declare function mk_rel_query_string(rqd: QueryDescriptor): string;
export declare function get_param_key(exp: (...args: any[]) => any): string;
export declare function get_property_keys(exp: (...args: any[]) => any): string[];
export declare function mk_builder(keys: string[], builderType: any): any;
