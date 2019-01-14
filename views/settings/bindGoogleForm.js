import React from 'react';
import { inject, observer } from 'mobx-react';
import { action, observable, computed } from 'mobx';
import router from 'next/router';
import SendCodeBtn from '../../components/SendCodeBtn';
import { Form, Input, Row, Col, Checkbox, Button, message } from 'antd';
import Link from 'next/link';
import Router from 'next/router';
import configs from '../../config';

const FormItem = Form.Item;

@inject("BaseStore", "UserStore")
@observer
class BindGoogleForm extends React.Component {
	@observable backupCheck = false;
	@observable checkDisabled = true;

	@action
	setBindGoogleAttr = (key, value) => {
	  this[key] = value;
	};

	constructor(props) {
	  super(props);
	}

	static defaultProps = {
	  bind: true
	};

	async componentDidMount() {
	  const { getUserInfo, locale, getSettings } = this.props.BaseStore;
	  await getSettings();
	  await getUserInfo();
	  const googleBinded = this.props.BaseStore.userInfo.googleBinded;
	  if (
	    (googleBinded === true && this.props.bind === true) ||
			(googleBinded === false && this.props.bind === false)
	  ) {
	    Router.push(`/${locale}/settings`);
	  }
	}

	onSubmit = e => {
	  e.preventDefault();
	  const { bindGoogle, UnBindGoogle, googleSecretKey } = this.props.UserStore;
	  const { userInfo, locale, i18n } = this.props.BaseStore;
	  const Google = i18n.App.Google;
	  this.props.form.validateFields({ first: true, force: true }, async (err, values) => {
	    if (err) return;
	    let params = {
	      username: userInfo.email,
	      secretKey: googleSecretKey,
	      code: values.googleCode,
	      password: values.password,
	      emailCode: values.emailcode
	    };
	    if (this.props.bind && !values.backup) {
	      this.props.form.setFields({
	        backup: {
	          value: values.backup,
	          errors: [new Error(Google.GLD.Check_secretkey)]
	        }
	      });
	      return;
	    }
	    this.props.form.validateFields(async (err, values) => {
	      if (err) return;
	      let res = this.props.bind ? await bindGoogle(params) : await UnBindGoogle(params);

	      // let code;
	      // this.props.bind ? (code = res.code) : (code = res.code);
	      if (res.code === 200) {
	        message.success(this.props.bind ? Google.GLD.Binding_success : Google.GLD.Untie_success);
	        this.props.form.resetFields();
	        const search = Router.asPath;
	        const sval = search.split('=')[1];
	        if (search && sval) {
	          location.href = configs.otcUrl + sval;
	          return;
	        }
	        Router.push(`/${locale}/settings`);
	      } else {
	        message.error(res.message);
	      }
	    });
	  });
	};

	handleCheckbox = (rule, value, cb) => {};

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
	  const { locale, i18n, userName, userInfo, hasErrors } = this.props.BaseStore;
	  const { imgParameter, countSecond } = this.props.UserStore;
	  // const language = i18n.App.AccountDetail;
	  const Google = i18n.App.Google;

	  const { getFieldDecorator, getFieldValue, getFieldsError } = this.props.form;

	  return (
	    <div className="bind-div">
	      <Form className="google-form" style={{ paddingTop: '22px' }}>
	        <FormItem {...formItemLayout} label={Google.GLD.email}>
	          {userInfo.hasEmail ? (
	            <span>{userInfo.email}</span>
	          ) : (
	            <Link
	              href={{ pathname: `/${locale}/settings/bind2FA`, query: { type: 'email' } }}
	              as={`/${locale}/settings/bind2FA/email`}
	            >
	              <a> {Google.GLD.gobdemail}</a>
	            </Link>
	          )}
	        </FormItem>
	        <FormItem {...formItemLayout} label={Google.GLD.loginpwd}>
	          {getFieldDecorator('password', {
	            rules: [
	              {
	                required: true,
	                message: Google.GLD.loginpwdnoempty
	              }
	            ]
	          })(<Input placeholder={Google.GLD.enterloginpwd} type="password" maxLength="50" />)}
	        </FormItem>
	        <FormItem {...formItemLayout} label={Google.GLD.emailyzm}>
	          <Row>
	            <Col span={15}>
	              {getFieldDecorator('emailcode', {
	                rules: [
	                  {
	                    required: true,
	                    message: Google.GLD.emailyznoempty
	                  },
	                  {
	                    validator: this.onInput
	                  }
	                ]
	              })(
	                <Input
	                  placeholder={Google.GLD.enteremailyzm}
	                  className="input-sm"
	                  maxLength="6"
	                />
	              )}
	            </Col>
	            <Col span={2} className="mobile-verification-code">
	              <SendCodeBtn
	                type="email"
	                value={userInfo.email}
	                text={Google.GLD.getyz}
	                isForget={true}
	              />
	            </Col>
	          </Row>
	        </FormItem>
	        <FormItem {...formItemLayout} label={Google.GLD.googleyzm}>
	          {getFieldDecorator('googleCode', {
	            rules: [
	              {
	                required: true,
	                message: Google.GLD.glyznoempty
	              }
	            ]
	          })(<Input placeholder={Google.GLD.enterglyzm} maxLength="6" />)}
	        </FormItem>

	        {this.props.bind && (
	          <FormItem {...formItemLayout} label=" ">
	            {getFieldDecorator('backup', {
	              valuePropName: 'checked',
	              initialValue: false,
	              rules: [
	                {
	                  required: true
	                }
	              ]
	            })(<Checkbox>{Google.GLD.yzbakmiyao}</Checkbox>)}
	          </FormItem>
	        )}
	        <FormItem {...formItemLayout} label=" ">
	          <Button
	            className="btn-submit"
	            type="primary"
	            htmlType="submit"
	            onClick={this.onSubmit}
	            disabled={hasErrors(getFieldsError())}
	          >
	            {Google.GLD.confirm}
	          </Button>
	        </FormItem>
	      </Form>
	      <style jsx>{`
					.bind-div {
						width: 100%;
					}
				`}</style>
	    </div>
	  );
	}
}

export default Form.create()(BindGoogleForm);
