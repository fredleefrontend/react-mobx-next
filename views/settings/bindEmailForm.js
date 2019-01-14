import React from "react";
import { inject, observer } from "mobx-react";
import { action, observable, computed } from "mobx";
import Router from "next/router";
import { email } from "@/utils/constant";
import SendCodeBtn from "@/components/SendCodeBtn";
import configs from "../../config";

import {
  Form,
  Input,
  Tooltip,
  Icon,
  Cascader,
  Select,
  Row,
  Col,
  Checkbox,
  Button,
  AutoComplete,
  Modal,
  message
} from "antd";

const FormItem = Form.Item;
const InputGroup = Input.Group;
const Option = Select.Option;

let emailTimer = null;

@inject("BaseStore", "UserStore")
@observer
class BindEmailForm extends React.Component {
	@observable emailCode = 0;

	constructor(props) {
	  super(props);
	  const { sendCode } = this.props.UserStore;
	  sendCode();
	}

	async componentDidMount() {
	  const { userInfo, locale, getUserInfo } = this.props.BaseStore;
	  await getUserInfo();
	  const hasEmail = userInfo.hasEmail;
	  if (hasEmail) {
	    Router.push(`/${locale}/settings`);
	  }
	}

  @computed
	get validateCode() {
	  const { bindEmailForm } = this.props.BaseStore;
	  return bindEmailForm.code.validate;
	}

	onInput = async (e, value, callback) => {
	  const field = e.field;
	  const { getFieldValue } = this.props.form;
	  const { setState, bindEmailForm, i18n } = this.props.BaseStore;
	  const BindEmail = i18n.App.BindEmail;
	  const { sendVerificationCode } = this.props.UserStore;
	  if (field == "email") {
	    setState(["bindEmailForm", "email", "value"], getFieldValue("email"));
	    //这里要检查用户邮箱是否存在
	    if (emailTimer) {
	      clearTimeout(emailTimer);
	      emailTimer = null;
	    }
	    emailTimer = setTimeout(async () => {
	      await this.props.UserStore.checkUserAccount({ userName: value });
	      console.log("aa", bindEmailForm.email.isEmail);
	      if (!bindEmailForm.email.isEmail) {
	        this.props.form.setFields({
	          email: {
	            value,
	            errors: [new Error(BindEmail.isEmail)]
	          }
	        });
	        return;
	      }
	      if (this.props.UserStore.isAccountExist) {
	        this.props.form.setFields({
	          email: {
	            value,
	            errors: [new Error(BindEmail.existEmail)]
	          }
	        });
	        return;
	      }
	    }, 500);
	    // await this.props.UserStore.checkUserAccount({ userName: value });
	    // if (!bindEmailForm.email.isEmail) {
	    // 	callback(BindEmail.isEmail);
	    // 	return;
	    // }
	    // if (this.props.UserStore.isAccountExist) {
	    // 	callback(BindEmail.existEmail);
	    // 	return;
	    // }
	    // callback();
	  }
	  if (field == "verify") {
	    setState(["bindEmailForm", "verify", "value"], getFieldValue("verify"));
	    if (!value || value.length < 5) {
	      callback(BindEmail.isCode);
	      return;
	    }
	    callback();
	  }
	  if (field == "code") {
	    setState(["bindEmailForm", "code", "value"], getFieldValue("code"));
	    if (!value || value.length < 6) {
	      callback(BindEmail.isCode);
	      return;
	    }
	    callback();
	  }
	};

	onSubmit = async () => {
	  const { getFieldValue } = this.props.form;
	  const {
	    setState,
	    bindEmailForm: {
	      email: { isEmail, isEmpty }
	    },
	    i18n
	  } = this.props.BaseStore;

	  const BindEmail = i18n.App.BindEmail;

	  const checkVerRes = await this.props.UserStore.checkVerificationCode({
	    userName: getFieldValue("email"),
	    code: getFieldValue("code")
	  });
	  if (checkVerRes.code !== 200) {
	    message.error(checkVerRes.message);
	    return;
	  }

	  if (!isEmail || isEmpty) {
	    message.warning(BindEmail.isEmail);
	    return;
	  }
	  if (this.props.BaseStore.root.user.isAccountExist) {
	    message.warning(BindEmail.existEmail);
	    return;
	  }
	  if (
	    !this.props.UserStore.isPMCodeCorrect.email &&
			!this.props.UserStore.isPMCodeCorrect.phone
	  ) {
	    message.warning(BindEmail.emailCode);
	    return;
	  }
	  const { bindEmail } = this.props.UserStore;
	  const { userInfo, locale } = this.props.BaseStore;
	  this.props.form.validateFields(async (err, values) => {
	    if (err) return;
	    setState(["bindEmailForm", "submit", "loading"], true);
	    const res = await bindEmail({
	      userName: getFieldValue("email"),
	      code: getFieldValue("code")
	    });
	    setState(["bindEmailForm", "submit", "loading"], false);
	    if (this.props.BaseStore.root.user.isAccountExist) {
	      message.success(BindEmail.bindSuc);
	      //跳转到制定页面
	      const search = Router.asPath;
	      const sval = search.split("=")[1];
	      if (search && sval) {
	        location.href = configs.otcUrl + sval;
	        return;
	      }
	      Router.push({ pathname: `/${locale}/settings` });
	    } else {
	      message.error(res.message);
	    }
	  });
	};

	sendVerificationCode = async () => {
	  const {
	    sendVerificationCode,
	    sendCodeBtn,
	    error: {
	      verificationCode: { limit60s }
	    }
	  } = this.props.UserStore;
	  const { getFieldValue } = this.props.form;
	  await sendVerificationCode({
	    captcha: sendCodeBtn.verify.value,
	    userName: getFieldValue("email")
	  });
	  if (limit60s) {
	    message.warning(limit60s);
	  }
	};

	render() {
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
	  const { locale, i18n, bindEmailForm } = this.props.BaseStore;
	  const {
	    imgParameter,
	    countSecond,
	    userBingingStatus,
	    isAccountExist,
	    root
	  } = this.props.UserStore;
	  const language = i18n.App.AccountDetail;
	  const BindEmail = i18n.App.BindEmail;
	  const { getFieldDecorator, getFieldValue } = this.props.form;

	  return (
	    <div className="bind-div">
	      <Form className={locale}>
	        {/* {isAccountExist ? "true" : "false"}
				{root.user.isAccountExist ? "true" : "false"} */}
	        <FormItem {...formItemLayout} label={BindEmail.emailLab.Id}>
	          <Row>
	            <Col>
	              {getFieldDecorator("email", {
	                rules: [
	                  {
	                    required: true,
	                    message: BindEmail.emptyMes.email
	                  },
	                  {
	                    validator: this.onInput
	                  }
	                ]
	              })(<Input maxLength="50" placeholder={BindEmail.placeholder.Id} />)}
	            </Col>
	          </Row>
	        </FormItem>
	        <FormItem {...formItemLayout} label={BindEmail.emailLab.code}>
	          <Row>
	            <Col span={15}>
	              {getFieldDecorator("code", {
	                rules: [
	                  {
	                    required: true,
	                    message: BindEmail.emptyMes.code
	                  },
	                  {
	                    validator: this.onInput
	                  }
	                ]
	              })(<Input placeholder={BindEmail.placeholder.code} className="input-sm" />)}
	            </Col>
	            <Col span={9} className="mobile-verification-code">
	              <SendCodeBtn
	                value={getFieldValue("email")}
	                text={BindEmail.gain}
	                type="email"
	                isForget={false}
	              />
	            </Col>
	          </Row>
	        </FormItem>
	        {""}
	        <FormItem style={{ textAlign: "center" }}>
	          <Button
	            className="btn-submit"
	            type="primary"
	            htmlType="submit"
	            loading={bindEmailForm.submit.loading}
	            onClick={this.onSubmit}
	            disabled={!bindEmailForm.code.value}
	          >
	            {language.okBtn}
	          </Button>
	        </FormItem>
	      </Form>
	    </div>
	  );
	}
}

export default Form.create()(BindEmailForm);
