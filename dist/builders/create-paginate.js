import { createQuery } from './create-query';
export function createPaginate(descriptor) {
    return (sizeOrOptions, page) => {
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
        const queryDescriptor = {
            ...descriptor,
            take: data.pagesize,
            skip: data.pagesize * data.page,
            count: data.count,
        };
        if (!queryDescriptor.skip) {
            queryDescriptor.skip = undefined;
        }
        return createQuery(queryDescriptor);
    };
}
//# sourceMappingURL=create-paginate.js.map