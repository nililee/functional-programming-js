/**
 * 주소(Address) 객체
 * 이 책의 학습용 예제를 위한 도메인 모델 객체
 * 저자: 루이스 아텐시오
 */
exports.Address = class Address {

    constructor(country, state = null, city = null, zip = null, street = null) {
        this._country = country;
        this._state = state;
        this._city = city;
        this._zip = zip;
        this._street = street;
    }

    get street() {
        return this._street;
    }

    get city() {
        return this._city;
    }

    get state() {
        return this._state;
    }

    get zip() {
        return this._zip;
    }

    get country() {
        return this._country;
    }

    set country(country) {
        this._country = country;
        return this;
    }
};