/**
 * 도우미 객체/함수
 * 저자: 루이스 아텐시오
 */
var Person = require('../model/Person.js').Person;

var _students = {
    '444-44-4444' : new Person('444-44-4444', 'Alonzo', 'Church'),
    '444444444' : new Person('444-44-4444', 'Alonzo', 'Church')
};

module.exports = {
    // 도우미 함수
};

// 도우미 객체
module.exports.db = {
    find : function(ssn) {
        return _students[ssn];
    }
};