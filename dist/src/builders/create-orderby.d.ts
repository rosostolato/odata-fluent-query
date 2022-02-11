import { QueryDescriptor } from '../models';
export declare function createOrderby(descriptor: QueryDescriptor): (keyOrExp: any, order?: "desc" | "asc" | undefined) => any;
