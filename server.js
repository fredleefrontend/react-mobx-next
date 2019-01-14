const Koa = require("koa");
const next = require("next");

const KoaBody = require("koa-body");
const mobxReact = require("mobx-react");
const config = require("./config");
const fRouter = require("./config/router");
const Router = require("koa-router");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
mobxReact.useStaticRendering(true);

const server = new Koa();

app.prepare().then(() => {
	server.use(KoaBody());
	server.use(fRouter(app).routes()).use(fRouter(app).allowedMethods());
	server.use(async (ctx, next) => {
		await handle(ctx.req, ctx.res);
		ctx.respond = false;
	});

	server.listen(config.port, err => {
		if (err) throw err;
		console.log(`> Ready on localhost:${config.port}`);
	});
});

module.exports = server;
