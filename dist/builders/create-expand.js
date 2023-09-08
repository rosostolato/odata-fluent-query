import { createQuery, createQueryDescriptor } from './create-query';
function makeExpand(key = '') {
    return new Proxy({}, {
        get(_, prop) {
            if (prop === '_key')
                return key.slice(1);
            return makeExpand(`${key}/${String(prop)}`);
        },
    });
}
export function createExpand(descriptor) {
    return (keyOrExp, query) => {
        let key = '';
        if (typeof keyOrExp === 'function') {
            const exp = keyOrExp(makeExpand());
            key = exp._key;
        }
        else {
            key = String(keyOrExp);
        }
        const expand = createQuery(createQueryDescriptor(key));
        const result = query?.(expand) || expand;
        const newDescriptor = {
            ...descriptor,
            expands: descriptor.expands.concat(result._descriptor),
        };
        return createQuery(newDescriptor);
    };
}
//# sourceMappingURL=create-expand.js.map