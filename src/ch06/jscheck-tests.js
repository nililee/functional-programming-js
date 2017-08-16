/**
  6장 모의 객체 예제 코드. 이 코드는 실제 단위 테스트가 아니라 JSCheck 테스트입니다.
  테스트 실행 프레임워크는 QUnit을 씁니다.
  저자: 루이스 아텐시오
*/
"use strict";

const R = require('ramda');
const JSC = require('jscheck');
const Either = require('../model/monad/Either.js').Either;

QUnit.test('JSCheck 실행', function (assert) {

    // 테스트 대상 함수
    const fork = (join, func1, func2) => (val) => join(func1(val), func2(val));

    const toLetterGrade = (grade) => {
            if (grade >= 90) return 'A';
            if (grade >= 80) return 'B';
            if (grade >= 70) return 'C';
            if (grade >= 60) return 'D';
            return 'F';
        };

    const computeAverageGrade =
        R.compose(toLetterGrade, fork(R.divide, R.sum, R.length));


    JSC.clear();
    JSC.on_report((str) => console.log(str));
    JSC.test(
        '평균 학점 계산',
        function (verdict, grades, grade) {
            return verdict(computeAverageGrade(grades) === grade);
        },
        [
            JSC.array(JSC.integer(20), JSC.number(90,100)),
            'A'
        ],
        function (grades, grade) {
            return '평균 ' + grade + ' 학점에 관한 테스트: ' + grades;
        }
    );
    expect(0);
});

/**
* 올바른 SSN 문자열(대시 포함)을 생성한다
* @param param1 지역 번호 -> JSC.integer(100, 999)
* @param param2 그룹 번호 -> JSC.integer(10, 99)
* @param param3 일련 번호 -> JSC.integer(1000,9999)
* @returns {Function} 특정자 함수
*/
JSC.SSN = function (param1, param2, param3) {
    return function generator() {
        const part1 = typeof param1 === 'function' ? param1() : param1;
        const part2 = typeof param2 === 'function' ? param2() : param2;
        const part3 = typeof param3 === 'function' ? param3() : param3;
        return [part1 , part2, part3].join('-');
    };
};

QUnit.test('SSN에 대한 JSCheck 커스텀 특정자', function (assert) {

    // 테스트 대상 함수
    const validLength = (len, str) => str.length === len;

    const find = R.curry((db, id) => db.find(id));

    const checkLengthSsn = ssn => {
        return Either.of(ssn)
            .filter(R.partial(validLength, [11]))
            .isRight;
    };

    JSC.clear();

    JSC.on_report((report) => console.log('리포트' + str));

    JSC.on_pass((object) => assert.ok(object.pass));

    JSC.on_fail((object) =>
        assert.ok(object.pass || object.args.length === 11, '테스트 실패: ' + object.args));

    JSC.test(
        'SSN 길이를 체크',
        function (verdict, ssn) {
            return verdict(checkLengthSsn(ssn));
        },
        [
            JSC.SSN(JSC.integer(100, 999), JSC.integer(10, 99),
            JSC.integer(1000, 9999))
        ],
        function (ssn) {
            return '커스텀 SSN 테스트: ' + ssn;
        }
    );

    expect(0);
});
