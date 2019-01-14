import { email, phone, interPhone } from "./constant";
import big from "./big";
const Utils = {
	...big,
	isEmail(v) {
		return email.test(v);
	},
	isPhone(v) {
		return phone.test(v);
	},
	isInternationalPhone(v) {
		return interPhone.test(v);
	},
	isString(v) {
		return Object.prototype.toString.call(v) == "[object String]";
	},
	isObject(v) {
		return Object.prototype.toString.call(v) == "[object Object]";
	},
	isEmptyString(v) {
		if (this.isString(v) && !v) {
			return true;
		}
		if (this.isString(v) && !v.length) {
			return true;
		}
		return false;
	},
	isEmpty(v) {
		if (!v) {
			return true;
		}
		if (!v.length) {
			return true;
		}
		return false;
	},
	validatePassword(value) {
		return (
			value.length > 7 &&
			/^(?![\d]+$)(?![a-zA-Z]+$)(?![!#$%^&*]+$)[\da-zA-Z!#$%^&*]/.test(value) &&
			!/\s/.test(value)
		);
	},
	// 深拷贝
	deepClone(data) {
		return JSON.parse(JSON.stringify(data));
	},

	// 针对ObservableArray/Object的深拷贝 ==有问题
	deepCloneObservable(data) {
		let o;
		const t = typeof data;
		if (t === "object") {
			o = data.length ? [] : {};
		} else {
			return data;
		}
		if (t === "object") {
			if (data.length) {
				for (const value of data) {
					o.push(this.deepCloneObservable(value));
				}
				return o;
			} else {
				for (const i in data) {
					o[i] = this.deepCloneObservable(data[i]);
				}
				return o;
			}
		}
	},

	// 转换ObservableArray成Array
	toArray(observableArray) {
		return observableArray.slice();
	},

	/**
	 * 将原数组转化为tree
	 * @param data 原数组
	 * @param id id字段
	 * @param pId 父id字段
	 * @param appId 一级数组的父id值
	 */
	arryToTree(data, id, pId, appId) {
		const arr = [];
		data.map((e, i) => {
			e[pId] === appId && arr.push(e);
		});
		const res = this.to3wei(arr, data, id, pId);
		return res;
	},

	/**
	 * 将一级分支数组转为树
	 * @param a 一级分支数组
	 * @param old 原数组
	 * @param id id字段
	 * @param pId 父id字段
	 */
	to3wei(a, old, id, pId) {
		a.map((e, i) => {
			a[i].children = [];
			old.map((se, si) => {
				if (se[pId] === a[i][id]) {
					a[i].children = [...a[i].children, se];
					this.to3wei(a[i].children, old, id, pId);
				}
			});
			if (!a[i].children.length) {
				delete a[i].children;
			}
		});
		return a;
	},

	/**
	 * 交换数组中2个元素位置
	 * @param arr 原数组
	 * @param i 第一个元素 从0开始计
	 * @param j 第二个元素 从0开始计
	 */
	arrExchangePos(arr, i, j) {
		arr[i] = arr.splice(j, 1, arr[i])[0];
	},

	arrRemove(arr, i) {
		const index = arr.indexOf(i);
		if (index > -1) arr.splice(index, 1);
	},

	// 登出的时候把storage清除
	logOutClearStorage() {
		localStorage.removeItem("userToken");
		localStorage.removeItem("userLoginPermission");
		localStorage.removeItem("ssoToken");
		localStorage.removeItem("userId");
		localStorage.removeItem("userInfo");
		localStorage.removeItem("userGroupList");
		localStorage.removeItem("gameAuthList");
	},

	//取cookies函数
	getCookie(cookie, name) {
		let arr = cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
		if (arr != null) return unescape(arr[2]);
		return null;
	},

	//js 加法计算
	//调用：accAdd(arg1,arg2)
	//返回值：arg1加arg2的精确结果
	accAdd(arg1, arg2) {
		var r1, r2, m;
		try {
			r1 = arg1.toString().split(".")[1].length;
		} catch (e) {
			r1 = 0;
		}
		try {
			r2 = arg2.toString().split(".")[1].length;
		} catch (e) {
			r2 = 0;
		}
		m = Math.pow(10, Math.max(r1, r2));
		return (arg1 * m + arg2 * m) / m;
	},

	//js 减法计算
	//调用：Subtr(arg1,arg2)
	//返回值：arg1减arg2的精确结果
	Subtr(arg1, arg2) {
		var r1, r2, m, n;
		try {
			r1 = arg1.toString().split(".")[1].length;
		} catch (e) {
			r1 = 0;
		}
		try {
			r2 = arg2.toString().split(".")[1].length;
		} catch (e) {
			r2 = 0;
		}
		m = Math.pow(10, Math.max(r1, r2));
		//last modify by deeka
		//动态控制精度长度
		n = r1 >= r2 ? r1 : r2;
		return (arg1 * m - arg2 * m) / m;
	},

	//js 除法函数
	//调用：accDiv(arg1,arg2)
	//返回值：arg1除以arg2的精确结果
	accDiv(arg1, arg2) {
		var t1 = 0,
			t2 = 0,
			r1,
			r2;
		try {
			t1 = arg1.toString().split(".")[1].length;
		} catch (e) {}
		try {
			t2 = arg2.toString().split(".")[1].length;
		} catch (e) {}
		r1 = Number(arg1.toString().replace(".", ""));
		r2 = Number(arg2.toString().replace(".", ""));
		return r1 / r2 * Math.pow(10, t2 - t1);
	},

	//js 乘法函数
	//调用：accMul(arg1,arg2)
	//返回值：arg1乘以arg2的精确结果
	accMul(arg1, arg2) {
		var m = 0,
			s1 = arg1.toString(),
			s2 = arg2.toString();
		try {
			m += s1.split(".")[1].length;
		} catch (e) {}
		try {
			m += s2.split(".")[1].length;
		} catch (e) {}
		return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
	},

	dateFormatter(date, formate) {
		const year = date.getFullYear();
		let month = date.getMonth() + 1;
		month = month > 9 ? month : `0${month}`;
		let day = date.getDate();
		day = day > 9 ? day : `0${day}`;
		let hour = date.getHours();
		hour = hour > 9 ? hour : `0${hour}`;
		let minute = date.getMinutes();
		minute = minute > 9 ? minute : `0${minute}`;
		let second = date.getSeconds();
		second = second > 9 ? second : `0${second}`;

		return formate
			.replace(/Y+/, `${year}`.slice(-formate.match(/Y/g).length))
			.replace(/M+/, month)
			.replace(/D+/, day)
			.replace(/h+/, hour)
			.replace(/m+/, minute)
			.replace(/s+/, second);
	},

	numberFormatter(numStr) {
		let numSplit = numStr.split(".");

		return numSplit[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",").concat(`.${numSplit[1]}`);
	},

	getCookie(cookie, name) {
		//取cookies函数
		if (!!!cookie) {
			return null;
		}
		var arr = cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
		if (arr != null) return unescape(arr[2]);
		return null;
	},

	unique(arr) {
		return Array.from(new Set(arr));
	},

	decodeUserName(val) {
		let resVal = "";
		if (this.isEmpty(val)) {
			return resVal;
		}
		let middleNum = Math.floor(val.length / 2);
		if (val.indexOf("@") > -1) {
			let mailPre = val.split("@")[0];
			if (mailPre.length <= 3) {
				resVal = "***" + "@" + val.split("@")[1];
			} else {
				resVal = mailPre.slice(0, 3) + "****@" + val.split("@")[1];
			}
		} else {
			resVal = val.slice(0, middleNum - 2) + "****" + val.slice(middleNum + 2);
		}

		return resVal;
	},

	formatterCoin(val) {
		return val.slice(0, -3);
	}
};

export default Utils;
