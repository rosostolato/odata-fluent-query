import { createQuery, createQueryDescriptor } from './builders';
export function odataQuery() {
    const defaultDescriptor = createQueryDescriptor();
    return createQuery(defaultDescriptor);
}
export * from './models';
export default odataQuery;
//# sourceMappingURL=index.js.map