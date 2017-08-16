/**
 * 1장 예제 코드
 * 저자: 루이스 아텐시오
 */

"use strict";

const R = require('ramda');
const _ = require('lodash');
const assert = QUnit.assert;

// 버전 출력
console.log('로대쉬JS 버전: ' + _.VERSION);

QUnit.module('1장');

// 1장에서는 합성 개념을 공부하기 전, 준비 운동을 합니다.
// 합성 함수는 "run"이라는 별칭으로 나타냅니다.
const run = R.compose;

QUnit.test("코드 1.1 함수형 printMessage", function () {
    // 책 본문에서는 DOM에 출력하지만, 여기서는 노드 콘솔에 출력합니다.
    // 어차피 의미는 같습니다.

    const printToConsole = str => {
        console.log(str);
        return str;
    };
    const toUpperCase = str => str.toUpperCase();
    const echo = R.identity;

    const printMessage = run(printToConsole, toUpperCase, echo);
    assert.equal(printMessage('Hello World'), 'HELLO WORLD');
});

QUnit.test("코드 1.2 printMessage를 확장", function () {
    // 책 본문에서는 DOM에 출력하지만, 여기서는 노드 콘솔에 출력합니다.
    // 어차피 의미는 같습니다.

    const printToConsole = str => {
        console.log(str);
        return str;
    };
    const toUpperCase = str => str.toUpperCase();
    const echo = R.identity;

    const repeat = (times) => {
        return function (str = '') {
            let tokens = [];
            for(let i = 0; i < times; i++) {
                tokens.push(str);
            }
            return tokens.join(' ');
        };
    };

    const printMessage = run(printToConsole, repeat(3), toUpperCase, echo);
    assert.equal(printMessage('Hello World'), 'HELLO WORLD HELLO WORLD HELLO WORLD');
});

QUnit.test("코드 1.3 부수효과를 일으키는 명령형 showStudent 함수", function () {
    // 본문 1장에서는 모의 저장 객체를 사용합니다.
    const db = require('./helper').db;

    function showStudent(ssn) {
        let student = db.find(ssn);
        if(student !== null) {
            let studentInfo = `<p>${student.ssn},${student.firstname},${student.lastname}</p>`;
            console.log(studentInfo);
            return studentInfo;
        }
        else {
            throw new Error('학생을 찾을 수 없습니다!');
        }
    }

    assert.equal(showStudent('444-44-4444'), '<p>444-44-4444,Alonzo,Church</p>');
});

// 커리 함수의 별칭
const curry = R.curry;

QUnit.test("코드 1.4 showStudent 프로그램을 분해", function () {
    // 본문 1장에서는 모의 저장 객체를 사용합니다.
    // DOM 대신 콘솔에 붙입니다.

    const db = require('./helper').db;

    const find = curry((db, id) => {
        let obj = db.find(id);
        if(obj === null) {
            throw new Error('객체를 찾을 수 없습니다!');
        }
        return obj;
    });

    const csv = student => `${student.ssn}, ${student.firstname}, ${student.lastname}`;

    const append = curry((source, info) => {
        source(info);
        return info;
    });

    const showStudent = run(
        append(console.log),
        csv,
        find(db)
    );

    assert.equal(showStudent('444-44-4444'), '444-44-4444, Alonzo, Church');
});

QUnit.test("코드 1.5 함수 체인으로 프로그래밍", function () {
    // 세 학생의 수강 등록 데이터가 담긴 배열
    const enrollments = [
        {
            enrolled: 3,  // 3 강좌를 등록하고 평균 90점을 받은 학생
            grade: 90
        },
        {
            enrolled: 1,  // 1 강좌를 등록하고 평균 100점을 받은 학생
            grade: 100
        },
        {
            enrolled: 1,  // 1 강좌를 등록하고 평균 87점을 받은 학생
            grade: 87
        },
    ];

    const result =
        _.chain(enrollments)
         .filter(student => student.enrolled > 1)
         .map(_.property('grade'))
         .mean()
         .value();

    console.log(result);

    assert.equal(result, 90);
});