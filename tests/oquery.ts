import { mk_query_string, mk_query_descriptor, mk_rel_query_string, mk_rel_query_descriptor, getPropertyKey } from "../src/oquery";
import { List } from "immutable";

describe('testing getPropertyKey function', () => {
  let func: any;
  let any: any;

  func = x => x.id
  test('get key in function call [1]', () => expect(getPropertyKey(func)).toBe('id'))

  func = (x: any) => x.id
  test('get key in function call [2]', () => expect(getPropertyKey(func)).toBe('id'))

  func = _x => _x.id
  test('get key in function call [3]', () => expect(getPropertyKey(func)).toBe('id'))

  func = x => x.id.biggerThan(5)
  test('get key in function call [4]', () => expect(getPropertyKey(func)).toBe('id'))

  func = x=>x.id.biggerThan(5)
  test('get key in function call [5]', () => expect(getPropertyKey(func)).toBe('id'))

  func = test => any.id.biggerThan(5)
  test('get key in function call [6]', () => expect(getPropertyKey(func)).toBe('id'))

  func = (x, y) => x.id.biggerThan(5)
  test('get key in function call [7]', () => expect(getPropertyKey(func)).toBe('id'))

  func = x => { return   x.id.biggerThan(5); }
  test('get key in function call [8]', () => expect(getPropertyKey(func)).toBe('id'))

  func = (x, y) => { y = any.description; return x.id.biggerThan(y); }
  test('get key in function call [9]', () => expect(getPropertyKey(func)).toBe('id'))

  func = function (x) { return x.id.biggerThan(5); }
  test('get key in function call [10]', () => expect(getPropertyKey(func)).toBe('id'))

  func = function test(x) { return x.id.biggerThan(5); }
  test('get key in function call [11]', () => expect(getPropertyKey(func)).toBe('id'))

  func = function(x) { return x.id.biggerThan(5); }
  test('get key in function call [12]', () => expect(getPropertyKey(func)).toBe('id'))

  func = function(x){ return x.id.biggerThan(5); }
  test('get key in function call [13]', () => expect(getPropertyKey(func)).toBe('id'))

  func = function (x, y) { return x.id.biggerThan(5); }
  test('get key in function call [14]', () => expect(getPropertyKey(func)).toBe('id'))
});

describe('testing querybuilding', () => {
  test('get key in function call', () => expect(getPropertyKey(x => x.id.test())).toBe('id'))

  test('select Id', () => expect(mk_query_string(mk_query_descriptor('', { select: List(['Id']) }))).toBe('$select=Id'))
  test('select Id, Name', () => expect(mk_query_string(mk_query_descriptor('', { select: List(['Id', 'Name']) }))).toBe('$select=Id,Name'))
  test('select Id, Name and count = true', () => expect(mk_query_string(mk_query_descriptor('', { select: List(['Id', 'Name']), 'count': true }))).toBe('$select=Id,Name&$count=true'))
  test('select Id, Name and orderby Id', () => expect(mk_query_string(mk_query_descriptor('', { select: List(['Id', 'Name']), orderby: List(['Id']) }))).toBe('$select=Id,Name&$orderby=Id'))
  test('select Id, Name and skip = 5 and take = 5', () => expect(mk_query_string(mk_query_descriptor('', { select: List(['Id', 'Name']), skip: 5, take: 5 }))).toBe('$select=Id,Name&$skip=5&$top=5'))
});

describe('testing relation querybuilding', () => {
  test('select Id', () => expect(mk_rel_query_string(mk_rel_query_descriptor('', { select: List(['Id']) }))).toBe('($select=Id)'))
  test('select Id, Name', () => expect(mk_rel_query_string(mk_rel_query_descriptor('', { select: List(['Id', 'Name']) }))).toBe('($select=Id,Name)'))
  test('select Id, Name and orderby Id', () => expect(mk_rel_query_string(mk_rel_query_descriptor('', { select: List(['Id', 'Name']), orderby: List(['Id']) }))).toBe('($orderby=Id;$select=Id,Name)'))
  test('select Id, Name and skip = 5 and take = 5', () => expect(mk_rel_query_string(mk_rel_query_descriptor('', { select: List(['Id', 'Name']), skip: 5, take: 5 }))).toBe('($skip=5;$top=5;$select=Id,Name)'))

  test('select Id and expand "rel" with Id', () => expect(mk_query_string(mk_query_descriptor('', { select: List(['Id']), expands: List([mk_rel_query_descriptor('rel', { select: List(['Id']) })]) }))).toBe('$expand=rel($select=Id)&$select=Id'))
  test('select Id and expand "rel" with Id, Name', () => expect(mk_query_string(mk_query_descriptor('', { select: List(['Id']), expands: List([mk_rel_query_descriptor('rel', { select: List(['Id', 'Name']) })]) }))).toBe('$expand=rel($select=Id,Name)&$select=Id'))
  test('select Id and expand "rel" with Id and orderby Name', () => expect(mk_query_string(mk_query_descriptor('', { select: List(['Id']), expands: List([mk_rel_query_descriptor('rel', { select: List(['Id']), orderby: List(['Name']) })]) }))).toBe('$expand=rel($orderby=Name;$select=Id)&$select=Id'))
});
