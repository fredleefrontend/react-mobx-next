import React from "react";
import { inject, observer } from "mobx-react";
import { action, observable, computed } from "mobx";
import Link from "next/link";
import { Form, Input, Modal, Icon, Select, Row, Col, Button, Checkbox, message } from "antd";
import { TLInput, TLButton, TLForm, TLModal, TLSelect, TLCheckbox } from "@/tuli-ui";

import Router from "next/router";
import EhInputCode from "@/components/user/EhInputCode";

const FormItem = Form.Item;
const { Option, OptGroup } = Select;
import PwdLevelPassword from "../../components/PwdLevel";

function hasErrors(fieldsError) {
	return Object.keys(fieldsError).some(field => fieldsError[field]);
}

@inject("BaseStore")
@inject("UserStore")
@Form.create()
@observer
export default class RegistrationForm extends React.Component {
	@observable username = "";
	@observable type = "email";
	@observable areaName = "China";
	@observable areaId = "0086";
	@observable nationalityId = 37;
	@observable vcodeVisible = false;
	@observable password = "";
	@observable imgVcode = "";
	@observable popLoading = false;
	@observable isNotChecked = true;
	@observable isFirstChecked = true;

	@computed
	get loginStatus() {
		return this.props.BaseStore.isLogin;
	}

	@computed
	get lang() {
		return this.props.BaseStore.locale;
	}

	@action
	setRegAttr = (key, value) => {
		this[key] = value;
	};

	constructor(props) {
		super(props);
		this.state = {
			username: ""
		};
	}

	componentDidMount() {
		if (this.loginStatus) {
			Router.push(`/${this.lang}/trade`);
			return;
		}
		const { sendCode } = this.props.UserStore;
		const { getArealist } = this.props.BaseStore;
		sendCode();
		getArealist();
	}

	handleSubmit = e => {
		e.preventDefault();
		const { validateFields, setFields } = this.props.form;
		const { userRegister, ehInputCode } = this.props.UserStore;
		const { locale, i18n } = this.props.BaseStore;
		const registerLanguage = i18n.App.Register;

		this.props.form.validateFields(
			[this.type, "validatecode", "password", "confirmPassword", "agreement"],
			{ first: true, force: true },
			async (err, values) => {
				if (err) return;
				let params = {
					userName: values[this.type],
					password: values.confirmPassword,
					code: ehInputCode[this.type].code,
					phoneArea: this.areaId,
					nationalityId: this.nationalityId
				};
				if (this.isNotChecked) {
					this.isFirstChecked = false;
					return;
				}
				if (!values.agreement) {
					message.error(registerLanguage.agreementAgree.join(""));
					return;
				}
				let res = await userRegister(params);
				if (this.props.UserStore.registerSuccess) {
					message.success(registerLanguage.registerSuccess);
					//注册完回填账号
					this.props.UserStore.setState(["ehLogin", "username", "value"], params.userName);
					Router.push({ pathname: `/${locale}/settings/login` });
				} else if (this.props.UserStore.isAccountExist) {
					message.error(registerLanguage.isAccountExsist);
				} else {
					message.error(res.message);
				}
			}
		);
	};

	checkPassword = (rule, value, callback) => {
		const registerLanguage = this.props.BaseStore.i18n.App.Register;
		const form = this.props.form;
		this.setRegAttr("password", value);
		if (!!value) {
			if (
				value.length > 7 &&
				/^(?![\d]+$)(?![a-zA-Z]+$)(?![!#$%^&*]+$)[\da-zA-Z!#$%^&*]/.test(value) &&
				!/\s/.test(value)
			) {
				callback();
			} else {
				callback(registerLanguage.pwdTypeError);
			}
		} else {
			callback();
		}
	};

	checkComfirmPassword = (rule, value, callback) => {
		const form = this.props.form;
		const registerLanguage = this.props.BaseStore.i18n.App.Register;
		if (!!value) {
			if (value.trim() === form.getFieldValue("password")) {
				callback();
			} else {
				callback(registerLanguage.pwdNotSame);
			}
		} else {
			callback();
		}
	};

	validatePhone = (rule, value, callback) => {
		const form = this.props.form;
		const registerLanguage = this.props.BaseStore.i18n.App.Register;
		let pattern = /^\d{4,}$/;
		let chinaPhone = /^[1][3,4,5,7,8][0-9]{9}$/;
		if (!!value) {
			if ((this.areaId === "0086" && !chinaPhone.test(value)) || !pattern.test(value)) {
				callback(registerLanguage.register.phone.accountTypeError);
			} else {
				callback();
			}
		} else {
			callback();
		}
	};

	handleSelectChange = val => {
		let prePhone = Array.from(this.props.BaseStore.areaList).filter(item => item.id === val)[0];
		const { locale } = this.props.BaseStore;
		this.setRegAttr("areaName", locale == "zh_cn" ? prePhone.national : prePhone.nationalCode);
		this.setRegAttr("areaId", prePhone.areaid);
		this.props.UserStore.setState(["sendCodeBtn", "phoneArea"], prePhone.areaid);
		this.setRegAttr("nationalityId", prePhone.id);
		const { resetFields } = this.props.form;
		resetFields("phone");
	};

	handleNumberChange = val => {
		let prePhone = Array.from(this.props.BaseStore.areaList).filter(item => item.id === val)[0];
		this.setRegAttr("areaId", prePhone.areaid);
		//为sendCodeBtn组件设置区号
		this.props.UserStore.setState(["sendCodeBtn", "phoneArea"], prePhone.areaid);
		const { resetFields } = this.props.form;
		resetFields("phone");
	};

	getVcode = () => {
		this.props.form.validateFields([this.type], { first: true }, (err, values) => {
			if (!err) {
				this.setRegAttr("vcodeVisible", true);
			}
		});
	};

	handleCancel = () => {
		this.setRegAttr("imgVcode", "");
		this.setRegAttr("vcodeVisible", false);
	};

	handleOk = async () => {
		const { i18n } = this.props.BaseStore;
		const registerLanguage = i18n.App.Register;

		if (!this.imgVcode) {
			message.error(registerLanguage.enterVCode);
			return;
		}
		this.setRegAttr("popLoading", true);
		let userName = this.props.form.getFieldValue(this.type);
		await this.props.UserStore.sendVerificationCode({ userName, captcha: this.imgVcode });
		this.setRegAttr("popLoading", false);
		this.setRegAttr("vcodeVisible", false);
		this.setRegAttr("imgVcode", "");
		if (this.props.UserStore.isSendCodeSuccess) {
			message.success(registerLanguage.register[this.type].vCodeSendSuccess);
		} else {
			if (this.props.UserStore.isAccountExist) {
				this.props.form.setFields({
					[this.type]: {
						value: this.props.form.getFieldValue(this.type),
						errors: [new Error(registerLanguage.register[this.type].isAccountExsist)]
					}
				});
			} else {
				message.error(registerLanguage.paramsError);
			}
		}
	};

	imgVcodeChange = e => {
		this.setRegAttr("imgVcode", e.target.value.trim());
	};

	handleCheckbox = e => {
		this.setRegAttr("isNotChecked", !e.target.checked);
		this.setRegAttr("isFirstChecked", false);
	};

	handleVcodeBlur = async e => {
		const { checkVerificationCode } = this.props.UserStore;
		const { i18n } = this.props.BaseStore;
		const registerLanguage = i18n.App.Register;
		let userName = this.props.form.getFieldValue(this.type);
		if (!!userName && e.target.value && e.target.value.length === 6) {
			let params = {
				userName,
				code: e.target.value.trim(),
				areaId: this.areaId
			};

			await checkVerificationCode(params);
			if (
				!this.props.UserStore.isPMCodeCorrect.email &&
				!this.props.UserStore.isPMCodeCorrect.phone
			) {
				this.props.form.setFields({
					validatecode: {
						value: params.code,
						errors: [new Error(registerLanguage.register[this.type].vVodeError)]
					}
				});
			}
		}
	};

	render() {
		const { getFieldDecorator, getFieldValue, resetFields, setFields } = this.props.form;
		const { i18n, locale, valificationLoading, areaList, areaNumberList } = this.props.BaseStore;
		const registerLanguage = i18n.App.Register;
		const {
			registerLoading,
			imgParameter,
			sendCode,
			countSecond,
			isPMCodeCorrect,
			isSendCodeSuccess
		} = this.props.UserStore;
		const PwdLevel = i18n.App.PwdLevel;
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

		const prefixPhoneSelector = (
			<TLSelect
				onChange={this.handleNumberChange}
				defaultActiveFirstOption={true}
				dropdownMatchSelectWidth={false}
				dropdownStyle={{ width: 336 }}
				value={this.areaId}
				style={{ width: "100px" }}
			>
				<OptGroup label={registerLanguage.frequentlyUsed}>
					{Array.from(areaList)
						.filter(area => area.sort > 0)
						.sort((a, b) => b.sort - a.sort)
						.map((item, index) => {
							return (
								<Option value={item.id} key={item.id}>
									<div className="eh-df eh-jcsb">
										<span>{item.nationalCode}</span>
										<span>{item.areaid}</span>
									</div>
								</Option>
							);
						})}
				</OptGroup>
				<OptGroup label={registerLanguage.allCountry}>
					{Array.from(areaList).map((item, index) => {
						return (
							<Option value={item.id} key={item.id}>
								<div className="eh-df eh-jcsb">
									<span>{item.nationalCode}</span>
									<span>{item.areaid}</span>
								</div>
							</Option>
						);
					})}
				</OptGroup>
			</TLSelect>
		);

		const registerTypes = {
			phone: {
				name: registerLanguage.register.phone.type,
				firstInput: () => (
					<FormItem
						{...formItemLayout}
						help={this.phoneHelp}
						validateStatus={this.phoneValidateStatus}
					>
						{getFieldDecorator("phone", {
							rules: [
								{
									required: true,
									message: registerLanguage.register.phone.accountPlaceholder
								},
								{
									validator: this.validatePhone
								}
							]
						})(
							<TLInput
								maxLength="11"
								addonBefore={prefixPhoneSelector}
								placeholder={registerLanguage.register.phone.accountPlaceholder}
							/>
						)}
					</FormItem>
				)
			},
			email: {
				name: registerLanguage.register.email.type,
				firstInput: () => (
					<FormItem {...formItemLayout}>
						{getFieldDecorator("email", {
							rules: [
								{
									type: "email",
									message: registerLanguage.register.email.accountTypeError
								},
								{
									required: true,
									message: registerLanguage.register.email.accountPlaceholder
								}
							]
						})(
							<TLInput
								maxLength="50"
								prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
								placeholder={registerLanguage.register.email.accountPlaceholder}
							/>
						)}
					</FormItem>
				)
			}
		};
		return (
			<div className="register-content" style={{ position: "relative" }}>
				{Object.keys(registerTypes).map((item, index) => {
					return (
						<span
							style={{
								display: item === this.type ? "none" : "inline-block",
								fontSize: "12px",
								color: "#7f60ed",
								position: "absolute",
								top: "-68px",
								left: "160px",
								cursor: "pointer"
							}}
							key={index}
							onClick={() => {
								if (
									this.props.UserStore.ehInputCode.email.isCounting ||
									this.props.UserStore.ehInputCode.phone.isCounting
								) {
									//重置状态
									clearInterval(this.props.UserStore.ehInputCode.email.timer);
									clearInterval(this.props.UserStore.ehInputCode.phone.timer);
									clearInterval();
									this.props.UserStore.setState(
										["ehInputCode"],
										this.props.UserStore.getInitEhInputCode()
									);
								}
								this.setRegAttr("type", item);
								this.props.UserStore.clearCountDown();
								this.props.UserStore.setState(
									["ehInputCode", this.type == "email" ? "phone" : "email", "code"],
									""
								);
								resetFields();
							}}
						>
							{registerTypes[item].name}
							<Icon type="arrow-right" style={{ color: "#7f60ed" }} />
						</span>
					);
				})}
				<TLForm onSubmit={this.handleSubmit} className={locale}>
					<FormItem {...formItemLayout}>
						<TLSelect
							dropdownClassName="rb-select-drop"
							className="rb-select"
							onChange={this.handleSelectChange}
							defaultActiveFirstOption={true}
							value={this.areaName}
						>
							<OptGroup label={registerLanguage.frequentlyUsed}>
								{Array.from(areaList)
									.filter(area => area.sort > 0)
									.sort((a, b) => b.sort - a.sort)
									.map((item, index) => {
										return (
											<Option value={item.id} item={item} key={item.id}>
												<div className="op-style">
													<span>{item.nationalCode}</span>
													{locale === "zh_cn" ? (
														<span>{item.national}</span>
													) : (
														<span>{item.nationalCode}</span>
													)}
												</div>
											</Option>
										);
									})}
							</OptGroup>
							<OptGroup label={registerLanguage.allCountry}>
								{Array.from(areaList).map((item, index) => {
									return (
										<Option value={item.id} item={item} key={item.id}>
											<div className="op-style">
												<span>{item.nationalCode}</span>
												{locale === "zh_cn" ? (
													<span>{item.national}</span>
												) : (
													<span>{item.nationalCode}</span>
												)}
											</div>
										</Option>
									);
								})}
							</OptGroup>
						</TLSelect>
					</FormItem>
					{registerTypes[this.type].firstInput()}
					<FormItem {...formItemLayout}>
						{this.type == "email" ? (
							<EhInputCode type="email" value={getFieldValue(this.type)} page="enroll" />
						) : (
							<EhInputCode type="phone" value={getFieldValue(this.type)} page="enroll" />
						)}
					</FormItem>
					<FormItem {...formItemLayout}>
						{getFieldDecorator("password", {
							initialValue: "",
							rules: [
								{
									required: true,
									message: registerLanguage.pwdEmpty
								},
								{
									validator: this.checkPassword
								}
							]
						})(
							<PwdLevelPassword
								placeholder={registerLanguage.pwdEmpty}
								password={this.password}
								PwdLevel={PwdLevel}
							/>
						)}
					</FormItem>
					<FormItem {...formItemLayout}>
						{getFieldDecorator("confirmPassword", {
							rules: [
								{
									required: true,
									message: registerLanguage.confirmPwdEmpty
								},
								{
									validator: this.checkComfirmPassword
								}
							]
						})(
							<TLInput
								prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
								placeholder={registerLanguage.confirmPwdEmpty}
								type="password"
							/>
						)}
					</FormItem>
					<FormItem>
						{getFieldDecorator("agreement", {
							valuePropName: "checked",
							initialValue: !this.isNotChecked
						})(
							<TLCheckbox onChange={this.handleCheckbox}>
								{registerLanguage.agreementAgree[3]}
								{/* <Link target="_blank" href={{ pathname: `/${locale}/footer/privacy`, query: {} }}>
									
								</Link> */}
								<a style={{ paddingLeft: "5px" }} href={`/${locale}/footer/terms`} target="_blank">
									{registerLanguage.agreementAgree[1]}
								</a>
								{this.isNotChecked && !this.isFirstChecked ? (
									<span style={{ color: "red", paddingLeft: "5px" }}>
										{registerLanguage.isChecked}
									</span>
								) : null}
							</TLCheckbox>
						)}
						<TLButton
							type="primary"
							htmlType="submit"
							style={{ height: "40px" }}
							loading={registerLoading}
							style={{ width: "280px" }}
						>
							{registerLanguage.createAccont}
						</TLButton>
						<div style={{ fontSize: "14px", marginTop: "22px" }}>
							<span>{registerLanguage.hadAccount[0]}&nbsp;&nbsp;</span>
							<Link href={`/${locale}/settings/login`} as={`/${locale}/login`}>
								<a style={{ color: "#7f60ed" }}>{registerLanguage.hadAccount[1]}</a>
							</Link>
						</div>
					</FormItem>
				</TLForm>
				<style jsx>
					{`
						.register-content {
							width: 500px;
							margin: 0 auto;
						}
					`}
				</style>
			</div>
		);
	}
}
