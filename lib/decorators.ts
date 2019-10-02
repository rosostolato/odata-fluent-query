import "reflect-metadata";

const metakeys = Symbol("keys");
const metatypes = Symbol("types");

export function Property(target: any, key: string) {
  const keys: string[] = getPropertyKeys(target);
  Reflect.metadata(metakeys, [...keys, key])(target);
}

export function getPropertyKeys(target: any) {
  return Reflect.getMetadata(metakeys, target) || [];
}

export function Type<T>(type: new () => T) {
  return Reflect.metadata(metatypes, type);
}

export function getPropertyType<T, key extends keyof T>(target: new () => T, key: key): new () => T[key] {
  return Reflect.getMetadata(metatypes, target.prototype, String(key));
}
