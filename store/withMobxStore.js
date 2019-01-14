import App, { Container } from "next/app";
import createStore from "./createStore";

const isServer = typeof window === "undefined";
const __NEXT_MOBX_STORE__ = "__NEXT_MOBX_STORE__";

function getOrCreateStore(initialProps = {}) {
	// Always make a new store if server, otherwise state is shared between requests
	if (isServer) {
		return createStore(isServer, initialProps);
	}

	// Store in global variable if client
	if (!window[__NEXT_MOBX_STORE__]) {
		window[__NEXT_MOBX_STORE__] = createStore(isServer, initialProps);
	}
	return window[__NEXT_MOBX_STORE__];
}

export default App => {
	return class Mobx extends React.Component {
		static async getInitialProps(appContext) {
			const mobxStore = getOrCreateStore();

			// Provide the store to getInitialProps of pages
			appContext.ctx.mobxStore = mobxStore;

			let appProps = {};
			if (App.getInitialProps) {
				appProps = await App.getInitialProps(appContext);
			}
			return {
				...appProps
			};
		}

		constructor(props) {
			super(props);
			this.mobxStore = getOrCreateStore(isServer);
		}

		render() {
			return <App {...this.props} mobxStore={this.mobxStore} />;
		}
	};
};
