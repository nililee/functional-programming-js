/**
 * 4장 도우미 객체/함수
 * 저자: 루이스 아텐시오
 */
const R = require('ramda');

// checkType :: Type -> Type -> Type | TypeError
const checkType = R.curry(function(typeDef, obj) {
    if(!R.is(typeDef, obj)) {
        let type = typeof obj;
        throw new TypeError(` 타입 불일치: [${typeDef}]이어야 하는데, [${type}]입니다.`);
    }
    return obj;
});

// 도우미 함수
module.exports = {
    checkType: checkType
};

const Tuple = function( /* 타입 */ ) {
    const typeInfo = Array.prototype.slice.call(arguments, 0);
    const _T = function( /* 값 */ ) {
        const values = Array.prototype.slice.call(arguments, 0);
        if(values.some(val => val === null || val === undefined)) {
            throw new ReferenceError('튜플은 null 값을 가질 수 없습니다!');
        }
        if(values.length !== typeInfo.length) {
            throw new TypeError('튜플 항수가 프로토타입과 맞지 않습니다!');
        }
        values.map((val, index) => {
            this['_' + (index + 1)] = checkType(typeInfo[index], val);
        }, this);
        Object.freeze(this);
    };
    _T.prototype.values = function () {
        return Object.keys(this).map(k => this[k], this);
    };
    return _T;
};

// Tuple 클래스 내보내기
module.exports.Tuple = Tuple;