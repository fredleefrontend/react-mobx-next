import React from "react";
import Raven from "raven-js";
import config from "@/config";

Raven.config(config.sentry, {
  release: config.version,
  environment: process.env.NODE_ENV !== "production" ? "dev" : "prod"
}).install();

export default class Log extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidCatch(error, errorInfo) {
    Raven.captureException(error, { extra: errorInfo });
  }

  render() {
    return this.props.children;
  }
}
