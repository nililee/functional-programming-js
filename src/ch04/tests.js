/**
  * 4장 예제 코드
  * 저자: 루이스 아텐시오
  */
"use strict";

QUnit.module('4장');

const _ = require('lodash');
const R = require('ramda');
const assert = QUnit.assert;

// 모든 예제 코드가 공통으로 사용하는 함수
const isEmpty = s => !s || !s.trim();
const isValid = val => !_.isUndefined(val) && !_.isNull(val);
const trim = (str) => str.replace(/^\s*|\s*$/g, '');
const normalize = (str) => str.replace(/\-/g, '');

QUnit.test("메서드 체이닝", function () {

    let names = ['alonzo church', 'Haskell curry', 'stephen_kleene',
                 'John Von Neumann', 'stephen_kleene'];

    let result = _.chain(names)
        .filter(isValid)
        .map(s => s.replace(/_/, ' '))
        .uniq()
        .map(_.startCase)
        .sort()
        .value();

    assert.deepEqual(result, [ 'Alonzo Church', 'Haskell Curry', 'John Von Neumann', 'Stephen Kleene' ]);
});

QUnit.test("타입 체크 테스트", function () {

    const checkType = require('./helper').checkType;
    assert.equal(checkType(String)('Curry'), 'Curry');
    assert.equal(checkType(Number)(3), 3);
    assert.equal(checkType(Number)(3.5), 3.5);
    let now = new Date();
    assert.equal(checkType(Date)(now), now);
    assert.deepEqual(checkType(Object)({}), {});
    assert.throws(() => {
        checkType(String)(42)
    }, TypeError);
});

QUnit.test("튜플 테스트", function () {

    const Tuple = require('./helper').Tuple;
    const StringPair = Tuple(String, String);
    const name = new StringPair('Barkley', 'Rosser');
    let [first, last] = name.values();
    assert.equal(first, 'Barkley');
    assert.equal(last, 'Rosser');
    assert.throws(() => {
        const fullname = new StringPair('J', 'Barkley', 'Rosser');
    }, TypeError);
});

QUnit.test("언어의 핵심 요소를 확장", function () {

    // 처음 N개 문자를 얻습니다.
    String.prototype.first = _.partial(String.prototype.substring, 0, _);
    let result = 'Functional Programming'.first(3); // -> 'Fun'
    assert.equal(result, 'Fun');

    // 성명을 '성, 이름' 형식으로 바꿉니다.
    String.prototype.asName = _.partial(String.prototype.replace, /(\w+)\s(\w+)/, '$2, $1');
    result = 'Alonzo Church'.asName(); //-> 'Church, Alonzo'
    assert.equal(result, 'Church, Alonzo');

    // 문자열을 배열로 변환합니다.
    String.prototype.explode = _.partial(String.prototype.match, /[\w]/gi);
    result = 'ABC'.explode(); //-> ['A', 'B', 'C']
    assert.deepEqual(result, ['A', 'B', 'C']);

    // 단순 URL을 파싱합니다.
    String.prototype.parseUrl = _.partial(String.prototype.match, /(http[s]?|ftp):\/\/([^:\/\s]+)\.([^:\/\s]{2,5})/);
    result = 'http://example.com'.parseUrl(); // -> ['http://example.com', 'http', 'example', 'com']
    assert.deepEqual(result, ['http://example.com', 'http', 'example', 'com']);
});


QUnit.test("합성", function () {
    const str = `We can only see a short distance ahead but we can see plenty there that needs to be done`;
    const explode = (str) => str.split(/\s+/);
    const count = (arr) => arr.length;
    const countWords = R.compose(count, explode);
    assert.equal(countWords(str), 19); //-> 19
});


QUnit.test("추가 합성", function () {
    const trim = (str) => str.replace(/^\s*|\s*$/g, '');
    const normalize = (str) => str.replace(/\-/g, '');
    const validLength = (param, str) => str.length === param;
    const checkLengthSsn = _.partial(validLength, 9);

    const cleanInput = R.compose(normalize, trim);
    const isValidSsn = R.compose(checkLengthSsn, cleanInput);

    let result = cleanInput(' 444-44-4444 '); //-> '444444444'
    assert.equal(result, '444444444');

    result = isValidSsn(' 444-44-4444 '); //-> true
    assert.ok(result);
});


QUnit.test("함수형 라이브러리와 합성", function () {
    // 주어진 데이터:
    let students = ['Rosser', 'Turing', 'Kleene', 'Church'];
    let grades = [80, 100, 90, 99];

    const smartestStudent = R.compose(
        R.head,
        R.pluck(0),
        R.reverse,
        R.sortBy(R.prop(1)),
        R.zip);

    let result = smartestStudent(students, grades); //-> 'Turing'
    assert.equal(result, 'Turing');
});

QUnit.test("무인수 함수로 합성", function () {
    // 주어진 데이터:
    let students = ['Rosser', 'Turing', 'Kleene', 'Church'];
    let grades = [80, 100, 90, 99];

    const first = R.head;
    const getName = R.pluck(0);
    const reverse = R.reverse;
    const sortByGrade = R.sortBy(R.prop(1));
    const combine = R.zip;
    let result = R.compose(first, getName, reverse, sortByGrade, combine);
    assert.equal(result(students, grades), 'Turing');
});


QUnit.test("학생 프로그램을 커링과 합성으로 표현", function () {

    // 1장의 모의 데이터를 재활용
    const db = require('../ch01/helper').db;

    const find = R.curry((db, id) => db.find(id));

    // findObject :: DB -> String -> Object
    const findObject = R.curry(function (db, id) {
        const obj = find(db, id);
        if(obj === null) {
            throw new Error(`ID가 [${id}]인 객체는 없습니다`);
        }
        return obj;
    });

    // findStudent :: String -> Student
    const findStudent = findObject(db);

    const csv = ({ssn, firstname, lastname}) => `${ssn}, ${firstname}, ${lastname}`;

    // append :: String -> String -> String
    const append = R.curry(function (elementId, info) {
        console.log(info);
        return info;
    });

    // showStudent :: String -> Integer
    const showStudent = R.compose(
        append('#student-info'),
        csv,
        findStudent,
        normalize,
        trim);

    let result = showStudent('44444-4444'); //-> 444-44-4444, Alonzo, Church
    assert.equal(result, '444-44-4444, Alonzo, Church');
});


QUnit.test("무인수 코딩", function () {
    const runProgram = R.pipe(
        R.map(R.toLower),
        R.uniq,
        R.sortBy(R.identity));

    let result = runProgram(['Functional', 'Programming', 'Curry', 'Memoization', 'Partial', 'Curry', 'Programming']);
    assert.deepEqual(result, ['curry', 'functional', 'memoization', 'partial', 'programming']);
    //-> [curry, functional, memoization, partial, programming]
});