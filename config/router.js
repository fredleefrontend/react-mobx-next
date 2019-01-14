const Router = require("koa-router");
const router = new Router();

module.exports = app => {

	router.get("/n/:id", async ctx => {
		app.render(ctx.req, ctx.res, `/${ctx.req.url.split("/")[1]}/newsDetail`, ctx.params);
		ctx.respond = false;
	});
	return router;
};
