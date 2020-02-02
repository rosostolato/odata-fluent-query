import { get_property_keys } from "../src/odataquery";

describe('testing get_property_keys function', () => {
  let any: any;
  let exp: any;
  let expected: any;

  test("get key in function call", () => {
    exp = x => x.id;
    expected = get_property_keys(exp);
    return expect(expected).toStrictEqual(['id']);
  });

  test("get key in function call", () => {
    exp = (x: any) => x.id;
    expected = get_property_keys(exp);
    return expect(expected).toStrictEqual(['id']);
  });

  test("get key in function call", () => {
    exp = _x => _x.id;
    expected = get_property_keys(exp);
    return expect(expected).toStrictEqual(['id']);
  });

  test("get key in function call", () => {
    exp = x => x.id.biggerThan(5);
    expected = get_property_keys(exp);
    return expect(expected).toStrictEqual(['id']);
  });

  test("get key in function call", () => {
    exp = x=>x.id.biggerThan(5);
    expected = get_property_keys(exp);
    return expect(expected).toStrictEqual(['id']);
  });

  test("get key in function call", () => {
    exp = test => any.user.address.code.biggerThan(5);
    expected = get_property_keys(exp);
    return expect(expected).toStrictEqual(['user.address.code']);
  });

  test("get key in function call", () => {
    exp = (x, y) => x.id.biggerThan(5);
    expected = get_property_keys(exp);
    return expect(expected).toStrictEqual(['id']);
  });

  test("get key in function call", () => {
    exp = x => { return    x.id.biggerThan(5); };
    expected = get_property_keys(exp);
    return expect(expected).toStrictEqual(['id']);
  });

  test("get key in function call", () => {
    exp = (x, y) => { y = any.description; return x.id.biggerThan(y); }
    expected = get_property_keys(exp as any);
    return expect(expected).toStrictEqual(['id']);
  })

  test("get key in function call", () => {
    exp = function (x) { return x.id.biggerThan(5); };
    expected = get_property_keys(exp);
    return expect(expected).toStrictEqual(['id']);
  });

  test("get key in function call", () => {
    exp = function test(x) { return x.id.biggerThan(5); };
    expected = get_property_keys(exp);
    return expect(expected).toStrictEqual(['id']);
  });

  test("get key in function call", () => {
    exp = function(x) { return x.id.biggerThan(5); };
    expected = get_property_keys(exp);
    return expect(expected).toStrictEqual(['id']);
  });

  test("get key in function call", () => {
    exp = function(x){ return x.id.biggerThan(5); };
    expected = get_property_keys(exp);
    return expect(expected).toStrictEqual(['id']);
  });

  test("get key in function call", () => {
    exp = function (x, y) { return x.id.biggerThan(5); }
    expected = get_property_keys(exp);
    return expect(expected).toStrictEqual(['id']);
  })

  test("get key in function call", () => {
    exp = x => x.id.biggerThan(5).and(x.mail.equals('mail@m.com'));
    expected = get_property_keys(exp);
    return expect(expected).toStrictEqual(['id', 'mail']);
  });

  test("get key in function call", () => {
    exp = function(x) { return x.id.biggerThan(5).and(x.mail.equals('mail@m.com')); };
    expected = get_property_keys(exp);
    return expect(expected).toStrictEqual(['id', 'mail']);
  });
});
