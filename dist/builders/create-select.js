import { createQuery } from './create-query';
function makeSelect(key = '') {
    return new Proxy({}, {
        get(_, prop) {
            if (prop === '_key')
                return key.slice(1);
            return makeSelect(`${key}/${String(prop)}`);
        },
    });
}
export function createSelect(descriptor) {
    return (...keys) => {
        const _keys = keys
            .map(keyOrExp => {
            if (typeof keyOrExp === 'function') {
                const exp = keyOrExp(makeSelect());
                return exp._key;
            }
            else {
                return String(keyOrExp);
            }
        })
            .filter((k, i, arr) => arr.indexOf(k) === i); // unique
        return createQuery(Object.assign(Object.assign({}, descriptor), { select: _keys, expands: descriptor.expands.filter(e => _keys.some(k => e.key == String(k))) }));
    };
}
//# sourceMappingURL=create-select.js.map