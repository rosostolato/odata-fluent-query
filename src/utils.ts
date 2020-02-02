import { QueryDescriptor } from "./odataquery";

export function mk_query_string(qd: QueryDescriptor): string {
  let params: string[] = [];

  if (qd.filters.isEmpty() == false) {
    if (qd.filters.count() > 1) {
      params.push(`$filter=${qd.filters.map(mk_query_string_parentheses).join(' and ')}`);
    } else {
      params.push(`$filter=${qd.filters.join()}`);
    }
  }

  if (qd.expands.isEmpty() == false) {
    params.push(`$expand=${qd.expands.map(mk_rel_query_string).join(',')}`);
  }

  if (qd.select.isEmpty() == false) {
    params.push(`$select=${qd.select.join(',')}`);
  }

  if (qd.orderby.isEmpty() == false) {
    params.push(`$orderby=${qd.orderby.last()}`);
  }

  if (qd.skip != 'none') {
    params.push(`$skip=${qd.skip}`);
  }

  if (qd.take != 'none') {
    params.push(`$top=${qd.take}`);
  }

  if (qd.count == true) {
    params.push(`$count=true`);
  }

  return params.join('&');
}

export function mk_query_string_parentheses(query: string) {
  if (query.indexOf(' or ') > -1 || query.indexOf(' and ') > -1) {
    return `(${query})`;
  }

  return query;
}

export function mk_rel_query_string(rqd: QueryDescriptor): string {
  let expand: string = rqd.key;

  if (rqd.strict) {
    expand += '!';
  }

  if (!rqd.filters.isEmpty() || !rqd.orderby.isEmpty() || !rqd.select.isEmpty() || !rqd.expands.isEmpty() || rqd.skip != 'none' || rqd.take != 'none' || rqd.count != false) {
    expand += `(`;

    let operators = [];

    if (rqd.skip != 'none') {
      operators.push(`$skip=${rqd.skip}`);
    }

    if (rqd.take != 'none') {
      operators.push(`$top=${rqd.take}`);
    }

    if (rqd.count == true) {
      operators.push(`$count=true`);
    }

    if (rqd.orderby.isEmpty() == false) {
      operators.push(`$orderby=${rqd.orderby.join(',')}`);
    }

    if (rqd.select.isEmpty() == false) {
      operators.push(`$select=${rqd.select.join(',')}`);
    }

    if (rqd.filters.isEmpty() == false) {
      if (rqd.filters.count() > 1) {
        operators.push(`$filter=${rqd.filters.map(mk_query_string_parentheses).join(' and ')}`);
      } else {
        operators.push(`$filter=${rqd.filters.join()}`);
      }
    }

    if (rqd.expands.isEmpty() == false) {
      operators.push(`$expand=${rqd.expands.map(mk_rel_query_string).join(',')}`);
    }

    expand += operators.join(';') + ')';
  }

  return expand
}

export function get_property_keys(exp: (...args: any[]) => any): string[] {
  let funcStr = exp.toString();

  // key name used in expression
  const key = new RegExp(/(return *|=> *?)([a-zA-Z0-9_\$]+)/).exec(funcStr)[2];

  let match: RegExpExecArray;
  const keys: string[] = [];
  const regex = new RegExp(key + '(\\.[a-zA-Z_0-9\\$]+)+\\b(?!\\()');
  // const regex = new RegExp(key + '\\.([a-zA-Z0-9_\\$]+)');

  // gets all properties of the used key
  while (match = regex.exec(funcStr)) {
    funcStr = funcStr.replace(regex, '');
    keys.push(match[0].slice(key.length + 1));
  }

  // return matched keys
  return keys;
}

export function mk_builder(keys: string[], builderType: any) {
  const set = (obj, path, value) => {
    if (Object(obj) !== obj) return obj;
    if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || [];

    path
      .slice(0, -1)
      .reduce((a, c, i) =>
        Object(a[c]) === a[c]
          ? a[c] : (a[c] = Math.abs(path[i + 1]) >> 0 === +path[i + 1] ? [] : {}),
        obj
      )[path[path.length - 1]] = value;
  
    return obj;
  };

  const builder: any = {};
  keys.forEach(k => set(builder, k, new builderType(k.split('.').join('/'))));
  return builder;
}
