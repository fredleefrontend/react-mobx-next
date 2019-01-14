import React from "react";
import { Form, Input, Icon, Row, Col, Button, Modal, message, Steps } from "antd";
import { TLInput, TLButton, TLForm, TLModal, TLSelect, TLSteps } from "@/tuli-ui";
import { inject, observer } from "mobx-react";
import { observable, action, runInAction, computed } from "mobx";
import Link from "next/link";
import Router from "next/router";
import Utils from "../../utils";
import PwdLevel from "../../components/PwdLevel";
import SendCodeBtn from "../../components/SendCodeBtn";
import EhInputCode from "@/components/user/EhInputCode";
const FormItem = Form.Item;
const Step = TLSteps.Step;

@inject("BaseStore")
@inject("UserStore")
@observer
class EhFindUser extends React.Component {
	@observable curStep = 0;
	@observable hadCheckAccountFinish = false;
	@observable vcodeVisible = false;
	@observable popLoading = false;
	@observable imgVcode = "";
	@observable type = "";
	@observable newpassword = "";
	@observable emailCode = "";
	@observable phoneCode = "";
	@observable submitLoading = false;

	@action
	setFogAttr = (key, val) => {
		this[key] = val;
	};

	constructor(props) {
		super(props);
		this.init();
	}

	componentDidMount() {
		const { initEhInputCode, setState, getInitEhFindUser, ehFindUser } = this.props.UserStore;
		//初始化状态
		setState(["ehFindUser"], getInitEhFindUser());
		initEhInputCode();
	}

	checkAccountExist = async () => {
		const { i18n, locale } = this.props.BaseStore;
		const loginLanguage = i18n.App.Login;
		const userName = this.props.form.getFieldValue("account");
		if (!userName) return;
		this.setFogAttr("hadCheckAccountFinish", false);
		await this.props.UserStore.checkUserAccount({ userName });
		if (!this.props.UserStore.isAccountExist) {
			this.props.form.setFields({
				account: {
					value: userName,
					errors: [new Error(loginLanguage.hasnotAccount)]
				}
			});
		}
		this.setFogAttr("hadCheckAccountFinish", true);
	};

	init = async () => {};

	onSubmit = async () => {
		const {
			setState,
			ehFindUser,
			checkBindingStatus,
			checkVerificationCode
		} = this.props.UserStore;

		const on = ehFindUser.step.on;

		if (on == 0) {
			this.onStepFirst();
		}

		if (on == 1) {
			this.onStepSecond();
		}

		if (on == 2) {
			this.onStepThird();
		}
	};

	onStepFirst = async () => {
		const {
			setState,
			ehFindUser,
			checkBindingStatus,
			checkMobileAreaid,
			checkVerificationCode
		} = this.props.UserStore;

		const on = ehFindUser.step.on;
		const { locale, i18n } = this.props.BaseStore;
		const EhFind = i18n.App.EhFindUser;

		//获取当前手机号 区号
		await checkMobileAreaid({ userName: ehFindUser.username.value });

		//更新绑定信息
		await checkBindingStatus({ userName: ehFindUser.username.value });

		if (!ehFindUser.step.steps[0].validate) {
			message.warning(EhFind.warnMes1);
			return;
		}
		setState(["ehFindUser", "step", "on"], 1);
	};

	onStepSecond = async () => {
		const {
			setState,
			ehFindUser,
			checkBindingStatus,
			checkVerificationCode,
			userBingingStatus
		} = this.props.UserStore;

		const on = ehFindUser.step.on;
		const { locale, i18n } = this.props.BaseStore;
		const EhFind = i18n.App.EhFindUser;
		let res = null;

		if (ehFindUser.email.show) {
			res = await checkVerificationCode({
				userName: ehFindUser.email.value,
				code: ehFindUser.email.code
			});

			if (res.code != 200) {
				message.warning(res.message);
				return;
			}
		}
		
		if (ehFindUser.phone.show) {
			res = await checkVerificationCode({
				userName: ehFindUser.phone.value,
				code: ehFindUser.phone.code
			});
			
			if (200 != res.code) {
				message.warning(res.message);
				return;
			}
		}
		
		if (!ehFindUser.step.steps[1].validate) {
			message.warning(res.message);
			return;
		}

		setState(["ehFindUser", "step", "on"], 2);
	};

	onStepThird = async () => {
		const {
			setState,
			ehFindUser,
			getInitEhInputCode,
			checkBindingStatus,
			checkVerificationCode,
			userBingingStatus,
			forgetPassword,
			getInitEhFindUser
		} = this.props.UserStore;

		const { locale, i18n } = this.props.BaseStore;
		const EhFind = i18n.App.EhFindUser;

		const on = ehFindUser.step.on;

		if (ehFindUser.confirmPassword.validate) {
			//修改密码
			setState(["ehFindUser", "submit", "loading"], true);
			let res = await forgetPassword({
				phone: ehFindUser.phone.value,
				email: ehFindUser.email.value,
				phonecode: ehFindUser.phone.code,
				emailcode: ehFindUser.email.code,
				password: ehFindUser.confirmPassword.value
			});
			setState(["ehFindUser", "submit", "loading"], false);
			if (res.code === 200) {
				//修改密码成功
				message.success(EhFind.resetSuc);
				Router.push({ pathname: `/${locale}/settings/login` });
			} else {
				message.error(res.message);
			}
		}
	};

	onInputUsername = async (rule, value, callback) => {
		const { i18n } = this.props.BaseStore;

		const { setState, ehFindUser } = this.props.UserStore;
		const loginLanguage = i18n.App.Login;

		setState(["ehFindUser", "username", "value"], value);
		if (!value) {
			callback();
			return;
		}
		if (!ehFindUser.username.isEmail && !ehFindUser.username.isGt4) {
			callback(loginLanguage.accountError);
			return;
		}

		await this.props.UserStore.checkUserAccount({ userName: ehFindUser.username.value });

		if (!ehFindUser.username.isEnroll) {
			callback(loginLanguage.hasnotAccount);
			return;
		}
		callback();
	};

	onInputPassword = async (rule, value, callback) => {
		const { i18n } = this.props.BaseStore;

		const { setState, ehFindUser } = this.props.UserStore;
		const loginLanguage = i18n.App.Login;

		const registerLanguage = this.props.BaseStore.i18n.App.Register;

		setState(["ehFindUser", "password", "value"], value);
		if (value && !ehFindUser.password.validate) {
			callback(registerLanguage.pwdTypeError);
			return;
		}
	};

	onInputConfirmPassword = async (rule, value, callback) => {
		const { i18n, locale } = this.props.BaseStore;

		const { setState, ehFindUser } = this.props.UserStore;
		const loginLanguage = i18n.App.Login;

		const registerLanguage = this.props.BaseStore.i18n.App.Register;

		setState(["ehFindUser", "confirmPassword", "value"], value);

		if (!ehFindUser.confirmPassword.isSameWithPassword) {
			callback(registerLanguage.pwdNotSame);
			return;
		}

		if (!ehFindUser.confirmPassword.validate) {
			callback(registerLanguage.pwdTypeError);
			return;
		}
	};

	render() {
		const {
			getFieldDecorator,
			getFieldsError,
			isFieldTouched,
			getFieldValue,
			getFieldError
		} = this.props.form;
		const {
			locale,
			i18n,
			sendCode,
			countSecond,
			hasErrors,
			isAccountNotExists,
			sendEmail,
			authToken,
			parameterId
		} = this.props.BaseStore;
		const {
			imgParameter,
			userBingingStatus,
			ehInputCode,
			ehFindUser,
			isPMCodeCorrect
		} = this.props.UserStore;
		const registerLanguage = i18n.App.Register;
		const forgotLanguage = i18n.App.ForgotPassword;
		const loginLanguage = i18n.App.Login;
		const PwdLevelLanguage = i18n.App.PwdLevel;
		const EhFind = i18n.App.EhFindUser;

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
		const stepsLang = {
			zh_cn: ["输入账号", "安全验证", "重置登录密码"],
			en_us: ["Account Name", "SMS Code", "Done"]
		};
		return (
			<div>
				<div className="steps" style={{ width: "331px", marginBottom: "87px" }}>
					<TLSteps current={ehFindUser.step.on}>
						{ehFindUser.step.steps.map((item, index) => (
							<Step key={item.title} title={stepsLang[locale][index]} />
						))}
					</TLSteps>
					{/* {ehFindUser.step.steps[1].validate ? "true" : "false"}
					{isPMCodeCorrect.email ? "true" : "false"}
					{isPMCodeCorrect.phone ? "true" : "false"} */}
				</div>
				<TLForm>
					{ehFindUser.username.show ? (
						<FormItem>
							{getFieldDecorator("account", {
								rules: [
									{
										required: true,
										message: loginLanguage.accountError
									},
									{
										validator: this.onInputUsername
									}
								]
							})(
								<TLInput
									placeholder={loginLanguage.accountPlaceholder}
									onBlur={this.checkAccountExist}
									prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
								/>
							)}
						</FormItem>
					) : null}

					{ehFindUser.email.show ? (
						<FormItem>
							<TLInput
								prefix={<Icon type="phone" style={{ color: "rgba(0,0,0,.25)" }} />}
								defaultValue={Utils.decodeUserName(userBingingStatus.emailBinded)}
								disabled={ehFindUser.username.disabled}
							/>
						</FormItem>
					) : (
						""
					)}

					{ehFindUser.email.show ? (
						<FormItem>
							<EhInputCode page="forgot" type={"email"} value={userBingingStatus.emailBinded} />
						</FormItem>
					) : (
						""
					)}

					{ehFindUser.phone.show ? (
						<FormItem>
							<TLInput
								prefix={<Icon type="phone" style={{ color: "rgba(0,0,0,.25)" }} />}
								defaultValue={Utils.decodeUserName(userBingingStatus.phoneBinded)}
								disabled={ehFindUser.username.disabled}
							/>
						</FormItem>
					) : (
						""
					)}

					{ehFindUser.phone.show ? (
						<FormItem>
							<EhInputCode page="forgot" type={"phone"} value={userBingingStatus.phoneBinded} />
						</FormItem>
					) : (
						""
					)}

					{ehFindUser.step.on === 2
						? [
								<FormItem key="pwd">
									{getFieldDecorator("newpassword", {
										rules: [
											{
												required: true,
												message: registerLanguage.pwdEmpty
											},
											{
												validator: this.onInputPassword
											}
										]
									})(
										<PwdLevel
											password={this.props.UserStore.ehFindUser.password.value}
											PwdLevel={PwdLevelLanguage}
											placeholder={EhFind.newPassword}
										/>
									)}
								</FormItem>,
								<FormItem key="oldpwd">
									{getFieldDecorator("comfirmnewpassword", {
										rules: [
											{
												required: true,
												message: registerLanguage.confirmPwdEmpty
											},
											{
												validator: this.onInputConfirmPassword
											}
										]
									})(
										<TLInput
											placeholder={forgotLanguage.confirmpassword}
											prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
											type="password"
										/>
									)}
								</FormItem>
						  ]
						: null}
					<FormItem>
						<TLButton
							style={{ width: "280px", marginTop: "61px" }}
							type="primary"
							htmlType="submit"
							loading={ehFindUser.submit.loading}
							onClick={this.onSubmit}
						>
							<span className="eh-df eh-jcc">
								<span
									className="eh-asc"
									style={{ paddingRight: "10px", fontSize: "16px", fontWeight: "100" }}
								>
									{this.curStep === 2 ? EhFind.submit : forgotLanguage.button}
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
				</TLForm>
				<style jsx>
					{`
						.model-content {
							overflow: hidden;
							border: 1px solid #d1d3df;
							border-radius: 3px;

							.model-title {
								overflow: hidden;
								line-height: 48px;
								font-size: 16px;
								color: #198fff;
								text-indent: 10px;
								border-bottom: 1px solid #d1d3df;

								span:first-of-type {
									float: right;
									height: 48px;
									padding-right: 20px;
									background: #198fff;
								}
							}

							.model-code {
								margin: 20px 0;
								img {
									height: 48px;
								}
							}
						}
					`}
				</style>
			</div>
		);
	}
}

const WrappedEhFindUser = Form.create()(EhFindUser);

export default WrappedEhFindUser;
