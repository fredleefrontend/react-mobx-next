import React from 'react';
import { inject, observer } from 'mobx-react';
import { action, observable } from 'mobx';
import Dialog from '../../components/Dialog';
import config from '../../config';
import Router from 'next/router';
import { specialChar1, specialChar2 } from '@/utils/constant';
import configs from '../../config';

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
} from 'antd';

const FormItem = Form.Item;
const InputGroup = Input.Group;
const Option = Select.Option;

@inject("BaseStore")
@observer
class C1AuthForm extends React.Component {
  constructor(props) {
    super(props);
  }
  async componentDidMount() {
    const { getArealist, getSettings, isLogin } = this.props.BaseStore;
    this.props.form.validateFields();
    await getArealist();
    isLogin && (await getSettings());
  }

	handleSubmit = e => {
	  e.preventDefault();
	  const { userInfoC1 } = this.props.BaseStore;
	  this.props.form.validateFieldsAndScroll(async (err, values) => {
	    if (!err) {
	      const res = await userInfoC1(values);
	      if (res.code !== 200) {
	        message.error(res.message);
	        return;
	      }
	      const search = Router.asPath;
	      const sval = search.split('=')[1];
	      if (search && sval) {
	        location.href = configs.otcUrl + sval;
	        return;
	      }
	      //	this.props.callback(this.props.BaseStore.showC1Dialog);
	    }
	  });
	};

	handleOk = () => {
	  const { locale } = this.props.BaseStore;
	  const { getFieldValue } = this.props.form;

	  Router.push({ pathname: `/${locale}/c2Auth` });
	};

	handleCancel = () => {
	  const { locale } = this.props.BaseStore;
	  this.props.BaseStore.showC1Dialog = false;
	  const search = Router.asPath;
	  const sval = search.split('=')[1];
	  if (search && sval) {
	    location.href = configs.otcUrl + sval;
	    return;
	  }
	  Router.push(`/${locale}/settings`);
	};

	render() {
	  const {
	    getFieldDecorator,
	    getFieldsError,
	    getFieldError,
	    getFieldValue,
	    isFieldTouched
	  } = this.props.form;
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
	  const { countSecond, i18n, locale, areaList, hasErrors, showC1Dialog } = this.props.BaseStore;
	  const language = i18n.App.C1Auth;
	  const realNameError = isFieldTouched('realName') && getFieldError('realName');
	  const nationalityError = isFieldTouched('nationalityId') && getFieldError('nationalityId');
	  const credentialError = isFieldTouched('credential') && getFieldError('credential');
	  const credentialCodeError = isFieldTouched('credentialCode') && getFieldError('credentialCode');
	  const dialogConfig = {
	    title: language.title,
	    content: language.content,
	    handleOk: this.handleOk,
	    okText: language.okText,
	    cancelText: language.cancelText,
	    handleCancel: this.handleCancel
	  };
	  const Settings = i18n.App.Settings;
	  let credentialList = [
	    {
	      name: Settings.idCard,
	      value: 1
	    },
	    {
	      name: Settings.passport,
	      value: 2
	    },
	    {
	      name: Settings.driver,
	      value: 3
	    }
	  ];
	  return (
	    <div className="bind-div">
	      <Form className={locale} onSubmit={this.handleSubmit}>
	        <FormItem
	          {...formItemLayout}
	          label={language.name}
	          validateStatus={realNameError ? 'error' : ''}
	          help={realNameError || ''}
	        >
	          {getFieldDecorator('realName', {
	            rules: [
	              {
	                required: true,
	                message: language.realNameError
	              },
	              {
	                validator: (rule, value, cb) => {
	                  specialChar1.test(value) || specialChar2.test(value) ? cb(true) : cb();
	                },
	                message: language.wrongUsername
	              }
	            ]
	          })(<Input placeholder={language.namePlaceholder} />)}
	        </FormItem>
	        <FormItem
	          {...formItemLayout}
	          className="has-select"
	          label={language.country}
	          validateStatus={nationalityError ? 'error' : ''}
	          help={nationalityError || ''}
	        >
	          {getFieldDecorator('nationalityId', {
	            rules: [
	              {
	                required: true,
	                message: language.wrongUsername
	              }
	            ]
	          })(
	            <Select placeholder={language.selectPlaceholder}>
	              {areaList.map((item, index) => {
	                return (
	                  <Option key={item.id} value={item.id}>
	                    <div className="eh-df eh-jcsb">
	                      {/* <span>{item.nationalCode}</span> */}

	                      {locale === 'zh_cn' ? (
	                        <span>{item.national}</span>
	                      ) : (
	                        <span>{item.nationalCode}</span>
	                      )}
	                    </div>
	                  </Option>
	                );
	              })}
	            </Select>
	          )}
	        </FormItem>
	        <FormItem
	          {...formItemLayout}
	          label={language.credentials}
	          validateStatus={credentialError ? 'error' : ''}
	          help={credentialError || ''}
	        >
	          {getFieldDecorator('credential', {
	            rules: [
	              {
	                required: true,
	                message: language.wrongUsername
	              }
	            ]
	          })(
	            <Select placeholder={language.credentialsPlaceholder}>
	              {credentialList.map((item, index) => {
	                return (
	                  <Option key={index} value={item.value}>
	                    {item.name}
	                  </Option>
	                );
	              })}
	            </Select>
	          )}
	        </FormItem>
	        <FormItem
	          {...formItemLayout}
	          label={language.cardId}
	          validateStatus={credentialCodeError ? 'error' : ''}
	          help={credentialCodeError || ''}
	        >
	          {getFieldDecorator('credentialCode', {
	            rules: [
	              {
	                required: true,
	                message: language.credentialCodePlaceholder
	              },
	              {
	                validator: (rule, value, cb) => {
	                  specialChar1.test(value) || specialChar2.test(value) ? cb(true) : cb();
	                },
	                message: language.wrongIDNumber
	              }
	            ]
	          })(<Input placeholder={language.credentialCodePlaceholder} maxLength="50" />)}
	        </FormItem>
	        <FormItem style={{ textAlign: 'center' }}>
	          <Button
	            className="btn-submit"
	            type="primary"
	            htmlType="submit"
	            disabled={hasErrors(getFieldsError())}
	          >
	            {language.button}
	          </Button>
	        </FormItem>
	      </Form>
	      {showC1Dialog ? <Dialog {...dialogConfig} /> : ''}
	    </div>
	  );
	}
}

export default Form.create()(C1AuthForm);
