import "reflect-metadata";

const META_QUERY_KEYS = Symbol();
const META_EXPAND_TYPES = Symbol();

/**
 * Enable query for each property on filter and orderby.
 * You can use the 'key' prop if you don't want to decorate.
 * 
 * @param relClass The relationship object Class
 */
export function EnableQuery<T>(relClass?: new () => T) {
  return function(target: any, key: string): void {
    const keys: string[] = getQueryKeys(target);
    Reflect.metadata(META_QUERY_KEYS, [...keys, key])(target);
    Reflect.metadata(META_EXPAND_TYPES, relClass)(target, key);
  }
}

/**
 * Get class property keys from @EnableQuery decorato
 * 
 * @param target Target class
 * @internal
 */
export function getQueryKeys(target: any): string[] {
  return Reflect.getMetadata(META_QUERY_KEYS, target) || [];
}

/**
 * Get relation type for expand.
 * 
 * @param target Target class
 * @param key Property key
 * 
 * @internal
 */
export function getExpandType<T, key extends keyof T>(target: new () => T, key: key): new () => T[key] {
  if (!target) return (() => {}) as any;
  return Reflect.getMetadata(META_EXPAND_TYPES, target.prototype, String(key));
}
