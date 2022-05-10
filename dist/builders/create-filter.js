import { createQuery } from './create-query';
export function getFuncArgs(func) {
    var _a;
    const [, , paramStr] = (_a = /(function)?(.*?)(?=[={])/.exec(func.toString())) !== null && _a !== void 0 ? _a : [];
    return (paramStr !== null && paramStr !== void 0 ? paramStr : '')
        .replace('=>', '')
        .replace('(', '')
        .replace(')', '')
        .split(',')
        .map(s => s.trim());
}
export function dateToObject(d) {
    if (typeof d === 'string') {
        d = new Date(d);
    }
    return {
        year: d.getFullYear(),
        month: d.getMonth(),
        day: d.getFullYear(),
        hour: d.getFullYear(),
        minute: d.getFullYear(),
        second: d.getFullYear(),
    };
}
export function makeExp(exp) {
    const _get = (checkParetheses = false) => {
        if (!checkParetheses) {
            return exp;
        }
        else if (exp.indexOf(' or ') > -1 || exp.indexOf(' and ') > -1) {
            return `(${exp})`;
        }
        else {
            return exp;
        }
    };
    return {
        _get,
        not: () => makeExp(`not (${exp})`),
        and: (exp) => makeExp(`${_get()} and ${exp._get(true)}`),
        or: (exp) => makeExp(`${_get()} or ${exp._get(true)}`),
    };
}
function filterBuilder(key) {
    const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const arrFuncBuilder = (method) => (exp) => {
        const [arg] = getFuncArgs(exp);
        const builder = exp(makeFilter(arg));
        const expr = builder._get();
        return makeExp(`${key}/${method}(${arg}: ${expr})`);
    };
    const strFuncBuilder = (method) => (s, opt) => {
        if (opt === null || opt === void 0 ? void 0 : opt.caseInsensitive) {
            return makeExp(`${method}(tolower(${key}), ${typeof s == 'string'
                ? `'${s.toLocaleLowerCase()}'`
                : `tolower(${s._key})`})`);
        }
        else if (s.getPropName) {
            return makeExp(`${method}(${key}, ${s._key})`);
        }
        else {
            return makeExp(`${method}(${key}, ${typeof s == 'string' ? `'${s}'` : s})`);
        }
    };
    const equalityBuilder = (t) => (x, opt) => {
        switch (typeof x) {
            case 'string':
                if (isGuid.test(x) && !(opt === null || opt === void 0 ? void 0 : opt.ignoreGuid)) {
                    return makeExp(`${key} ${t} ${x}`); // no quote around ${x}
                }
                else if (opt === null || opt === void 0 ? void 0 : opt.caseInsensitive) {
                    return makeExp(`tolower(${key}) ${t} '${x.toLocaleLowerCase()}'`);
                }
                else {
                    return makeExp(`${key} ${t} '${x}'`);
                }
            case 'number':
                return makeExp(`${key} ${t} ${x}`);
            case 'boolean':
                return makeExp(`${key} ${t} ${x}`);
            default:
                if (x && (opt === null || opt === void 0 ? void 0 : opt.caseInsensitive)) {
                    return makeExp(`tolower(${key}) ${t} tolower(${x._key})`);
                }
                else {
                    return makeExp(`${key} ${t} ${(x === null || x === void 0 ? void 0 : x._key) || null}`);
                }
        }
    };
    const dateComparison = (compare) => (d) => {
        if (typeof d === 'string')
            return makeExp(`${key} ${compare} ${d}`);
        else if (d instanceof Date)
            return makeExp(`${key} ${compare} ${d.toISOString()}`);
        else
            return makeExp(`${key} ${compare} ${d._key}`);
    };
    const numberComparison = (compare) => (n) => makeExp(`${key} ${compare} ${typeof n == 'number' ? n : n._key}`);
    return {
        _key: key,
        /////////////////////
        // FilterBuilderDate
        inTimeSpan: (y, m, d, h, mm) => {
            let exps = [`year(${key}) eq ${y}`];
            if (m != undefined)
                exps.push(`month(${key}) eq ${m}`);
            if (d != undefined)
                exps.push(`day(${key}) eq ${d}`);
            if (h != undefined)
                exps.push(`hour(${key}) eq ${h}`);
            if (mm != undefined)
                exps.push(`minute(${key}) eq ${mm}`);
            return makeExp('(' + exps.join(') and (') + ')');
        },
        isSame: (x, g) => {
            if (typeof x === 'string') {
                return makeExp(`${key} eq ${x}`);
            }
            else if (typeof x === 'number') {
                return makeExp(`${g}(${key}) eq ${x}`);
            }
            else if (x instanceof Date) {
                if (g == null) {
                    return makeExp(`${key} eq ${x.toISOString()}`);
                }
                else {
                    const o = dateToObject(x);
                    return makeExp(`${g}(${key}) eq ${o[g]}`);
                }
            }
            else {
                return makeExp(`${g}(${key}) eq ${g}(${x._key})`);
            }
        },
        isAfter: dateComparison('gt'),
        isBefore: dateComparison('lt'),
        isAfterOrEqual: dateComparison('ge'),
        isBeforeOrEqual: dateComparison('le'),
        /////////////////////
        // FilterBuilderArray
        empty: () => makeExp(`not ${key}/any()`),
        notEmpty: () => makeExp(`${key}/any()`),
        any: arrFuncBuilder('any'),
        all: arrFuncBuilder('all'),
        //////////////////////
        // FilterBuilderString
        notNull: () => makeExp(`${key} ne null`),
        contains: strFuncBuilder('contains'),
        startsWith: strFuncBuilder('startswith'),
        endsWith: strFuncBuilder('endswith'),
        //////////////////////
        // FilterBuilderNumber
        biggerThan: numberComparison('gt'),
        lessThan: numberComparison('lt'),
        biggerOrEqualThan: numberComparison('ge'),
        lessOrEqualThan: numberComparison('le'),
        ////////////////////////////////
        // FilterBuilder Generic Methods
        equals: equalityBuilder('eq'),
        notEquals: equalityBuilder('ne'),
        in(arr) {
            const list = arr
                .map(x => (typeof x === 'string' ? `'${x}'` : x))
                .join(',');
            return makeExp(`${key} in (${list})`);
        },
    };
}
function makeFilter(prefix = '') {
    return new Proxy({}, {
        get(_, prop) {
            const methods = filterBuilder(prefix);
            const key = prefix ? `${prefix}/${String(prop)}` : String(prop);
            return (methods === null || methods === void 0 ? void 0 : methods[prop]) ? methods[prop] : makeFilter(String(key));
        },
    });
}
export function createFilter(descriptor) {
    return (keyOrExp, exp) => {
        const expr = typeof keyOrExp === 'string'
            ? exp(filterBuilder(keyOrExp))
            : keyOrExp(makeFilter());
        return createQuery(Object.assign(Object.assign({}, descriptor), { filters: descriptor.filters.concat(expr._get()) }));
    };
}
//# sourceMappingURL=create-filter.js.map