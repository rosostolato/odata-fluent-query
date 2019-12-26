import { ODataQuery } from '../src/odataquery';
import { User } from '../models';

describe('testing ODataQuery filter', () => {

  ///////////
  // simple

  test('contains', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter(q => q.mail.contains('test')).toString();
    const expected = "$filter=contains(mail, 'test')";
    expect(actual).toBe(expected);
  });

  test('containsCaseInsensitive', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter(q => q.mail.containsCaseInsensitive('test')).toString();
    const expected = "$filter=contains(tolower(mail), 'test')";
    expect(actual).toBe(expected);
  });

  test('endsWith', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter(q => q.mail.endsWith('test')).toString();
    const expected = "$filter=endswith(mail, 'test')";
    expect(actual).toBe(expected);
  });

  test('endsWithCaseInsensitive', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter(q => q.mail.endsWithCaseInsensitive('test')).toString();
    const expected = "$filter=endswith(tolower(mail), 'test')";
    expect(actual).toBe(expected);
  });

  test('equals', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter(q => q.mail.equals('test')).toString();
    const expected = "$filter=mail eq 'test'";
    expect(actual).toBe(expected);
  });

  test('equalsCaseInsensitive', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter(q => q.mail.equalsCaseInsensitive('test')).toString();
    const expected = "$filter=tolower(mail) eq 'test'";
    expect(actual).toBe(expected);
  });

  test('notEquals', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter(q => q.mail.notEquals('test')).toString();
    const expected = "$filter=mail ne 'test'";
    expect(actual).toBe(expected);
  });

  test('notEqualsCaseInsensitive', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter(q => q.mail.notEqualsCaseInsensitive('test')).toString();
    const expected = "$filter=tolower(mail) ne 'test'";
    expect(actual).toBe(expected);
  });

  test('notNull', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter(q => q.mail.notNull()).toString();
    const expected = "$filter=mail ne null";
    expect(actual).toBe(expected);
  });

  test('startsWith', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter(q => q.mail.startsWith('test')).toString();
    const expected = "$filter=startswith(mail, 'test')";
    expect(actual).toBe(expected);
  });

  test('startsWithCaseInsensitive', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter(q => q.mail.startsWithCaseInsensitive('test')).toString();
    const expected = "$filter=startswith(tolower(mail), 'test')";
    expect(actual).toBe(expected);
  });
  
  /////////
  // composed

  test('and [inline]', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter(q =>
      q.mail.startsWith('a')
      .and(q.mail.contains('o'))
      .and(q.mail.endsWith('z'))
    ).toString();

    const expected = "$filter=startswith(mail, 'a') and contains(mail, 'o') and endswith(mail, 'z')";
    expect(actual).toBe(expected);
  });

  test('and [multilines]', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter(q => q.mail.startsWith('a'))
      .filter(q => q.mail.contains('o'))
      .filter(q => q.mail.endsWith('z'))
      .toString();

    const expected = "$filter=startswith(mail, 'a') and contains(mail, 'o') and endswith(mail, 'z')";
    expect(actual).toBe(expected);
  });

  test('or', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter(q => q.mail
      .startsWith('a').or(q.mail.contains('o')).or(q.mail.endsWith('z'))
    ).toString();

    const expected = "$filter=startswith(mail, 'a') or contains(mail, 'o') or endswith(mail, 'z')";
    expect(actual).toBe(expected);
  });

  test('or with and [inline]', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter(q => 
        q.givenName.startsWith('search').and(
          q.surname.startsWith('search')
          .or(q.mail.startsWith('search'))
        ))
      .toString();

    const expected = "$filter=startswith(givenName, 'search') and (startswith(surname, 'search') or startswith(mail, 'search'))";
    expect(actual).toBe(expected);
  });

  test('or with and [multilines]', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter(q => 
        q.givenName.startsWith('search')
        .or(q.surname.startsWith('search'))
        .or(q.mail.startsWith('search')))
      .filter(q => q.accountEnabled.equals(true))
      .toString();

    const expected = "$filter=(startswith(givenName, 'search') or startswith(surname, 'search') or startswith(mail, 'search')) and accountEnabled eq true";
    expect(actual).toBe(expected);
  });

  test('not', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter(q =>q.mail
      .startsWith('a')
      .or(q.mail.startsWith('b'))
      .not()
    ).toString();

    const expected = "$filter=not (startswith(mail, 'a') or startswith(mail, 'b'))";
    expect(actual).toBe(expected);
  });

});
