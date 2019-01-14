import React from "react";
import Utils from "../utils";
import redirect from "../utils/redireact";

export default class Index extends React.Component {
	static async getInitialProps(context) {
		const userAgent = context.req ? context.req.headers["user-agent"] : navigator.userAgent;
		const locale = !!context.res
			? Utils.getCookie(context.req.headers.cookie, "locale")
			: Utils.getCookie(document.cookie, "locale");
		redirect(context, locale || "/en_us");
		return { userAgent };
	}

	render() {
		return <div>index</div>;
	}
}
