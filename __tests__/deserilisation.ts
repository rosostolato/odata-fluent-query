import { failed, parseBoolean, parseDate, parseNullBoolean, parseNullDate, parseNullCollection, parseNullString, parseString, succes, parseNullNumber, parseNumber, parseEntity, parseCollection } from "../lib/deserilisation";
import { List } from "immutable"

describe('string parsing', () => {
  test('test value "HI"', () => expect(parseString('Hi')).toEqual(succes('Hi')))
  test('test value null (parsing should fail)', () => expect(parseString(null)).toEqual(failed(`Parsing of 'null' to string failed`)))
  test('test value 5 (parsing should fail)', () => expect(parseString(5)).toEqual(failed(`Parsing of '5' to string failed`)))
})

describe('nullable string parsing', () => {
  test('test value "HI"', () => expect(parseNullString('Hi')).toEqual(succes('Hi')))
  test('test value null', () => expect(parseNullString(null)).toEqual(succes(null)))
  test('test value 5 (parsing should fail)', () => expect(parseNullString(5)).toEqual(failed(`parsing of '5' to string | null failed`)))
})

describe('boolean parsing', () => {
  test('test value "true"', () => expect(parseBoolean(true)).toEqual(succes(true)))
  test('test value null (parsing should fail)', () => expect(parseBoolean(null)).toEqual(failed(`Parsing of 'null' to boolean failed`)))
  test('test value 5 (parsing should fail)', () => expect(parseBoolean(5)).toEqual(failed(`Parsing of '5' to boolean failed`)))
})

describe('nullable boolean parsing', () => {
  test('test value "true"', () => expect(parseNullBoolean(true)).toEqual(succes(true)))
  test('test value null', () => expect(parseNullBoolean(null)).toEqual(succes(null)))
  test('test value 5 (parsing should fail)', () => expect(parseNullBoolean(5)).toEqual(failed(`parsing of '5' to boolean | null failed`)))
})

describe('date parsing', () => {
  // test('test value "2017-08-17T12:47:16+02:00"', () => expect(parseDate("2017-08-17T12:47:16+02:00")).toEqual(succes(new Date("2017-08-17T12:47:16+02:00"))))
  test('test value "2017-08-17T12:47:16+02:00"', () => expect(parseDate("2017-08-17T12:47:16.754")).toEqual(succes(new Date(Date.UTC(2017, 7, 17, 12, 47, 16, 754)))))
  test('test value "2017-08-17T12:47:16+02:00"', () => expect(parseDate("2017-08-17T12:47:16+02:00")).toEqual(succes(new Date(2017, 7, 17, 12, 47, 16))))
  test('test value "2017-08-17T12:47:16+02:00"', () => expect(parseDate("2017-08-17T12:47:16")).toEqual(succes(new Date(Date.UTC(2017, 7, 17, 12, 47, 16)))))
  test('test value "2017-08-17"', () => expect(parseDate("2017-08-17")).toEqual(succes(new Date(Date.UTC(2017, 7, 17)))))
  test('test value "bla" (parsing should fail)', () => expect(parseDate("bla")).toEqual(failed(`Parsing of 'bla' to date failed'`)))
  test('test value null (parsing should fail)', () => expect(parseDate(null)).toEqual(failed(`Parsing of 'null' to date failed'`)))
  test('test value 5 (parsing should fail)', () => expect(parseDate(5)).toEqual(failed(`Parsing of '5' to date failed'`)))
})

describe('nullable date parsing', () => {
  test('test value "2017-08-17T12:47:16+02:00"', () => expect(parseNullDate("2017-08-17T12:47:16+02:00")).toEqual(succes(new Date(2017, 7, 17, 12, 47, 16))))
  test('test value "2017-08-17T12:47:16"', () => expect(parseNullDate("2017-08-17T12:47:16")).toEqual(succes(new Date(Date.UTC(2017, 7, 17, 12, 47, 16)))))
  test('test value "2017-08-17"', () => expect(parseNullDate("2017-08-17")).toEqual(succes(new Date(Date.UTC(2017, 7, 17)))))
  test('test value "bla" (parsing should fail)', () => expect(parseNullDate("bla")).toEqual(failed(`Parsing of 'bla' to date | null failed'`)))
  test('test value null', () => expect(parseNullDate(null)).toEqual(succes(null)))
  test('test value 5 (parsing should fail)', () => expect(parseNullDate(5)).toEqual(failed(`Parsing of '5' to date | null failed'`)))
})


describe('number parsing', () => {
  test('test value 5', () => expect(parseNumber(5)).toEqual(succes(5)))
  test('test value null (parsing should fail)', () => expect(parseNumber(null)).toEqual(failed(`Parsing of 'null' to number failed`)))
  test('test value "Hi" (parsing should fail)', () => expect(parseNumber('Hi')).toEqual(failed(`Parsing of 'Hi' to number failed`)))
})

describe('nullable number parsing', () => {
  test('test value 5', () => expect(parseNullNumber(5)).toEqual(succes(5)))
  test('test value null', () => expect(parseNullNumber(null)).toEqual(succes(null)))
  test('test value "Hi" (parsing should fail)', () => expect(parseNullNumber('Hi')).toEqual(failed(`parsing of 'Hi' to number | null failed`)))
})

describe('entity parsing', () => {
  test('test value {val: "string"} for {val: string}', () => expect(parseEntity<{ val: string }>({ val: 'string' }, { val: parseString })).toEqual(succes({ val: 'string' })))
  test('test value {val: 5} for {val: string} (parsing should fail)', () => expect(parseEntity<{ val: string }>({ val: 5 }, { val: parseString })).toEqual(failed(`Parsing of '5' to string failed`)))
  test('test value {val: "s", val1: 5} for {val: string, val1: number}', () => expect(parseEntity<{ val: string, val1: number }>({ val: 's', val1: 5 }, { val: parseString, val1: parseNullNumber })).toEqual(succes({ val: 's', val1: 5 })))
  test('test value {val: "s", val1: true} for {val: string, val1: number} (parsing should fail)', () => expect(parseEntity<{ val: string, val1: number }>({ val: 's', val1: true }, { val: parseString, val1: parseNumber })).toEqual(failed(`Parsing of 'true' to number failed`)))
  test('test value null for {val: string} (parsing should fail)', () => expect(parseEntity<{ val: string }>(null, { val: parseString })).toEqual(failed(`Parsing of 'null' to entity failed`)))
})

describe('collection parsing', () => {
  test('test value [{val: "string"}] for {val:string}[]', () => expect(parseCollection<{ val: string }>(v => parseEntity<{ val: string }>(v, { val: parseString }))([{ val: 'string' }])).toEqual(succes(List([{ val: 'string' }]))))
  test('test value [{val: 5}] for {val:string}[] (parsing should fail)', () => expect(parseCollection<{ val: string }>(v => parseEntity<{ val: string }>(v, { val: parseString }))([{ val: 5 }])).toEqual(failed(`Parsing of '5' to string failed`)))
  test('test value null for {val:string}[] (parsing should fail)', () => expect(parseCollection<{ val: string }>(v => parseEntity<{ val: string }>(v, { val: parseString }))(null)).toEqual(failed(`Parsing of 'null' to array failed`)))
})

describe('nullable collection parsing', () => {
  test('test value [{val: "string"}] for {val:string}[]', () => expect(parseNullCollection<{ val: string }>(v => parseEntity<{ val: string }>(v, { val: parseString }))([{ val: 'string' }])).toEqual(succes(List([{ val: 'string' }]))))
  test('test value [{val: 5}] for {val:string}[] (parsing should fail)', () => expect(parseNullCollection<{ val: string }>(v => parseEntity<{ val: string }>(v, { val: parseString }))([{ val: 5 }])).toEqual(failed(`Parsing of '5' to string failed`)))
  test('test value null for {val:string}[]', () => expect(parseNullCollection<{ val: string }>(v => parseEntity<{ val: string }>(v, { val: parseString }))(null)).toEqual(succes(null)))
})