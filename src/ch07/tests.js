/**
  7장 예제 코드
  저자: 루이스 아텐시오
*/

"use strict";

QUnit.module('7장');
const assert = QUnit.assert;

// 메모화 설치
require('./memoization');

const now = require("performance-now")
const R = require('ramda');
const IO = require('../model/monad/IO.js').IO;

let rot13 = (s =>
        s.replace(/[a-zA-Z]/g, c =>
            String.fromCharCode((c <= 'Z' ? 90 : 122)
                >= (c = c.charCodeAt(0) + 13) ? c : c - 26))).memoize();

QUnit.test("메모화 테스트", function () {
    assert.equal(rot13('functional_js_50_off'), 'shapgvbany_wf_50_bss');
});

QUnit.test("성능", function () {
    const start = () => now();
    const runs = [];
    const end = function (start) {
        let end = now();
        let result = (end - start).toFixed(3);
        runs.push(result);
        return result;
    };

    const test = function (fn, input) {
        return () => fn(input);
    };

    const testRot13 = IO.from(start)
      .map(R.tap(test(rot13, 'functional_js_50_off')))
      .map(end);

    testRot13.run();
    testRot13.run();
    assert.ok(runs[0] >= runs[1]);
});