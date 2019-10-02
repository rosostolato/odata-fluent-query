import "reflect-metadata";

const metakeys = Symbol("keys");

export function Property(target: any, key: string) {
  const keys: string[] = getPropertyKeys(target);
  Reflect.metadata(metakeys, [...keys, key])(target);
}

export function getPropertyKeys(target: any) {
  return Reflect.getMetadata(metakeys, target) || [];
}
