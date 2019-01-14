import React from "react";
import { Form, Input, Icon, Button, Modal, message, Row, Col } from "antd";
import { TLInput, TLForm, TLButton } from "@/tuli-ui";
import { inject, observer } from "mobx-react";
import { observable, action, runInAction, computed } from "mobx";
import { Provider } from "mobx-react";
import Link from "next/link";
import Router from "next/router";
import Cookies from "universal-cookie";
import TwoFA from "../../components/TwoFA";
import Utils from "../../utils";
import configs from "../../config";
import _ from "lodash";

import _debug from "debug";
const FormItem = Form.Item;
const cookies = new Cookies();

function hasErrors(fieldsError, isShowCode) {
	if (isShowCode === "false" || !isShowCode) {
		fieldsError["secret"] = null; //如果首次登陆不需要验证码
	}
	return Object.keys(fieldsError).some(field => fieldsError[field]);
}

let loginTimer = null;

@inject("BaseStore")
@inject("UserStore")
@Form.create()
@observer
export default class EhLogin extends React.Component {
	@observable imgVcode = "";
	ehtimer = null;

	constructor(props) {
		super(props);
	}

	componentDidMount() {
		const { locale, isLogin } = this.props.BaseStore;
		this.props.UserStore.sendCode();
		if (isLogin) {
			Router.push(`/${locale}/settings`);
		}
	}

	googleSuccess = () => {
		let username = !!this.props.UserStore.loginData.email
			? this.props.UserStore.loginData.email
			: this.props.UserStore.loginData.phone;
		//非第一次登录跳转到交易页

		cookies.set("isLogin", true, { path: "/" });
		cookies.set("username", Utils.decodeUserName(username), { path: "/" });
		this.props.BaseStore.setState(["userName"], Utils.decodeUserName(username));
		Router.push(`/${this.props.BaseStore.locale}/trade`);
	};

	googleError = () => {
		message.error(this.props.BaseStore.i18n.App.Login.googleCodeError);
	};

	onSubmit = async () => {
		let { locale, i18n } = this.props.BaseStore;
		const { userLogin, ehLogin, setState, getInitEhLogin } = this.props.UserStore;
		const loginLanguage = i18n.App.Login;
		const { resetFields } = this.props.form;
		setState(["ehLogin", "submit", "loading"], true);
		const res = await userLogin({
			userName: ehLogin.username.value,
			password: ehLogin.password.value,
			captcha: ehLogin.verify.value
		});

		if (200 == res.code) {
			
			if (this.props.UserStore.loginData.firstLogin) {
				//如果第一次登陆，跳转到个人中心账号安全页面
				//登录成功
				message.success(loginLanguage.loginSuccess);
				cookies.set("isLogin", true, { path: "/" });
				cookies.set("username", Utils.decodeUserName(ehLogin.username.value), { path: "/" });

				Router.push(`/${locale}/settings`);
				return;
			}
			//获取个人验证状态位
			if (this.props.UserStore.loginData.googleCheckLogin) {
				//输入谷歌验证码
				this.props.BaseStore.setState(["googlePopVisible"], true);
				return;
			}

			const search = location.search.slice(1);
			const skey = search.split('=')[0];
			const sval = search.split('=')[1];

			if (search && sval) {
				location.href = configs.otcUrl + sval
				return;
			}
			let username = !!this.props.UserStore.loginData.email
				? this.props.UserStore.loginData.email
				: this.props.UserStore.loginData.phone;
			//非第一次登录跳转到交易页
			cookies.set("isLogin", true, { path: "/" });
			cookies.set("username", Utils.decodeUserName(username), { path: "/" });
			this.props.BaseStore.setState(["userName"], Utils.decodeUserName(username));
			Router.push(`/${locale}/trade`);
			return;
		}
		setState(["ehLogin", "submit", "loading"], false);
		//重置图片验证码状态
		setState(["ehLogin", "verify"], getInitEhLogin().verify);
		this.props.UserStore.sendCode();
		resetFields("validatecode");
		message.error(res.message);
	};

	onInputUsername = async (rule, value, callback) => {
		const { i18n } = this.props.BaseStore;

		const { setState, ehLogin } = this.props.UserStore;
		const loginLanguage = i18n.App.Login;

		setState(["ehLogin", "username", "value"], value);

		if (!ehLogin.username.isEmail && !ehLogin.username.isGt4) {
			callback(loginLanguage.accountError);
			return;
		}

		await new Promise(async (resolve) => {
			this.debounce(async () => {
				await this.props.UserStore.checkUserAccount({ userName: value });
				resolve();
			},500)
		})

		if(!ehLogin.username.isEnroll){
			callback(new Error(loginLanguage.hasnotAccount))
			return;
		}

		callback();
		
	};

	debounce = (fn,time) => {
		this.ehtimer && clearTimeout(this.ehtimer)
		this.ehtimer = setTimeout(() => {fn()},time)
	}

	onInputPassword = (rule, value, callback) => {
		const { i18n } = this.props.BaseStore;

		const { setState } = this.props.UserStore;
		setState(["ehLogin", "password", "value"], value);
		callback();
	};

	onInputVerify = async (rule, value, callback) => {
		const { i18n } = this.props.BaseStore;

		const { setState, ehLogin } = this.props.UserStore;
		const loginLanguage = i18n.App.Login;
		setState(["ehLogin", "verify", "value"], value);
		if (this.isEmpty) {
			callbakc(loginLanguage.codeEmpty);
			return;
		}
		if (!ehLogin.verify.validate) {
			callback(loginLanguage.imgVcodeError);
		}
		callback();
	};

	onKeyPress = e => {
		return;
		const enterCode = 13;
		const isEnter = e.charCode == enterCode;
		if (isEnter) {
			this.onSubmit();
		}
	};

	componentWillUnmount() {
		const { setState, ehLogin, getInitEhLogin } = this.props.UserStore;
		const { resetFields } = this.props.form;
		setState(["ehLogin"], getInitEhLogin());
		resetFields();
	}

	render() {
		const { getFieldDecorator, getFieldsError, isFieldTouched, getFieldError } = this.props.form;
		const { i18n, locale } = this.props.BaseStore;
		const { loginLoading, imgParameter } = this.props.UserStore;
		const loginLanguage = i18n.App.Login;
		const formItemLayout = {
			labelCol: {
				xs: { span: 6 },
				sm: { span: 6 }
			},
			wrapperCol: {
				xs: { span: 24 },
				sm: { span: 18 }
			}
		};
		const tailFormItemLayout = {
			wrapperCol: {
				xs: {
					span: 24
				},
				sm: {
					span: 18
				}
			}
		};
		return (
			<div>
				<TLForm className="login-form" onKeyPress={this.onKeyPress}>
					<FormItem>
						{getFieldDecorator("account", {
							rules: [
								{
									validator: this.onInputUsername
								}
							]
						})(
							<TLInput
								maxLength="50"
								prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
								placeholder={loginLanguage.accountPlaceholder}
							/>
						)}
					</FormItem>
					<FormItem>
						{getFieldDecorator("password", {
							rules: [
								{
									required: true,
									message: loginLanguage.userPwdLength
								},
								{
									validator: this.onInputPassword
								}
							]
						})(
							<TLInput
								prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
								placeholder={loginLanguage.userPwdLength}
								type="password"
							/>
						)}
					</FormItem>
					<FormItem>
						{getFieldDecorator("validatecode", {
							rules: [
								{
									required: true,
									message: loginLanguage.imgVcodeEmpty
								},
								{
									validator: this.onInputVerify
								}
							]
						})(
							<TLInput
								prefix={<Icon type="safety" style={{ color: "rgba(0,0,0,.25)" }} />}
								maxLength="5"
								placeholder={loginLanguage.imgVcodeEmpty}
							/>
						)}
						<img
							src={this.props.UserStore.imgParameter}
							alt="verify"
							style={{ height: "40px", marginLeft: "19px" }}
							onClick={() => {
								this.props.UserStore.sendCode();
							}}
						/>
					</FormItem>
					<Link href={`/${locale}/settings/forgotPassword`}>
						<a
							style={{
								fontSize: "12px",
								color: "#221b2f"
							}}
						>
							{loginLanguage.forgot}
						</a>
					</Link>
					<FormItem>
						<TLButton
							onClick={this.onSubmit}
							//这里先设为false ， 可能为禁止导致登陆不了，难以复现
							disabled={this.props.UserStore.ehLogin.submit.disabled}
							// disabled={false}
							loading={this.props.UserStore.ehLogin.submit.loading}
							style={{
								width: "280px",
								marginTop: "8px",
								marginBottom: "3px"
							}}
						>
							<span className="eh-df eh-jcc">
								<span
									className="eh-asc"
									style={{
										paddingRight: "10px",
										fontSize: "16px",
										color: "white",
										fontWeight: "100"
									}}
								>
									{loginLanguage.button}
								</span>
								<Icon
									className="eh-asc"
									type="arrow-right"
									style={{
										width: "20px",
										height: "20px",
										lineHeight: "20px",
										fontSize: "20px",
										color: "white",
										verticalAlign: "center"
									}}
								/>
							</span>
						</TLButton>
					</FormItem>
					<FormItem>
						<Link href={`/${locale}/register`}>
							<a style={{ fontSize: "14px", color: "#7f60ed" }}>{loginLanguage.register}</a>
						</Link>
					</FormItem>
				</TLForm>
				<TwoFA handleSuccess={this.googleSuccess} handleError={this.googleError} onLogin />
			</div>
		);
	}
}
