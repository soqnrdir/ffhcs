#소방헬기 통합지휘 시스템 구축 웹

## Table of contents

* [Deployment](#deployment)
* [Development Memo](#development)

## <a name="deployment"/>Deployment

* Run Web Service with source code
- Run the server in development mode: `npm run start:dev`
- Build the project for production: `npm run build`.
- Run the production build: `npm start`.
- Run production build with a different env file npm start -- --env="name of env file"

* Production 버전 빌드 및 설치 방법
1) ffhcs-admin-app 앱 빌드
```
$ cd ../ffhcs-admin-app
$ npm run build
```
2) ffhcs-web 빌드
```
$ npm run build
```

3) production 빌드 ffhcs-web 실행
```
$ npm start
```

4) Linux 서비스 등록
```
npm install pm2 -g 
pm2 --name ffhcs-web start npm -- start
pm2 startup systemd
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u pi --hp $HOME
pm2 save
```

* 개발모드 ffhcs-web와 ffhcs-admin-app 분리해서 실행
1) ffhcs-web 실행
env/development.env 파일내 포트 번호 확인
```
$ export DEBUG=ffhcs:*
$ npm run start:dev
```

2) ffhcs-admin-app development 모드로 실행
vue.config.js 파일내 포터 번호 확인
```
$ cd ../ffhcs-admin-app
$ npm run serve
```

* Access a web service with web browser

Open "http://<ip>:3010" URL.  
Default user name is "admin" with no password.

## <a name="development"/>Development Memo
* Setup Development Environment
```
npm -g install typescript
npm -g install express-generator-typescript
```

* Create Typescrpt Project
```
express-generator-typescript ffhcs
```

* compiled files not generate in dist directory with 'npm run build'
Run manual compilation
```
tsc --build tsconfig.prod.json
```

* 인증 검사 없는 API 함수 접근
환경변수 AUTH_DISABLED=1로 지정후 프로그램 재 실행
```
export AUTH_DISABLED=1
```

* 사용자 로그인 시험 방법
```
$ curl -S -v -X POST -H "Content-Type: application/json" \
  -d '{"userId":"test1","password":"","signature":"01012345678"}'\
  http://localhost:3010/v1/auth/user-login

{"result":{"id":"ix8So4Vv...sggq-So7FxJ_vpuY"}
```

* 상영이력 생셩 시험 방법
로그인을 통해 token 값을 획득하고 재생 목록에서 cameraId값을 구함
```
$ TOKEN="..."
$ curl -S -v -H "Authorization: Bearer ${TOKEN}" http://localhost:3011/v1/playlists/all
```

재생 로고 생성
```
$ curl -S -v -H "Authorization: Bearer ${TOKEN}" -X POST -H "Content-Type: application/json" \
  -d '{"cameraId":"d1diZCBnP4Eu2GJaG8p1Na","statusCode":200}' \
  http://localhost:3010/v1/playlogs/play-start
  <결과에서 playlogId 얻음>
```

재생 종료 전달
```
$ curl -S -v -H "Authorization: Bearer ${TOKEN}" PUT -H "Content-Type: application/json" \
  -d '{"playlogId":"cvqzfEMKgHLvmGWgtmXsHW"}' \
  http://localhost:3010/v1/playlogs/play-update
```

* 상영이력 생셩 시험 방법
로그인을 통해 token 값을 획득하고 재생 목록에서 cameraId값을 구함
```
$ TOKEN="..."
$ curl -S -v http://localhost:3010/v1/tests/lastestcoords
```

* 카메라 목록 조회
권한에 해당하는 카메라 목록을 조회한다.
perm=1,2,3,4 --> 모든 카메라 정보 포함    
perm=1 --> 각 카메라 그룹 밑에 1번 카메라 정보만 포함  
perm=1,2 --> 1번 2번 카메라 정보 포함  
```
$ curl -S -v http://localhost:3010/v1/tests/playlists?perm=1,2,3,4
```

## Reference
