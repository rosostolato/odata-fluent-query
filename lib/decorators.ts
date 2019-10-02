export const Property = (target: any, key: string) => {  
  target.__keys = [...(target.__keys || []), key];
}
