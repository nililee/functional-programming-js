# 함수형 자바스크립트 프로그래밍(Functional JavaScript Programming)
##### 저자: 루이스 아텐시오
##### 역자: 이일웅

노드JS 사용자는 최소 6.3.1 이상을 설치해야 합니다.

node --version > 6.3.1

다음 명령어로 프로젝트를 시작하면 필요한 함수형 라이브러리를 모두 내려받습니다.

~~~
npm install
~~~

이 저장소에 들어있는 내용은,

* 각 장에 나온 샘플 코드 일체(실행 가능한 단위 테스트)
* 브라우저 실행용 자바스크립트
* Optional, Either, Maybe 등의 함수형 자료형
* 로대시JS, RxJS 같은 함수형 자바스크립트 라이브러리에 접근하는 방법

### QUnit
npm install qunit

### 람다JS
npm install ramda

### 로대시JS
npm install lodash

### RxJS
npm install rxjs


## 단위 테스트 실행
먼저, QUnit을 설치하세요. 각 테스트는 QUnit CLI에서 각 장 번호를 지정하여 실행하면 됩니다.
~~~
$> npm run ch[1-8]
~~~
