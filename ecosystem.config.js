/* eslint-disable */
// 暂时没用
module.exports = {
	apps: [
		{
			name: "dev-rightBTC-4000",
			script: "./server.js",
			exec_mode: "fork",
			instance: 1,
			env: {
				NODE_ENV: "development"
			},
			env_production: {
				NODE_ENV: "production"
			}
		}
	]
};
