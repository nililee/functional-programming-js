/**
 * 2장 예제 코드
 * 저자: 루이스 아텐시오
 */

"use strict";

QUnit.module('2장');

const R = require('ramda');
const assert = QUnit.assert;

const ValueObjects = require('../model/value_objects.js');
const zipCode = ValueObjects.zipCode;
const coordinate = ValueObjects.coordinate;

const Student = require('../model/Student.js').Student;
const Address = require('../model/Address.js').Address;

QUnit.test("불변 값 객체 갖고 놀기", function () {

    let princetonZip = zipCode('08544', '3345');
    assert.equal(princetonZip.toString(), '08544-3345');

    let greenwich = coordinate(51.4778, 0.0015);
    assert.equal(greenwich.toString(), '(51.4778,0.0015)');

    let newCoord = greenwich.translate(10, 10).toString();
    assert.equal(newCoord.toString(), '(61.4778,10.0015)');
});

QUnit.test("객체를 깊이 동결", function () {
    const deepFreeze = require('./helper').deepFreeze;
    let address = new Address('US');
    let student = new Student('444-44-4444', 'Joe', 'Smith',
        'Harvard', 1960, address);
    let frozenStudent = deepFreeze(student);

    assert.throws(() => {
        frozenStudent.firstname = 'Emmet'; // 예상 결과: '#<Student>' 객체의
                                           // 읽기 전용 속성 '_firstname'에 값을 할당할 수 없음.
    }, TypeError);

    assert.throws(() => {
        frozenStudent.address.country = 'Canada'; // 예상 결과: '#<Address>' 객체의
                                                  // 읽기 전용 속성 '_country'에 값을 할당할 수 없음.
    }, TypeError);
});

QUnit.test("렌즈 갖고 놀기", function () {
    let z = zipCode('08544','1234');
    let address = new Address('US', 'NJ', 'Princeton', z, 'Alexander St.');
    let student = new Student('444-44-4444', 'Joe', 'Smith',
        'Princeton University', 1960, address);

    let zipPath = ['address', 'zip'];
    var zipLens = R.lensPath(zipPath);
    assert.deepEqual(R.view(zipLens, student), z);

    let beverlyHills = zipCode('90210', '5678');
    let newStudent = R.set(zipLens, beverlyHills, student);
    assert.deepEqual(R.view(zipLens, newStudent).code(), beverlyHills.code());
    assert.deepEqual(R.view(zipLens, student), z);
    assert.ok(newStudent !== student);
});

QUnit.test("부정 함수", function () {
    function negate(func) {
        return function() {
            return !func.apply(null, arguments);
        };
    }

    function isNull(val) {
        return val === null;
    }

    let isNotNull = negate(isNull);
    assert.ok(!isNotNull(null)); // -> false
    assert.ok(isNotNull({}));    // -> true
});

QUnit.test("불변 세터", function () {
    class Address {
      constructor(street) {
        this.street = street;
      }
    }

    class Person {
      constructor(name, address) {
        this.name = name;
        this.address = address;
      }
    }

    const person = new Person('John Doe', new Address('100 Main Street'));
    // { name: 'John Doe', address: Address { street: '100 Main Street' } }

    const streetLens = R.lens(R.path(['address', 'street']), R.assocPath(['address', 'street']));

    const newPerson = R.set(streetLens, '200 Broadway Street', person);
    // { name: 'John Doe', address: { street: '200 Broadway Street' } }

    assert.ok(person instanceof Person);       // true
    assert.ok(!(newPerson instanceof Person)); // false
    assert.ok(newPerson instanceof Object)     // true
});