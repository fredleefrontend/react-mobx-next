import configs from "../../config";

class i18n {
	constructor() {
	}
	get(locale) {
		return {
			App: {
				Home: require("./" + locale + "/App/Home"),
				Common: require("./" + locale + "/App/Common"),
				Login: require("./" + locale + "/App/Login"),
				Register: require("./" + locale + "/App/Register"),
				EhFindUser: require("./" + locale + "/App/EhFindUser"),
				Header: require("./" + locale + "/App/Header"),
				Footer: require("./" + locale + "/App/Footer"),
				BindPhone: require("./" + locale + "/App/BindPhone"),
				BindEmail: require("./" + locale + "/App/BindEmail"),
				C1Auth: require("./" + locale + "/App/C1Auth"),
				C2Auth: require("./" + locale + "/App/C2Auth"),
				Settings: require("./" + locale + "/App/Settings"),
				Password: require("./" + locale + "/App/Password"),
				FundsPwd: require("./" + locale + "/App/FundsPwd"),
				ForgotPassword: require("./" + locale + "/App/ForgotPassword"),
				Fee: require("./" + locale + "/App/Fee"),
				Application: require("./" + locale + "/App/Application"),
				AccountDetail: require("./" + locale + "/App/AccountDetail"),
				Recharge: require("./" + locale + "/App/Recharge"),
				Trade: require("./" + locale + "/App/Trade"),
				WithDraw: require("./" + locale + "/App/WithDraw"),
				Address: require("./" + locale + "/App/Address"),
				PwdLevel: require("./" + locale + "/App/PwdLevel"),
				Workorder: require("./" + locale + "/App/Workorder"),
				Prompt: require("./" + locale + "/App/Prompt"),
				Google: require("./" + locale + "/App/Google"),
				ErrorCode: require("./" + locale + "/App/ErrorCode"),
				Guides: require("./" + locale + "/App/Guides"),
				FQA: require("./" + locale + "/App/FQA"),
				Digital: require("./" + locale + "/App/Digital"),
				Privacy: require("./" + locale + "/App/Privacy"),
				Legal: require("./" + locale + "/App/Legal"),
				Terms: require("./" + locale + "/App/Terms")
			}
		};
	}
}

export default new i18n();
