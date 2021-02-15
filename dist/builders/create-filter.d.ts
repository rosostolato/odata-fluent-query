import { QueryDescriptor } from '../models';
export declare function getFuncArgs(func: Function): string[];
export declare function makeExp(exp: string): any;
export declare function createFilter(descriptor: QueryDescriptor): (keyOrExp: any, exp?: any) => any;
