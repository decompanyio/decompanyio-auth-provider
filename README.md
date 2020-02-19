# Decompany.io Auth Provider

## 1. 디렉토리 구성

- /authentication : 인증관련 Rest Api
- /authentication-login : 로그인을 위한 Provider선택 화면
- /sample-app : 로컬 인증 테스트를 위한 app, npm start로 구동함
- /test : Jest
- /test-token : 테스트를 위한 Service Provider의 Rest api
  * 개발 mongodb에서 개인 정보 가져오는 테스트용 rest api : https://td7tx2gu25.execute-api.us-west-1.amazonaws.com/authtest/api/account/get 

## 2. Service Provider

- test-token이 access_token을 이용한 api테스트 프로젝트임
- decompany프로젝트에서의 적용 테스트를 위하여 backend-restapis-authtest 를 us-west-1 에 배포한 상태임

## 3. 확인방법
    1) cd sample-app && npm start
    2) 브라우저를 통하여 http://login.share.decompany.io.s3-website-us-west-1.amazonaws.com/ 접근후 Google Provider선택
    3) 로그인 이후 http://127.0.0.1:3000/serverless-authentication-gh-pages 페이지로 URL이 변경된것을 확인
    - Test 영역에서 로그인한 정보를 decompany db에서 가져온 정보를 확인 할 수 있음(기존에 share.decompany.io 로그인한 경우가 있어야함)




## N. 참조

serverless-authentication-boilerplate를 참고했습니다.

> forked from <https://github.com/laardee/serverless-authentication-boilerplate>