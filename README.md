

## 特性
服务端渲染

## 使用技术
服务端渲染： Next.js
基础框架：React16.0
状态管理：Mobx
请求处理：Axios
UI框架： AntDesign
CSS框架： scss
服务端框架：Koa
服务端进程守护：pm2
SEO: Helmet

# 快速开始

## 安装
````bash
$ npm install
````

## 启动测试环境
````bash
$ npm run dev 
````

## 打包
````bash
$ npm run build
$ npm run start 
````

## 一些注意事项
模仿抄袭http://www.huazhu.com/ 功能 
数据库暂定
或者用模拟数据的 mockjs
```前端路由
/config/router.js

```js
const Router = require('koa-router')
const {app} = require('../server');
const router = new Router({
    prefix: '(/zh_cn|/us_en)'
})

module.exports = (app)=>{
    router.get("/newsDetail/:id", async ctx => {
		app.render(ctx.req, ctx.res, `/${ctx.req.url.split("/")[1]}/newsDetail`, ctx.params);
		ctx.respond = false;
	});

    return router;
};
```
