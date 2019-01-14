import { observable, action, runInAction, computed, when } from "mobx";
import Cookies from "universal-cookie";
import i18n from "../../common/i18n";
import router from "next/router";
import { message } from "antd";
import _debug from "debug";
import Utils from "../../utils";
// import moment from 'moment';
import {} from "./api";
import ParentStore from "../parentStore";

const debug = _debug("app: RootStore");
//当前store为只读，用于store之间状态共享 ， 不要尝试 设置当前store中的值
//从哪个模块共享出来的状态 放入 对应的模块变量中去
export default class RootStore extends ParentStore {
	@observable
	base = {
		locale: "",
		i18n: {}
	};
	@observable trade = {};
	@observable
	user = {
		isPMCodeCorrect: {},
		isAccountExist: false
	};
	@observable workorder = {};
	@observable i18n = {};
	constructor() {
		super();
	}

	/**
	 * 更新状态
	 * @point Array 指向目标状态的数组指针
	 * @v 		any   新值
	 */
	@action
	setState = (point, v) => {
		if (point.length == 1) {
			this[point.shift()] = v;
			return;
		}
		let key = point.shift(),
			curPoint = this[key];
		while (point.length > 1) {
			curPoint = curPoint[point.shift()];
		}
		curPoint[point.shift()] = v;
	};
}
