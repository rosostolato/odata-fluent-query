import { mk_query_string, mk_rel_query, mk_query_descriptor, mk_rel_query_string, mk_rel_query_descriptor } from "../src/query"
import { List } from "immutable"

describe('testing querybuilding', () => {
  test('select Id', () => expect(mk_query_string(mk_query_descriptor('', { select: List(['Id']) }))).toBe('?$select=Id'))
  test('select Id, Name', () => expect(mk_query_string(mk_query_descriptor('', { select: List(['Id', 'Name']) }))).toBe('?$select=Id,Name'))
  test('select Id, Name and count = true', () => expect(mk_query_string(mk_query_descriptor('', { select: List(['Id', 'Name']), 'count': true }))).toBe('?$select=Id,Name&$count=true'))
  test('select Id, Name and orderby Id', () => expect(mk_query_string(mk_query_descriptor('', { select: List(['Id', 'Name']), orderby: 'Id' }))).toBe('?$select=Id,Name&$orderby=Id'))
  test('select Id, Name and skip = 5 and take = 5', () => expect(mk_query_string(mk_query_descriptor('', { select: List(['Id', 'Name']), skip: 5, take: 5 }))).toBe('?$select=Id,Name&$skip=5&$top=5'))
})

describe('testing relation querybuilding', () => {
  test('select Id', () => expect(mk_rel_query_string(mk_rel_query_descriptor('', { select: List(['Id']) }))).toBe('($select=Id)'))
  test('select Id, Name', () => expect(mk_rel_query_string(mk_rel_query_descriptor('', { select: List(['Id', 'Name']) }))).toBe('($select=Id,Name)'))
  test('select Id, Name and orderby Id', () => expect(mk_rel_query_string(mk_rel_query_descriptor('', { select: List(['Id', 'Name']), orderby: List(['Id']) }))).toBe('($orderby=Id;$select=Id,Name)'))
  test('select Id, Name and skip = 5 and take = 5', () => expect(mk_rel_query_string(mk_rel_query_descriptor('', { select: List(['Id', 'Name']), skip: 5, take: 5 }))).toBe('($skip=5;$top=5;$select=Id,Name)'))

  test('select Id and expand "rel" with Id', () => expect(mk_query_string(mk_query_descriptor('', { select: List(['Id']), expands: List([mk_rel_query_descriptor('rel', { select: List(['Id']) })]) }))).toBe('?$expand=rel($select=Id)&$select=Id'))
  test('select Id and expand "rel" with Id, Name', () => expect(mk_query_string(mk_query_descriptor('', { select: List(['Id']), expands: List([mk_rel_query_descriptor('rel', { select: List(['Id', 'Name']) })]) }))).toBe('?$expand=rel($select=Id,Name)&$select=Id'))
  test('select Id and expand "rel" with Id and orderby Name', () => expect(mk_query_string(mk_query_descriptor('', { select: List(['Id']), expands: List([mk_rel_query_descriptor('rel', { select: List(['Id']), orderby: List(['Name']) })]) }))).toBe('?$expand=rel($orderby=Name;$select=Id)&$select=Id'))
})