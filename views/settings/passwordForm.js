import React from "react";
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
  message,
  AutoComplete
} from "antd";
import { inject, observer } from "mobx-react";
import { observable, action, runInAction, computed } from "mobx";
import { Provider } from "mobx-react";
import Link from "next/link";
import Router from "next/router";
const FormItem = Form.Item;
const Option = Select.Option;
const AutoCompleteOption = AutoComplete.Option;
import configs from "../../config";

function hasErrors(fieldsError, isShowCode) {
  if (isShowCode === "false" || !isShowCode) {
    fieldsError["secret"] = null; //如果首次登陆不需要验证码
  }
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

@inject("BaseStore", "UserStore")
@Form.create()
@observer
export default class PasswordForm extends React.Component {
  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    const { getSettings, isLogin } = this.props.BaseStore;
    if (isLogin) {
      await getSettings();
    }
  }

	handleSubmit = e => {
	  const { openNotificationWithIcon, userLogout, locale, i18n } = this.props.BaseStore;
	  const { modifyPassword } = this.props.UserStore;
	  e.preventDefault();
	  this.props.form.validateFieldsAndScroll(async (err, values) => {
	    if (err) {
	      return;
	    }
	    let res = await modifyPassword({
	      oldPassword: values.oldpassword,
	      newPassword: values.newpassword
	    });
	    if (res === null || res.code === 200) {
	      userLogout();
	      // Router.push({ pathname: `/${locale}/settings` });
	    } else {
	      message.error(res.message);
	      // openNotificationWithIcon("error", "错误信息", "修改密码失败！");
	    }
	  });
	};

	checkPassword = (rule, value, callback) => {
	  const registerLanguage = this.props.BaseStore.i18n.App.Register;
	  const PassWordForm = this.props.BaseStore.i18n.App.Password;
	  const form = this.props.form;
	  // 密码规则验证
	  const pattern = /((?=.*[a-z])(?=.*\d)|(?=[a-z])(?=.*[#@!~%^&*])|(?=.*\d)(?=.*[#@!~%^&*]))[a-z\d#@!~%^&*]{8,14}/i;

	  if (!!value) {
	    if (pattern.test(value.trim())) {
	      if (value.trim() === form.getFieldValue("oldpassword")) {
	        callback(PassWordForm.message.checkErr);
	      } else {
	        callback();
	      }
	    } else {
	      callback(registerLanguage.userPasswordLength);
	    }
	  } else {
	    callback();
	  }
	};

	checkComfirmPassword = (rule, value, callback) => {
	  const form = this.props.form;
	  const Common = this.props.BaseStore.i18n.App.Common;
	  if (!!value) {
	    if (value.trim() === form.getFieldValue("newpassword")) {
	      callback();
	    } else {
	      callback(Common.passwordNoMA);
	    }
	  } else {
	    callback();
	  }
	};

	render() {
	  const { getFieldDecorator, getFieldsError, isFieldTouched, getFieldError } = this.props.form;
	  const { i18n, locale } = this.props.BaseStore;
	  const loginLanguage = i18n.App.Login;
	  const PassWordForm = i18n.App.Password;
	  const formItemLayout = {
	    labelCol: {
	      xs: { span: 24 },
	      sm: { span: 8 }
	    },
	    wrapperCol: {
	      xs: { span: 24 },
	      sm: { span: 16 }
	    }
	  };

	  return (
	    <div className="bind-div">
	      <Form onSubmit={this.handleSubmit} className="password-form">
	        <FormItem {...formItemLayout} label={PassWordForm.PwLabel.oldPassword}>
	          {getFieldDecorator("oldpassword", {
	            rules: [
	              {
	                required: true,
	                message: PassWordForm.message.oldPassword
	              }
	            ]
	          })(<Input placeholder={PassWordForm.PwPlaceholder.oldPassword} type="password" />)}
	        </FormItem>
	        <FormItem {...formItemLayout} label={PassWordForm.PwLabel.newPassword}>
	          {getFieldDecorator("newpassword", {
	            rules: [
	              {
	                required: true,
	                message: loginLanguage.userPwdLength
	              },
	              {
	                validator: this.checkPassword
	              }
	            ]
	          })(<Input placeholder={PassWordForm.PwPlaceholder.newPassword} type="password" />)}
	        </FormItem>
	        <FormItem {...formItemLayout} label={PassWordForm.PwLabel.confirmPw}>
	          {getFieldDecorator("confirmpassword", {
	            rules: [
	              {
	                required: true,
	                message: loginLanguage.userPwdLength
	              },
	              {
	                validator: this.checkComfirmPassword
	              }
	            ]
	          })(<Input placeholder={PassWordForm.PwPlaceholder.confirmPw} type="password" />)}
	        </FormItem>
	        <FormItem style={{ textAlign: "center" }}>
	          <Button type="primary" className="btn-submit" htmlType="submit">
	            {PassWordForm.confirm}
	          </Button>
	        </FormItem>
	      </Form>
	    </div>
	  );
	}
}
