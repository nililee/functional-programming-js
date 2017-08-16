/**
 * IO 모나드 클래스 저자: 루이스 아텐시오
 */
const _ = require('lodash');

exports.IO = class IO {

    constructor(effect) {
        if (!_.isFunction(effect)) {
          throw 'IO 사용법: 함수가 필요합니다!';
        }
        this.effect = effect;
    }

    static of(a) {
        return new IO( () => a );
    }

    static from(fn) {
        return new IO(fn);
    }

    map(fn) {
        let self = this;
        return new IO(() => fn(self.effect()));
    }

    chain(fn) {
        return fn(this.effect());
    }

    run() {
        return this.effect();
    }
};