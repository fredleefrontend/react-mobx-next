import { observable, action, computed } from "mobx";
// import Storage from "@/utils/storage";

export default class ParentStore {
	@observable curPage = 1; // 当前页数
	@observable limit = 10; // 每页行数
	@observable loading = false; // loading...

	// start
	@computed
	get start() {
		return (this.curPage - 1) * this.limit;
	}

	// 根据索引删除值
	@action("BaseStore :: delIndex")
	delListByIndex(key, index) {
		this[key].splice(index, 1);
	}

	// num,str赋值
	@action("BaseStore :: setter")
	setStore(key, val) {
		this[key] = val;
	}

	// num,str赋值并存储storage
	@action("BaseStore :: setStoreStorage")
	setStoreStorage(key, val) {
		this[key] = val;
		this.setStorage(key, val);
	}
	@action("BaseStore :: setStorage")
	setStorage(key, val) {
		Storage.set(key, val);
	}
	@action("BaseStore :: getStorage")
	getStorage(key) {
		return Storage.get(key);
	}
	@action("BaseStore :: removeStorage")
	removeStorage(key) {
		return Storage.remove(key);
	}
}
