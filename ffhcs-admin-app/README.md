# ffhcs-admin-app

## Project setup
```
$ npm install
```

### Compiles and hot-reloads for development
```
$ npm run serve
```

### Compiles and minifies for production
```
$ npm run build
```

### Lints and fixes files
```
$ npm run lint
```

### Register a web service as system deamon
- pm2 패키지 설치
```
$ npm install pm2 -g 
```
- 웹서버 system startup에 등록  
```
$ pm2 --name ffhcs-web start npm -- start
# 위에 웹서버를 실행후 시작시켜야 됨
$ pm2 startup systemd
$ env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u pi --hp /home/pi
$ pm2 save
```
