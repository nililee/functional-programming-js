/**
 * 8장 예제 코드 이 장 모든 섹션을 테스트하는 코드입니다.
 * 저자: 루이스 아텐시오
 */

"use strict";

QUnit.module('8장');
const assert = QUnit.assert;

const Student = require('../model/Student.js').Student;
const Address = require('../model/Address.js').Address;
const Person = require('../model/Person.js').Person;

const IO = require('../model/monad/IO.js').IO;

const R = require('ramda');
const Rx = require('rxjs/Rx');

// AJAX 호출을 모방하기 위한 도우미 모의 함수
const getJSON = function (fakeUrl) {
    console.log('이 URL에서 데이터를 조회: ' + fakeUrl);
    return new Promise(function(resolve, reject) {

        // 모의 학생 데이터
        if(fakeUrl.indexOf('students') >= 0) {
            var s1 = new Student('111-11-1111', 'Haskell', 'Curry', 'Princeton', 1900, new Address('US'));
            var s2 = new Student('222-22-2222', 'Barkley', 'Rosser', 'Princeton', 1907, new Address('Greece'));
            var s3 = new Student('333-33-3333', 'John', 'von Neumann', 'Princeton', 1903, new Address('Hungary'));
            var s4 = new Student('444-44-4444', 'Alonzo', 'Church', 'Princeton', 1903, new Address('US'));

            resolve([s2, s3, s4, s1]);
        }
        // 학생별 모의 점수
        else {
            resolve([80, 70, 20, 40, 99, 100]);
        }
    });
};

QUnit.test("제너레이터 1", function (assert) {

    function *addGenerator() {
        var i = 0;
        while (true) {
            i += yield i;
        }
    }
    let adder = addGenerator();
    assert.equal(adder.next().value, 0)
    assert.equal(adder.next(5).value, 5);
});

QUnit.test("제너레이터 2", function (assert) {

    function *range(start, finish) {
        for(let i = start; i < finish; i++) {
            yield i;
        }
    }

    let r = range(0, Number.POSITIVE_INFINITY);
    assert.equal(r.next().value, 0)
    assert.equal(r.next().value, 1);
    assert.equal(r.next().value, 2);
});

QUnit.test("제너레이터 3", function (assert) {
	function range(start, end) {
		return {
			[Symbol.iterator]() {
				return this;
			},

			next() {
				if(start < end) {
					return { value: start++, done:false };
				}
				return { done: true, value:end };
			}
		};
	}

	let res = [];
	for(let num of range(0,5)) {
		console.log(num);
		res.push(num);
	}
	assert.deepEqual(res, [0,1,2,3,4]);
});

QUnit.test("학생 데이터를 비동기 호출하여 조회", function (assert) {

    const fork = (join, func1, func2) => (val) => join(func1(val), func2(val));

    const csv = arr => arr.join(',');

    getJSON('/students')
        .then(R.tap(() => console.log('Hiding spinner')))  // <- 웹사이트 스피너(진행
															// 중임을 나타내는 이미지)를
															// 흉내냄
        .then(R.filter(s => s.address.country === 'US'))
        .then(R.sortBy(R.prop('_ssn')))
        .then(R.map(student => {
            return getJSON('/grades?ssn=' + student.ssn)
                .then(R.compose(Math.ceil, fork(R.divide, R.sum, R.length)))
                .then(grade =>
                    IO.of(R.merge({'_grade': grade}, student))
                        // .map(console.log)
                        .map(R.props(['_ssn', '_firstname', '_lastname', '_grade']))
                        .map(csv)
                        .map(console.log).run())  // <- 결과를 콘솔에 출력
                }))
        .catch(function (error) {
            console.log('에러 발생: ' + error.message);
        });
});

QUnit.test("Rx 테스트", function (assert) {

    let res = [];
    Rx.Observable.range(1, 3)
        .subscribe(
            x => {
                console.log(`다음: ${x}`)
                res.push(x);
            },
            err => console.log(`에러: ${err}`),
            () => console.log('완료')
        );
    assert.deepEqual(res, [1,2,3]);
});

QUnit.test("Rx 테스트 2", function (assert) {

    let res = [];
    Rx.Observable.of(1,2,3,4,5)
        .filter(x => x%2 !== 0)
        .map(x => x * x)
        .subscribe(x => {
            console.log(`다음: ${x}`)
            res.push(x);
        }
    );
    assert.deepEqual(res, [1,9,25]);
});