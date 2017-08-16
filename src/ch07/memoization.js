/**
 * 본문에서 사용한 메모화 함수
 * 저자: 루이스 아텐시오
 */
Function.prototype.memoized = function () {
	let key = JSON.stringify(arguments);
	this._cache = this._cache || {};
	this._cache[key] = this._cache[key] || 	this.apply(this, arguments);
	return this._cache[key];
};
	
Function.prototype.memoize = function () {
	let fn = this;
	if (fn.length === 0 || fn.length > 1) {
		return fn;
	}
	return function () {
		return fn.memoized.apply(fn, arguments);
	};
};

// 도우미 함수
module.exports = {
	
};