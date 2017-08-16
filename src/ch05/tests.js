/**
 * 5장 예제 코드
 * 저자: 루이스 아텐시오
 */

"use strict";

QUnit.module('5장');
const assert = QUnit.assert;

// 5장에서 사용한 함수형 라이브러리
const _ = require('lodash');
const R = require('ramda');

// 모나드/함수자
const Wrapper = require('../model/Wrapper.js').Wrapper;
const wrap = require('../model/Wrapper.js').wrap;
const empty = require('../model/Empty.js').empty;
const Maybe = require('../model/monad/Maybe.js').Maybe;
const Either = require('../model/monad/Either.js').Either;
const IO = require('../model/monad/IO.js').IO;

// 모델
const Student = require('../model/Student.js').Student;
const Address = require('../model/Address.js').Address;
const Person = require('../model/Person.js').Person;

QUnit.test("단순 래퍼 테스트", function () {
    const wrappedValue = wrap('Get Functional');
    assert.equal(wrappedValue.map(R.identity), 'Get Functional'); // -> 'Get Functional'
});

QUnit.test("단순 함수자 테스트", function () {
    const plus = R.curry((a, b) => a + b);
    const plus3 = plus(3);
    const plus10 = plus(10);
    const two = wrap(2);
    const five = two.fmap(plus3); // -> Wrapper(5)
    assert.equal(five.map(R.identity), 5); // -> 5

    assert.equal(two.fmap(plus3).fmap(plus10).map(R.identity), 15); // -> Wrapper(15)
});

QUnit.test("래퍼를 이용한 find", function () {
    // 1장의 도우미 DB를 재활용
    const db = require('../ch01/helper').db;

    const find = R.curry((db, id) => db.find(id));

    const findStudent = R.curry((db, ssn) => {
        return wrap(find(db, ssn));
    });

    const getFirstName = (student) => {
        return wrap(student.fmap(R.prop('firstname')));
    };

    const studentFirstName = R.compose(
        getFirstName,
        findStudent(db)
    );

    assert.deepEqual(studentFirstName('444-44-4444'), wrap(wrap('Alonzo')));
});

QUnit.test("단순 빈 컨테이너", function () {
    const isEven = (n) => Number.isFinite(n) && (n % 2 == 0);
    const half = (val) => isEven(val) ? wrap(val / 2) : empty();
    assert.deepEqual(half(4), wrap(2)); // -> Wrapper(2)
    assert.deepEqual(half(3), empty()); // -> Empty
});


QUnit.test("단순 빈 컨테이너", function () {
    const WrapperMonad = require('../model/monad/Wrapper.js').Wrapper;

    let result = WrapperMonad.of('Hello Monads!')
        .map(R.toUpper)
        .map(R.identity); // -> Wrapper('HELLO MONADS!')

     assert.deepEqual(result, new WrapperMonad('HELLO MONADS!'));
});

QUnit.test("단순 Maybe 테스트", function () {
    let result = Maybe.of('Hello Maybe!').map(R.toUpper);
    assert.deepEqual(result, Maybe.of('HELLO MAYBE!'));

    const Nothing = require('../model/monad/Maybe.js').Nothing;
    result = Maybe.fromNullable(null);
    assert.deepEqual(result, new Nothing(null));
});

QUnit.test("Maybe로 객체 그래프에서 중첩된 속성을 추출", function () {

    let address = new Address('US');
    let student = new Student('444-44-4444', 'Joe', 'Smith',
        'Harvard', 1960, address);

    const getCountry = (student) => student
        .map(R.prop('address'))
        .map(R.prop('country'))
        .getOrElse('존재하지 않는 국가입니다!');

    assert.equal(getCountry(Maybe.fromNullable(student)), address.country);
});

QUnit.test("Maybe로 객체 그래프에서 빠진 중첩된 속성을 추출", function () {

    let student = new Student('444-44-4444', 'Joe', 'Smith',
        'Harvard', 1960, null);

    const getCountry = (student) => student
        .map(R.prop('address'))
        .map(R.prop('country'))
        .getOrElse('존재하지 않는 국가입니다!');

    assert.equal(getCountry(Maybe.fromNullable(student)), '존재하지 않는 국가입니다!');
});

QUnit.test("단순 Either 모나드 테스트", function () {

    // 1장의 도우미 DB를 재활용
    const db = require('../ch01/helper').db;

    const find = R.curry((db, id) => db.find(id));

    const Left = require('../model/monad/Either.js').Left;

    const safeFindObject = R.curry(function (db, id) {
        const obj = find(db, id);
        if(obj) {
            return Either.of(obj);
        }
        return Either.left(`ID가 ${id}인 객체를 찾을 수 없습니다`);
    });

    const findStudent = safeFindObject(db);
    let result = findStudent('444-44-4444').getOrElse(new Student());
    assert.deepEqual(result, new Person('444-44-4444', 'Alonzo', 'Church'));

    result = findStudent('xxx-xx-xxxx');
    assert.deepEqual(result, Either.left(`ID가 xxx-xx-xxxx인 객체를 찾을 수 없습니다`));

    assert.throws(() => {
        console.log(result.value);
    }, TypeError);
});

// 요 다음 단위 테스트에서 사용하는 공통 코드

// 1장의 도우미 DB를 재활용
const db = require('../ch01/helper').db;

// validLength :: Number, String -> Boolean
const validLength = (len, str) => str.length === len;

const find = R.curry((db, id) => db.find(id));

// safeFindObject :: Store, string -> Either(Object)
const safeFindObject = R.curry((db, id) => {
    const val = find(db, id);
    return val ? Either.right(val) : Either.left(`ID가 ${id}인 객체를 찾을 수 없습니다`);
});

// checkLengthSsn :: String -> Either(String)
const checkLengthSsn = ssn =>
    validLength(9,ssn) ? Either.right(ssn): Either.left('잘못된 SSN입니다.');

// finStudent :: String -> Either(Student)
const findStudent = safeFindObject(db);

// csv :: Array => String
const csv = arr => arr.join(',');

const trim = (str) => str.replace(/^\s*|\s*$/g, '');
const normalize = (str) => str.replace(/\-/g, '');
const cleanInput = R.compose(normalize, trim);

QUnit.test("Either로 학생 정보를 표시", function () {

    const showStudent = (ssn) =>
        Maybe.fromNullable(ssn)
             .map(cleanInput)
             .chain(checkLengthSsn)
             .chain(findStudent)
             .map(R.props(['ssn', 'firstname', 'lastname']))
             .map(csv)
             .map(R.tap(console.log));  // -> R.tab으로 부수효과를 시뮬레이션
                                        // (본문에서는 DOM에 출력)

    let result = showStudent('444-44-4444').getOrElse('학생을 찾을 수 없습니다!')
    assert.equal(result, '444-44-4444,Alonzo,Church');

    result = showStudent('xxx-xx-xxxx').getOrElse('학생을 찾을 수 없습니다!');
    assert.equal(result, '학생을 찾을 수 없습니다!');
});

QUnit.test("모나드는 프로그래밍 가능한 콤마", function () {

    // map :: (ObjectA -> ObjectB), Monad -> Monad[ObjectB]
    const map = R.curry((f, container) => container.map(f));
    // chain :: (ObjectA -> ObjectB), M -> ObjectB
    const chain = R.curry((f, container) => container.chain(f));

    const lift = R.curry((f, obj) => Maybe.fromNullable(f(obj)));

    const trace = R.curry((msg, obj) => console.log(msg));

    const showStudent = R.compose(
        R.tap(trace('학생 정보를 콘솔에 출력')),
        map(R.tap(console.log)), // -> R.tab으로 부수효과를 시뮬레이션
                                 // (본문에서는 DOM에 출력)

        R.tap(trace('학생 정보를 CSV 형식으로 변환')),
        map(csv),

        map(R.props(['ssn', 'firstname', 'lastname'])),

        R.tap(trace('레코드 조회 성공!')),
        chain(findStudent),

        R.tap(trace('입력값이 정상입니다.')),
        chain(checkLengthSsn),
        lift(cleanInput)
        );

    let result = showStudent('444-44-4444').getOrElse('학생을 찾을 수 없습니다!');
    assert.equal(result, '444-44-4444,Alonzo,Church');
});


QUnit.test("showStudent 프로그램 완성본", function () {

    // map :: (ObjectA -> ObjectB), Monad -> Monad[ObjectB]
    const map = R.curry((f, container) => container.map(f));
    // chain :: (ObjectA -> ObjectB), M -> ObjectB
    const chain = R.curry((f, container) => container.chain(f));

    const lift = R.curry((f, obj) => Maybe.fromNullable(f(obj)));

    const liftIO = function (val) {
        return IO.of(val);
    };

    // 단위 테스트할 때에는 R.tap으로 대체 가능
    const append = R.curry(function (elementId, info) {
        console.log('시뮬레이션 효과. 추가: ' + info)
        return info;
    });

    const getOrElse = R.curry((message, container) => container.getOrElse(message));

    const showStudent = R.compose(
        map(append('#student-info')),
        liftIO,
        getOrElse('학생을 찾을 수 없습니다!'),
        map(csv),
        map(R.props(['ssn', 'firstname', 'lastname'])),
        chain(findStudent),
        chain(checkLengthSsn),
        lift(cleanInput)
    );

    let result = showStudent('444-44-4444').run();
    assert.equal(result, '444-44-4444,Alonzo,Church');

    let result2 = showStudent('xxx-xx-xxxx').run();
    assert.equal(result2, '학생을 찾을 수 없습니다!');
});