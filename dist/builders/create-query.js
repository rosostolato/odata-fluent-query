import { createExpand } from './create-expand';
import { createFilter } from './create-filter';
import { createGroupby } from './create-groupby';
import { createOrderby } from './create-orderby';
import { createPaginate } from './create-paginate';
import { createSelect } from './create-select';
import { makeQuery } from './query-builder';
export function createQueryDescriptor(key) {
    return {
        key: key,
        skip: undefined,
        take: undefined,
        count: false,
        aggregator: undefined,
        filters: [],
        expands: [],
        orderby: [],
        groupby: [],
        select: [],
    };
}
export function createQuery(descriptor) {
    return {
        _descriptor: descriptor,
        expand: createExpand(descriptor),
        filter: createFilter(descriptor),
        groupBy: createGroupby(descriptor),
        orderBy: createOrderby(descriptor),
        paginate: createPaginate(descriptor),
        select: createSelect(descriptor),
        count() {
            return createQuery({
                ...descriptor,
                count: true,
            });
        },
        toObject() {
            return makeQuery(descriptor).reduce((obj, x) => {
                obj[x.key] = x.value;
                return obj;
            }, {});
        },
        toString() {
            return makeQuery(descriptor)
                .map(p => `${p.key}=${p.value}`)
                .join('&');
        },
    };
}
//# sourceMappingURL=create-query.js.map