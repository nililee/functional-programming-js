/**
 * 커스텀 IO 모나드 클래스
 * 저자: 루이스 아텐시오
 */
class IO {
  constructor(effect) {
    if (!_.isFunction(effect)) {
        throw 'IO 사용법: 함수는 필수입니다!';
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
    var self = this;
    return new IO(function () {
      return fn(self.effect());
    });
  }

   chain(fn) {
    return fn(this.effect());
  }

  run() {
    return this.effect();
  }
}

// 도우미 함수
const read = function (document, id) {
  return function () {
    return document.querySelector(`${id}`).innerHTML;
  };
};

const write = function(document, id) {
  return function(val) {
    return document.querySelector(`${id}`).innerHTML = val;
  };
};

const readDom = _.partial(read, document);
const writeDom = _.partial(write, document);

// 프로그램 실행
const changeToStartCase =
  IO.from(readDom('#student-name')).
    map(_.startCase).
    map(writeDom('#student-name'));

changeToStartCase.run(); // DOM 요소 내부에서 단어 첫 자를 대문자로 바꿉니다.
