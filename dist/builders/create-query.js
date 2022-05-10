import { createFilter } from './create-filter';
import { createGroupby } from './create-groupby';
import { createOrderby } from './create-orderby';
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
        select: createSelect(descriptor),
        orderBy: createOrderby(descriptor),
        filter: createFilter(descriptor),
        groupBy: createGroupby(descriptor),
        count() {
            return createQuery(Object.assign(Object.assign({}, descriptor), { count: true }));
        },
        paginate(sizeOrOptions, page) {
            let data;
            if (typeof sizeOrOptions === 'number') {
                data = {
                    page: page,
                    count: true,
                    pagesize: sizeOrOptions,
                };
            }
            else {
                data = sizeOrOptions;
                if (data.count === undefined) {
                    data.count = true;
                }
            }
            const queryDescriptor = Object.assign(Object.assign({}, descriptor), { take: data.pagesize, skip: data.pagesize * data.page, count: data.count });
            if (!queryDescriptor.skip) {
                queryDescriptor.skip = undefined;
            }
            return createQuery(queryDescriptor);
        },
        expand(key, query) {
            const expand = createQuery(createQueryDescriptor(key));
            const result = (query === null || query === void 0 ? void 0 : query(expand)) || expand;
            const newDescriptor = Object.assign(Object.assign({}, descriptor), { expands: descriptor.expands.concat(result._descriptor) });
            return createQuery(newDescriptor);
        },
        toString() {
            return makeQuery(descriptor)
                .map(p => `${p.key}=${p.value}`)
                .join('&');
        },
        toObject() {
            return makeQuery(descriptor).reduce((obj, x) => {
                obj[x.key] = x.value;
                return obj;
            }, {});
        },
    };
}
//# sourceMappingURL=create-query.js.map