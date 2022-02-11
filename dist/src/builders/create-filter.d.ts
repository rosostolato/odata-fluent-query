import { QueryDescriptor } from '../models';
export declare function getFuncArgs(func: Function): string[];
export declare function dateToObject(d: Date): {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
};
export declare function makeExp(exp: string): any;
export declare function createFilter(descriptor: QueryDescriptor): (keyOrExp: any, exp?: any) => any;
