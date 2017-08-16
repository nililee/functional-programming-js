/**
 * Person에서 파생된 Student 타입
 * 저자: 루이스 아텐시오
 */
const Person = require('./Person.js').Person;

exports.Student = class Student extends Person {
    constructor(ssn, firstname, lastname, school, birthYear = null, address = null) {
        super(ssn, firstname, lastname, birthYear, address);
        this._school = school;
    }

    get school() {
        return this._school;
    }
};