/**
  6장 모의 객체 예제 코드
  저자: 루이스 아텐시오
*/
"use strict";

const _ = require('lodash');
const R = require('ramda');
const sinon = require('sinon');

const Either = require('../model/monad/Either.js').Either;
const Student = require('../model/Student.js').Student;

const fork = (join, func1, func2) => (val) => join(func1(val), func2(val));

const studentStore = require('../ch01/helper').db;

// 모든 테스트가 공유하는 전역 모의 객체
var mockContext;

QUnit.module('6장 모의 테스트', {
    beforeEach: function() {
        mockContext  = sinon.mock(studentStore);
    },
    afterEach: function() {
        mockContext.verify();
        mockContext.restore();
    }
});

const find = R.curry((db, id) => db.find(id));

const safeFindObject = R.curry(function (db, id) {
    const obj = find(db, id);
    if(obj) {
        return Either.of(obj);
    }
    return Either.left(`ID가 ${id}인 객체를 찾을 수 없습니다`);
});

QUnit.test('showStudent: findStudent는 null을 반환한다', function (assert) {

    mockContext.expects('find').once().returns(null);

    const findStudent = safeFindObject(studentStore);
    assert.ok(findStudent('xxx-xx-xxxx').isLeft);
});

QUnit.test('showStudent: findStudent는 올바른 객체를 반환한다', function (assert) {
    mockContext.expects('find').once().returns (
        new Student('444-44-4444', 'Alonzo', 'Church', 'Princeton')
    );

    const findStudent = safeFindObject(studentStore);
    assert.ok(findStudent('444-44-4444').isRight);
});
