import { QueryDescriptor } from '../models';
export declare function groupbyBuilder(aggregator?: string[]): {
    aggregator: string[];
    sum(prop: string, as: string): any;
    min(prop: string, as: string): any;
    max(prop: string, as: string): any;
    average(prop: string, as: string): any;
    countdistinct(prop: string, as: string): any;
    custom: (prop: string, aggreg: string, as: string) => any;
};
export declare function createGroupby(descriptor: QueryDescriptor): (keys: string[], aggregate?: Function | undefined) => any;
