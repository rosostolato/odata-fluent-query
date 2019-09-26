import { List } from "immutable"

export const parseNumber = (v: any): ParserResult<number> => {
  if (typeof v != 'number') return failed(`Parsing of '${v}' to number failed`)

  const p = Number(v)
  if (Number.isNaN(p)) {
    return failed(`Parsing of '${v}' to number failed`)
  }
  return succes(p)
}

export const parseBoolean = (v: any): ParserResult<boolean> => {
  if (typeof v == 'boolean') {
    return succes(v)
  }
  return failed(`Parsing of '${v}' to boolean failed`)
}

export const parseDate = (v: any): ParserResult<Date> => {
  const s = parseString(v)

  if (s.kind == 'failed') {
    return failed(`Parsing of '${v}' to date failed'`)
  }
  let hasTimezone = s.value.split(/[+]/).length > 1
  let parts = s.value.split(/[+]/)[0].split(/[-T:.]/).map(v => parseInt(v)) // split on any '+' characters for timezones, and then split on '-, T, : and .' for getting all parts of the dateTime
  let year = parts[0]
  let month = parts[1] - 1 // months are zero based indexed ('cause javascript)
  let day = parts[2]
  let hour = 0
  let minute = 0
  let second = 0
  let millisecond = 0
  if (parts.length > 3) {
    hour = parts[3]
    minute = parts[4]
    second = parts[5]
  }
  if (parts.length > 6) {
    millisecond = parts[6]
  }
  const d = hasTimezone
    ? new Date(year, month, day, hour, minute, second, millisecond)
    : new Date(Date.UTC(year, month, day, hour, minute, second, millisecond))

  // when a Date isn't valid, getTime() will return NaN. NaN === NaN will return false ('cause javascript) while a valid number will always be equal to it self.
  if (d.getTime() === d.getTime()) {
    return succes(d)
  }

  return failed(`Parsing of '${v}' to date failed'`)
}

export const parseBinary = (v: any): ParserResult<Uint8Array> => {
  if(typeof(v) == 'string') {
    return succes(Uint8Array.from(atob(v), c => c.charCodeAt(0)))
  }
  return failed(`Parsing of '${v}' to Uint8Array failed`)
}

export const parseString = (v: any): ParserResult<string> => {
  if (typeof v == 'string') {
    return succes(v)
  }
  return failed(`Parsing of '${v}' to string failed`)
}

export const parseCollection = <T>(parser: (_: any) => ParserResult<T>) => (v: any): ParserResult<List<T>> => {
  if (typeof v == 'object' && Array.isArray(v)) {
    let res: T[] = []

    for (let i = 0; i < v.length; i++) {
      const v1 = v[i]
      const res1: ParserResult<T> = parser(v1)
      if (res1.kind == 'succes') {
        res.push(res1.value)
      } else {
        return res1
      }
    }

    return succes(List(res))
  }
  return failed(`Parsing of '${v}' to array failed`)
}

export const parseNullCollection = <T>(parser: (_: any) => ParserResult<T>) => (v: any): ParserResult<List<T> | null> => {
  if (v == null) return succes(null)
  return parseCollection(parser)(v)
}

export const parseEntity = <E extends object>(e: any, parser: EntityParser<E>): ParserResult<E> => {
  if (e == null) return failed(`Parsing of '${e}' to entity failed`)
  let r: ParserResult<E> = Object.keys(parser).reduce((r, k) => {
    if (r.kind == 'failed') {
      return r
    }
    const v = parser[k](e[k])
    if (v.kind == 'failed') {
      return v
    }
    r.value[k] = v.value
    return r
  }, succes({}) as ParserResult<E>)

  return r
}

export const parseNullString = (s: any): ParserResult<string | null> =>
  s == null || typeof s == 'string'
    ? succes<string | null>(s)
    : failed(`parsing of '${s}' to string | null failed`)

export const parseNullBoolean = (b: any): ParserResult<boolean | null> =>
  b == null ? succes(null)
    : typeof b == 'boolean' ? succes(b)
      : failed(`parsing of '${b}' to boolean | null failed`)

export const parseNullNumber = (b: any): ParserResult<number | null> =>
  b == null ? succes(null)
    : typeof b == 'number' ? succes(b)
      : failed(`parsing of '${b}' to number | null failed`)


export const parseNullBinary = (v: any): ParserResult<Uint8Array | null> =>{
  if(v == null) return succes(null)
  const parsedBinary = parseBinary(v)
  if(parsedBinary.kind == 'failed') {
    return failed(`Parsing of '${v}' to Uint8Array | null failed'`)
  }
  return parsedBinary
}

export const parseNullDate = (v: any): ParserResult<Date | null> => {
  if (v == null) {
    return succes(null)
  }
  let parsedDate = parseDate(v)
  if (parsedDate.kind == "failed") {
    return failed(`Parsing of '${v}' to date | null failed'`)
  }
  return parsedDate
}

export type Parser<T> =
  T extends null | undefined ? NullAbleParser<T> :
  T extends Uint8Array ? (v: any) => ParserResult<Uint8Array> : 
  T extends boolean ? (v: any) => ParserResult<boolean> : // this one is needed because of some ts weirdness
  T extends Date ? (v: any) => ParserResult<Date> :
  T extends string ? (v: any) => ParserResult<T | null> :
  T extends List<infer R> ? R extends object ? (_: EntityParser<R>) => (v: any) => ParserResult<List<R>> : never :
  T extends object ? (_: EntityParser<T>) => (v: any) => ParserResult<T> :
  (_: any) => ParserResult<T>

export type NullAbleParser<T> =
  T extends Uint8Array ? (v: any) => ParserResult<Uint8Array | null> : 
  T extends boolean ? (v: any) => ParserResult<boolean | null> : // this one is needed because of some ts weirdeness
  T extends Date ? (v: any) => ParserResult<Date | null> :
  T extends List<infer R> ? R extends object ? (_: EntityParser<R>) => (v: any) => ParserResult<List<R> | null> : never :
  T extends object ? (_: EntityParser<T>) => (v: any) => ParserResult<T | null> :
  (_: any) => ParserResult<T | null>

export type EntityParser<M extends object> = {
  [P in keyof M]: Parser<M[P]>
}

export type ParserResult<T> = { kind: 'succes', value: T } | { kind: 'failed', error: string }
export const failed = (e: string) => ({ kind: 'failed' as 'failed', error: e })
export const succes = <T>(v: T) => ({ kind: 'succes' as 'succes', value: v })