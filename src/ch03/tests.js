/**
 * 3장 예제 코드
 * 저자: 루이스 아텐시오
 */

"use strict";

QUnit.module('3장');

const _ = require('lodash');
const R = require('ramda');
const assert = QUnit.assert;

const Person = require('../model/Person.js').Person;
const Address = require('../model/Address.js').Address;

var p1 = new Person('111-11-1111', 'Haskell', 'Curry', 1900, new Address('US'));
var p2 = new Person('222-22-2222', 'Barkley', 'Rosser', 1907, new Address('Greece'));
var p3 = new Person('333-33-3333', 'John', 'von Neumann', 1903, new Address('Hungary'));
var p4 = new Person('444-44-4444', 'Alonzo', 'Church', 1903, new Address('US'));

var persons = [p1, p2, p3, p4];

QUnit.test("reduce를 이해", function () {
    let result = _(persons).reduce((stat, person) => {
        const country = person.address.country;
        stat[country] = _.isUndefined(stat[country]) ? 1 :
        stat[country] + 1;
        return stat;
    }, {});

    assert.deepEqual(result, {
        'US' : 2,
        'Greece' : 1,
        'Hungary': 1
    });
});

QUnit.test("map과 reduce를 조합", function () {
    const getCountry = person => person.address.country;
    const gatherStats = (stat, criteria) => {
        stat[criteria] = _.isUndefined(stat[criteria]) ? 1 :
            stat[criteria] + 1;
        return stat;
    };
    let result = _(persons).map(getCountry).reduce(gatherStats, {});
    assert.deepEqual(result, { US: 2, Greece: 1, Hungary: 1 });
});


QUnit.test("map/reduce를 렌즈와 조합", function () {
    const cityPath = ['address','city'];
    const cityLens = R.lens(R.path(cityPath), R.assocPath(cityPath));
    const gatherStats = (stat, criteria) => {
        stat[criteria] = _.isUndefined(stat[criteria]) ? 1 :
            stat[criteria] + 1;
        return stat;
    };

    let result = _(persons).map(R.view(cityLens)).reduce(gatherStats, {});
    assert.deepEqual(result, { null: 4 });
});

QUnit.test("올바른가, 아닌가", function () {
    const isNotValid = val => _.isUndefined(val) || _.isNull(val);
    const notAllValid = args => _(args).some(isNotValid);
    assert.ok(notAllValid (['string', 0, null, undefined])); // -> false
    assert.ok(!notAllValid (['string', 0, {}]));             // -> true

    const isValid = val => !_.isUndefined(val) && !_.isNull(val);
    const allValid = args => _(args).every(isValid);
    assert.ok(!allValid(['string', 0, null])); // -> false
    assert.ok(allValid(['string', 0, {}]));    // -> true
});

QUnit.test("filter 소개", function () {
    const isValid = val => !_.isUndefined(val) && !_.isNull(val);
    const fullname = person => person.fullname;
    let result = _([p1, p2, p3, null]).filter(isValid).map(fullname).value();
    assert.equal(result.length, 3);
});

QUnit.test("1903년에 태어난 사람", function () {
    const bornIn1903 = person => person.birthYear === 1903;
    const fullname = person => person.fullname;

    let result = _(persons).filter(bornIn1903).map(fullname).join(' and ');
    assert.equal(result, 'John von Neumann and Alonzo Church');
});

QUnit.test("로대시JS로 배열 처리", function () {
    let names = ['alonzo church', 'Haskell curry', 'stephen_kleene',
                 'John Von Neumann', 'stephen_kleene'];

    const isValid = val => !_.isUndefined(val) && !_.isNull(val);

    var result = _.chain(names)
                  .filter(isValid)
                  .map(s => s.replace(/_/, ' '))
                  .uniq()
                  .map(_.startCase)
                  .sort()
                  .value();

    assert.deepEqual(result, ['Alonzo Church', 'Haskell Curry', 'John Von Neumann', 'Stephen Kleene']);
});


QUnit.test("통계치 수집", function () {
    const gatherStats = function (stat, country) {
        if(!isValid(stat[country])) {
            stat[country] = {'name': country, 'count': 0};
        }
        stat[country].count++;
        return stat;
    };
    const isValid = val => !_.isUndefined(val) && !_.isNull(val);
    const getCountry = person => person.address.country;
    let result = _(persons).map(getCountry).reduce(gatherStats, {});
    assert.deepEqual(result,
          { US:      { name: 'US', count: 2 },
            Greece:  { name: 'Greece', count: 1 },
            Hungary: { name: 'Hungary', count: 1 }
          }
      );
});

// 3장 중간 즈음에 원소를 몇 개 더 추가합니다.
// persons2에 넣지만, 본문에서는 그냥 person으로 가리킵니다.
var persons2 = _(persons).map(R.identity);
var p5 = new Person('555-55-5555', 'David', 'Hilbert', 1903, new Address('Germany'));
persons2.push(p5);

var p6 = new Person('666-66-6666', 'Alan', 'Turing', 1912, new Address('England'));
persons2.push(p6);

var p7 = new Person('777-77-7777', 'Stephen', 'Kleene', 1909, new Address('US'));
persons2.push(p7);

QUnit.test("느긋한 함수 체인", function () {

    const gatherStats = function (stat, country) {
        if(!isValid(stat[country])) {
            stat[country] = {'name': country, 'count': 0};
        }
        stat[country].count++;
        return stat;
    };
    const isValid = val => !_.isUndefined(val) && !_.isNull(val);

    let result = _.chain(persons)
        .filter(isValid)
        .map(_.property('address.country'))
        .reduce(gatherStats, {})
        .values()
        .sortBy('count')
        .reverse()
        .first()
        .value()
        .name; // -> 'US'

    assert.equal(result, 'US');
});


QUnit.test("SQL 비슷한 자바스크립트", function () {

    _.mixin({'select': _.map,
             'from': _.chain,
             'where': _.filter
            });

    let result = _.from(persons)
        .where(p => p.birthYear > 1900 && p.address.country !== 'US')
        .sortBy(['_firstname'])
        .select(rec => rec.firstname)
        .value();

    assert.deepEqual(result, ['Barkley', 'John']);
});

QUnit.test("재귀적 덧셈", function () {
    function sum(arr) {
        if(_.isEmpty(arr)) {
            return 0;
        }
        return _.first(arr) + sum(_.tail(arr));
    };

    assert.equal(sum([]), 0); // -> 0
    assert.equal(sum([1,2,3,4,5,6,7,8,9]), 45); // -> 45
});

QUnit.test("재귀적 덧셈(꼬리 호출)", function () {
    function sum(arr, acc = 0) {
        if(_.isEmpty(arr)) {
            return acc;
        }
        return sum(_.tail(arr), acc + _.first(arr));
    };

    assert.equal(sum([]), 0); // -> 0
    assert.equal(sum([1,2,3,4,5,6,7,8,9]), 45); // -> 45
});

QUnit.test("트리 탐색", function () {
    const Node = require('./model/Node.js').Node;
    const Tree = require('./model/Tree.js').Tree;

    // 전 노드 인스턴스화 + 노드를 몇 개 더 추가
    const church = new Node(p4);
    const rosser = new Node(p2);
    const turing = new Node(p6);
    const kleene = new Node(p7);
    const nelson = new Node(new Person('123-23-2345', 'Nels', 'Nelson'))
    const constable = new Node(new Person('123-23-6778', 'Robert', 'Constable'));
    const mendelson = new Node(new Person('123-23-3454', 'Elliot', 'Mendelson'));
    const sacks = new Node(new Person('454-76-3434', 'Gerald', 'Sacks'));
    const gandy = new Node(new Person('454-78-3432','Robert', 'Gandy'));

    // 트리 구조 생성
    church.append(rosser).append(turing).append(kleene);
    kleene.append(nelson).append(constable);
    rosser.append(mendelson).append(sacks);
    turing.append(gandy);

    // 트리 구조를 이용해서 전 노드에 map 연산을 적용
    let newTree = Tree.map(church, p => p.fullname);
    assert.deepEqual(newTree.toArray(), ['Alonzo Church', 'Barkley Rosser', 'Elliot Mendelson',
        'Gerald Sacks', 'Alan Turing', 'Robert Gandy', 'Stephen Kleene', 'Nels Nelson', 'Robert Constable']);
});
