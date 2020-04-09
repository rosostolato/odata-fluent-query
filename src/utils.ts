import { QueryDescriptor } from "./odata-query";

export function mk_query(qd: QueryDescriptor) {
  let params: {
    key: string;
    value: string;
  }[] = [];

  if (qd.filters.length) {
    if (qd.filters.length > 1) {
      params.push({
        key: "$filter",
        value: `${qd.filters.map(mk_query_string_parentheses).join(" and ")}`,
      });
    } else {
      params.push({
        key: "$filter",
        value: `${qd.filters.join()}`,
      });
    }
  }

  if (qd.groupby.length) {
    let group = `groupby((${qd.groupby.join(",")})`;

    if (qd.groupAgg) {
      group += `,aggregate(${qd.groupAgg})`;
    }

    params.push({
      key: "$apply",
      value: group + ")",
    });
  }

  if (qd.expands.length) {
    params.push({
      key: "$expand",
      value: `${qd.expands.map(mk_rel_query_string).join(",")}`,
    });
  }

  if (qd.select.length) {
    params.push({
      key: "$select",
      value: `${qd.select.join(",")}`,
    });
  }

  if (qd.orderby.length) {
    params.push({
      key: "$orderby",
      value: `${qd.orderby.pop()}`,
    });
  }

  if (qd.skip != "none") {
    params.push({
      key: "$skip",
      value: `${qd.skip}`,
    });
  }

  if (qd.take != "none") {
    params.push({
      key: "$top",
      value: `${qd.take}`,
    });
  }

  if (qd.count == true) {
    params.push({
      key: "$count",
      value: `true`,
    });
  }

  return params;
}

export function mk_query_string_parentheses(query: string) {
  if (query.indexOf(" or ") > -1 || query.indexOf(" and ") > -1) {
    return `(${query})`;
  }

  return query;
}

export function mk_rel_query_string(rqd: QueryDescriptor): string {
  let expand: string = rqd.key;

  if (rqd.strict) {
    expand += "!";
  }

  if (
    rqd.filters.length ||
    rqd.orderby.length ||
    rqd.select.length ||
    rqd.expands.length ||
    rqd.skip != "none" ||
    rqd.take != "none" ||
    rqd.count != false
  ) {
    expand += `(`;

    let operators = [];

    if (rqd.skip != "none") {
      operators.push(`$skip=${rqd.skip}`);
    }

    if (rqd.take != "none") {
      operators.push(`$top=${rqd.take}`);
    }

    if (rqd.count == true) {
      operators.push(`$count=true`);
    }

    if (rqd.orderby.length) {
      operators.push(`$orderby=${rqd.orderby.join(",")}`);
    }

    if (rqd.select.length) {
      operators.push(`$select=${rqd.select.join(",")}`);
    }

    if (rqd.filters.length) {
      if (rqd.filters.length > 1) {
        operators.push(
          `$filter=${rqd.filters
            .map(mk_query_string_parentheses)
            .join(" and ")}`
        );
      } else {
        operators.push(`$filter=${rqd.filters.join()}`);
      }
    }

    if (rqd.expands.length) {
      operators.push(
        `$expand=${rqd.expands.map(mk_rel_query_string).join(",")}`
      );
    }

    expand += operators.join(";") + ")";
  }

  return expand;
}

export function get_param_key(exp: (...args: any[]) => any): string {
  return new RegExp(/(return *|=> *?)([a-zA-Z0-9_\$]+)/).exec(
    exp.toString()
  )[2];
}

export function get_property_keys(exp: (...args: any[]) => any): string[] {
  let funcStr = exp.toString();

  // key name used in expression
  const key = get_param_key(exp);

  let match: RegExpExecArray;
  const keys: string[] = [];
  const regex = new RegExp(key + "(\\.[a-zA-Z_0-9\\$]+)+\\b(?!\\()");

  // gets all properties of the used key
  while ((match = regex.exec(funcStr))) {
    funcStr = funcStr.replace(regex, "");
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
      .reduce(
        (a, c, i) =>
          Object(a[c]) === a[c]
            ? a[c]
            : (a[c] = Math.abs(path[i + 1]) >> 0 === +path[i + 1] ? [] : {}),
        obj
      )[path[path.length - 1]] = value;

    return obj;
  };

  const builder: any = {};
  keys.forEach((k) => set(builder, k, new builderType(k.split(".").join("/"))));
  return builder;
}
