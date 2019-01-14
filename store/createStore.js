import UserStore from "./User";
import RootStore from "./Root";

const appStores = {
	BaseStore,
	TradeStore,
	UserStore,
	WorkorderStore
};

const store = null;
let root = null;

function createStore(isServer = false, preFetchObj = {}) {
	root = root || new RootStore(isServer, preFetchObj);
	return Object.keys(appStores).reduce(
		(acc, storeName) => ({
			...acc,
			[storeName]:
				!isServer && store !== null ? store : new appStores[storeName](isServer, preFetchObj, root)
		}),
		{}
	);
}

export default createStore;
