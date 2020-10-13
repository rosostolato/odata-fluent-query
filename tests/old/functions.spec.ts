// import { get_property_keys } from '../src/utils';

// describe('testing get_property_keys function', () => {
//   let any: any;
//   let exp: any;
//   let expected: any;

//   test("get key in function call 01", () => {
//     exp = x => x.id;
//     expected = get_property_keys(exp);
//     return expect(expected).toStrictEqual(['id']);
//   });

//   test("get key in function call 02", () => {
//     exp = (x: any) => x.id;
//     expected = get_property_keys(exp);
//     return expect(expected).toStrictEqual(['id']);
//   });

//   test("get key in function call 03", () => {
//     exp = _x => _x.id;
//     expected = get_property_keys(exp);
//     return expect(expected).toStrictEqual(['id']);
//   });

//   test("get key in function call 04", () => {
//     exp = x => x.id.biggerThan(5);
//     expected = get_property_keys(exp);
//     return expect(expected).toStrictEqual(['id']);
//   });

//   test("get key in function call 05", () => {
//     exp = x=>x.id.biggerThan(5);
//     expected = get_property_keys(exp);
//     return expect(expected).toStrictEqual(['id']);
//   });

//   test("get key in function call 06", () => {
//     exp = test => any.user.address.code.biggerThan(5);
//     expected = get_property_keys(exp);
//     return expect(expected).toStrictEqual(['user.address.code']);
//   });

//   test("get key in function call 07", () => {
//     exp = (x, y) => x.id.biggerThan(5);
//     expected = get_property_keys(exp);
//     return expect(expected).toStrictEqual(['id']);
//   });

//   test("get key in function call 08", () => {
//     exp = x => { return    x.id.biggerThan(5); };
//     expected = get_property_keys(exp);
//     return expect(expected).toStrictEqual(['id']);
//   });

//   test("get key in function call 09", () => {
//     exp = (x, y) => { y = any.description; return x.id.biggerThan(y); }
//     expected = get_property_keys(exp as any);
//     return expect(expected).toStrictEqual(['id']);
//   })

//   test("get key in function call 10", () => {
//     exp = function (x) { return x.id.biggerThan(5); };
//     expected = get_property_keys(exp);
//     return expect(expected).toStrictEqual(['id']);
//   });

//   test("get key in function call 11", () => {
//     exp = function test(x) { return x.id.biggerThan(5); };
//     expected = get_property_keys(exp);
//     return expect(expected).toStrictEqual(['id']);
//   });

//   test("get key in function call 12", () => {
//     exp = function(x) { return x.id.biggerThan(5); };
//     expected = get_property_keys(exp);
//     return expect(expected).toStrictEqual(['id']);
//   });

//   test("get key in function call 13", () => {
//     exp = function(x){ return x.id.biggerThan(5); };
//     expected = get_property_keys(exp);
//     return expect(expected).toStrictEqual(['id']);
//   });

//   test("get key in function call 14", () => {
//     exp = function (x, y) { return x.id.biggerThan(5); }
//     expected = get_property_keys(exp);
//     return expect(expected).toStrictEqual(['id']);
//   })

//   test("get key in function call 15", () => {
//     exp = x => x.id.biggerThan(5).and(x.mail.equals('mail@m.com'));
//     expected = get_property_keys(exp);
//     return expect(expected).toStrictEqual(['id', 'mail']);
//   });

//   test("get key in function call 16", () => {
//     exp = function(x) { return x.id.biggerThan(5).and(x.mail.equals('mail@m.com')); };
//     expected = get_property_keys(exp);
//     return expect(expected).toStrictEqual(['id', 'mail']);
//   });

//   test("get key in function call 17", () => {
//     exp = q => q
//       .givenName.startsWith('test')
//       .or(q.surname.startsWith('test'))
//       .or(q.mail.startsWith('test'));

//     expected = get_property_keys(exp);

//     return expect(expected).toStrictEqual(['givenName', 'surname', 'mail']);
//   });
// });
