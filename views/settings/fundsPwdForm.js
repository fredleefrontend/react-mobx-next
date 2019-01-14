import React from 'react';
import SendCodeBtn from '@/components/SendCodeBtn';
import { Form, Input, InputNumber, Icon, Select, Row, Col, Checkbox, Button,message } from 'antd';
import { inject, observer } from 'mobx-react';
import { action, observable, computed } from 'mobx';
import Router from 'next/router';
import Link from 'next/link';
import configs from '../../config';

const FormItem = Form.Item;

@inject("BaseStore", "UserStore")
@Form.create()
@observer
export default class FundsPwdForm extends React.Component {
	@observable email = '';

	constructor(props) {
	  super(props);
	}

	@action
	setFundsAttr = (key, val) => {
	  this[key] = val;
	};

	async componentDidMount() {
	  const { getUserInfo, locale, getSettings, isLogin } = this.props.BaseStore;
	  await getSettings();
	  this.setFundsAttr('email', this.props.BaseStore.userInfo.email);
	}

	checkPassword = (rule, value, callback) => {
	  const Password = this.props.BaseStore.i18n.App.Password;
	  const Common = this.props.BaseStore.i18n.App.Common;
	  const form = this.props.form;
	  // 密码规则验证
	  if (!!value) {
	    console.log(value, value.toString().length, Password);
	    if (value.toString().length < 6) {
	      callback(Password.message.checkLengthErr);
	    } else if (isNaN(value)) {
	      callback(Password.message.checkLengthErr);
	    } else if (value !== form.getFieldValue('confirmfundspwd')) {
	      form.setFieldsValue({ confirmfundspwd: '' });
	    } else {
	      callback();
	    }
	  } else {
	    callback();
	  }
	};

	checkConfirmPassword = (rule, value, callback) => {
	  const form = this.props.form;
	  const Common = this.props.BaseStore.i18n.App.Common;
	  if (!!value) {
	    if (value === form.getFieldValue('fundspwd')) {
	      callback();
	    } else {
	      callback(Common.passwordNoMA);
	    }
	  } else {
	    callback();
	  }
	};

	checkMailValidateCode = () => {};

	handleSubmit = e => {
	  const Password = this.props.BaseStore.i18n.Password;
	  const { capitalPass } = this.props.UserStore;
	  const { locale } = this.props.BaseStore;
	  e.preventDefault();
	  this.props.form.validateFields(async (err, values) => {
	    if (err) return;
	    const method =
				this.props.BaseStore.userInfo &&
				this.props.BaseStore.userInfo.secertStatus &&
				this.props.BaseStore.userInfo.secertStatus
				  ? this.props.BaseStore.userInfo.secertStatus
				  : 0;
	    const res = await this.props.UserStore.capitalPass({
	      capPassword: values.fundspwd,
	      method: method
	    });
	    const result = res.status;
	    if (result && result.success === 1) {
	      const search = Router.asPath;
	      const sval = search.split('=')[1];
	      if (search && sval) {
	        location.href = configs.otcUrl + sval;
	        return;
	      }
	      Router.push(`/${locale}/settings`);
	    } else {
	      message.error(result.message);
	    }
	  });
	};

	render() {
	  const { getFieldDecorator, getFieldsError } = this.props.form;

	  const {
	    i18n,
	    locale,
	    valificationLoading,
	    isAccountExist,
	    valificationId,
	    countSecond,
	    userInfo,
	    hasErrors
	  } = this.props.BaseStore;
	  const loginLanguage = i18n.App.Login;
	  const FundsPwd = i18n.App.FundsPwd;
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
	      <Form onSubmit={this.handleSubmit} className="funds-pwd-form">
	        <FormItem
	          {...formItemLayout}
	          label={userInfo.secertStatus ? FundsPwd.label.newFundsPwd : FundsPwd.label.fundsPwd}
	        >
	          {getFieldDecorator('fundspwd', {
	            rules: [
	              { required: true, message: loginLanguage.userPwdLength },
	              {
	                validator: this.checkPassword
	              }
	            ]
	          })(
	            <Input
	              placeholder={
	                this.props.BaseStore.userInfo.secertStatus
	                  ? FundsPwd.placeholder.editFundsPwd
	                  : FundsPwd.placeholder.setFundsPwd
	              }
	              type="password"
	              maxLength="6"
	            />
	          )}
	        </FormItem>
	        <FormItem {...formItemLayout} label={FundsPwd.label.confirmPwd}>
	          {getFieldDecorator('confirmfundspwd', {
	            rules: [
	              { required: true, message: loginLanguage.userPwdLength },
	              {
	                validator: this.checkConfirmPassword
	              }
	            ]
	          })(
	            <Input placeholder={FundsPwd.placeholder.confirmPwd} type="password" maxLength="6" />
	          )}
	        </FormItem>
	        <FormItem {...formItemLayout} label={FundsPwd.label.email}>
	          {this.email ? (
	            <span>{this.email}</span>
	          ) : (
	            <Link
	              href={{ pathname: `/${locale}/settings/bind2FA`, query: { type: 'email' } }}
	              as={`/${locale}/settings/bind2FA/email`}
	            >
	              <a> {FundsPwd.label.toBindEmail}</a>
	            </Link>
	          )}
	        </FormItem>
	        <FormItem {...formItemLayout} label={FundsPwd.label.emailCode}>
	          <Row>
	            <Col span={15}>
	              {getFieldDecorator('mailcode', {
	                rules: [
	                  {
	                    required: true,
	                    message: loginLanguage.imgVcodeEmpty
	                  }
	                ]
	              })(
	                <Input
	                  className="input-sm"
	                  placeholder={FundsPwd.placeholder.emailCode}
	                  maxLength="6"
	                />
	              )}
	            </Col>
	            <Col span={9} className="mobile-verification-code" style={{ paddingLeft: '40px' }}>
	              <SendCodeBtn
	                value={userInfo.email}
	                type="email"
	                text={FundsPwd.getBtn}
	                isForget={true}
	              />
	            </Col>
	          </Row>
	        </FormItem>
	        <FormItem style={{ textAlign: 'center' }}>
	          <Button type="primary" className="btn-submit" htmlType="submit">
	            {FundsPwd.okBtn}
	          </Button>
	        </FormItem>
	      </Form>
	    </div>
	  );
	}
}
