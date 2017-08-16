/**
 * 사람(Person) 객체
 * 이 책의 학습용 예제를 위한 도메인 모델 객체
 * 저자: 루이스 아텐시오
 */
exports.Person = class Person {
    constructor(ssn,firstname, lastname, birthYear = null, address = null) {
        this._ssn = ssn;
        this._firstname = firstname;
        this._lastname = lastname;
        this._birthYear = birthYear;
        this._address = address;
    }

    get ssn() {
        return this._ssn;
    }

    get firstname() {
        return this._firstname;
    }

    set firstname(firstname) {
        this._firstname = firstname;
        return this;
    }

    get lastname() {
        return this._lastname;
    }

    get birthYear() {
        return this._birthYear;
    }

    get address() {
        return this._address;
    }

    get fullname() {
        return `${this._firstname} ${this._lastname}`;
    }
};