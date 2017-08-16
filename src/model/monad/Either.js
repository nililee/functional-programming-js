/**
 * 본문에서 사용한 Either 모나드의 ES6 버전
 * 저자: 루이스 아텐시오
 */
exports.Either = class Either {
    constructor(value) {
        this._value = value;
    }

    get value() {
        return this._value;
    }

    static left(a) {
        return new exports.Left(a);
    }

    static right(a) {
        return new exports.Right(a);
    }

    static fromNullable(val) {
        return val !== null && val !== undefined ? Either.right(val) : Either.left(val);
    }

    static of(a){
        return Either.right(a);
    }
};

exports.Left = class Left extends exports.Either {

    map(_) {
        return this; // 쓰지 않음
    }

    get value() {
        throw new TypeError("Left(a) 값을 가져올 수 없습니다.");
    }

    getOrElse(other) {
        return other;
    }

    orElse(f) {
        return f(this._value);
    }

    chain(f) {
        return this;
    }

    getOrElseThrow(a) {
        throw new Error(a);
    }

    filter(f) {
        return this;
    }

    get isRight() {
        return false;
    }

    get isLeft() {
        return true;
    }

    toString() {
        return `Either.Left(${this._value})`;
    }
};

exports.Right = class Right extends exports.Either {

    map(f) {
        return exports.Either.of(f(this._value));
    }

    getOrElse(other) {
        return this._value;
    }

    orElse() {
        return this;
    }

    chain(f) {
        return f(this._value);
    }

    getOrElseThrow(_) {
        return this._value;
    }

    filter(f) {
        return exports.Either.fromNullable(f(this._value) ? this._value : null);
    }

    get isRight() {
        return true;
    }

    get isLeft() {
        return false;
    }

    toString() {
        return `Either.Right(${this._value})`;
    }
};
