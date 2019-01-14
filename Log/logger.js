import Raven from "raven-js";
import config from "@/config";

Raven.config(config.sentry, {
	release: config.version,
	environment: process.env.NODE_ENV !== "production" ? "dev" : "prod"
}).install();
//sentry文档

//https://docs.sentry.io/

// Raven.captureMessage('Something happened', {
//   level: 'info' // one of 'info', 'warning', or 'error'
// });

export default function(...args) {
	Raven.captureMessage(...args);
}
