import "reflect-metadata";

const META_QUERY_KEYS = Symbol();
const META_EXPAND_TYPES = Symbol();

export function EnableQuery(target: any, key: string) {
  const keys: string[] = getQueryKeys(target);
  Reflect.metadata(META_QUERY_KEYS, [...keys, key])(target);
}

export function getQueryKeys(target: any) {
  return Reflect.getMetadata(META_QUERY_KEYS, target) || [];
}

export function EnableExpand<T>(type: new () => T) {
  return Reflect.metadata(META_EXPAND_TYPES, type);
}

export function getExpandType<T, key extends keyof T>(target: new () => T, key: key): new () => T[key] {
  return Reflect.getMetadata(META_EXPAND_TYPES, target.prototype, String(key));
}
