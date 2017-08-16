/**
 * 본문에서 사용한 커스텀 Maybe 모나드
 * 저자: 루이스 아텐시오
 */
exports.Maybe = class Maybe {
    static just(a) {
        return new exports.Just(a);
    }
    static nothing() {
        return new exports.Nothing();
    }
    static fromNullable(a) {
        return a !== null ? Maybe.just(a) : Maybe.nothing();
    }
    static of(a) {
        return Maybe.just(a);
    }
    get isNothing() {
        return false;
    }
    get isJust() {
        return false;
    }
};


// 값이 있음을 나타내는 파생 클래스 Just
exports.Just = class Just extends exports.Maybe {
    constructor(value) {
        super();
        this._value = value;
    }

    get value() {
        return this._value;
    }

    map(f) {
        return exports.Maybe.fromNullable(f(this._value));
    }

    chain(f) {
        return f(this._value);
    }

    getOrElse() {
        return this._value;
    }

    filter(f) {
        exports.Maybe.fromNullable(f(this._value) ? this._value : null);
    }

    get isJust() {
        return true;
    }

    toString () {
        return `Maybe.Just(${this._value})`;
    }
};

// 값이 없음을 나타내는 파생 클래스 Empty
exports.Nothing = class Nothing extends exports.Maybe {
    map(f) {
        return this;
    }

    chain(f) {
        return this;
    }

    get value() {
        throw new TypeError("Nothing 값을 가져올 수 없습니다.");
    }

    getOrElse(other) {
        return other;
    }

    filter() {
        return this._value;
    }

    get isNothing() {
        return true;
    }

    toString() {
        return 'Maybe.Nothing';
    }
};