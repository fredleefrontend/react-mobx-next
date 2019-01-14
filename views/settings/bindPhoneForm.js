import React from "react";
import { inject, observer } from "mobx-react";
import { action, observable } from "mobx";
import Router from "next/router";
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
import utils from "@/utils";

const FormItem = Form.Item;
const InputGroup = Input.Group;
const Option = Select.Option;

@inject("BaseStore", "UserStore")
@observer
class BindPhoneForm extends React.Component {
	@observable isSendcode = true;
	@observable phoneCode = 0;

	constructor(props) {
	  super(props);
	  const { getArealist, areaNumberList } = this.props.BaseStore;
	  getArealist();
	}

	async componentDidMount() {
	  this.props.UserStore.setState(["sendCodeBtn", "phoneArea"], "86");

	  const { locale, getUserInfo } = this.props.BaseStore;
	  await getUserInfo();
	  const hasPhone = await this.props.BaseStore.userInfo.phone;
	  if (hasPhone) {
	    Router.push(`/${locale}/settings`);
	  }
	}

	onInputPhone = async (rule, value, callback) => {
	  const { bindPhoneForm, setState, i18n } = this.props.BaseStore;
	  const { checkUserAccount, isAccountExist } = this.props.UserStore;

	  setState(["bindPhoneForm", "phone", "value"], value);
	  await checkUserAccount({ userName: value });
	  if (!utils.isInternationalPhone(value)) {
	    callback(i18n.App.BindPhone.phoneError);
	    return;
	  }
	  if (isAccountExist) {
	    callback(i18n.App.BindPhone.phoneBound);
	    return;
	  }
	  callback();
	};
	onInputCode = (rule, value, callback) => {
	  const { bindPhoneForm, setState, i18n } = this.props.BaseStore;
	  setState(["bindPhoneForm", "code", "value"], value);
	  if (bindPhoneForm.code.isEmpty) {
	    callback(i18n.App.BindPhone.codeEmpty);
	    return;
	  }
	  callback();
	};
	onSubmit = async () => {
	  const {
	    getFieldDecorator,
	    getFieldsError,
	    getFieldError,
	    getFieldValue,
	    isFieldTouched,
	    resetFields
	  } = this.props.form;
	  const { bindPhoneForm, locale, setState, getInitBindPhoneForm, i18n } = this.props.BaseStore;
	  const { bindPhone } = this.props.UserStore;
	  this.props.form.validateFields(async (err, values) => {
	    if (err) return;
	    setState(["bindPhoneForm", "submit", "loading"], true);
	    let res = await bindPhone({
	      userName: bindPhoneForm.phone.value,
	      code: bindPhoneForm.code.value,
	      phoneArea: getFieldValue("area")
	    });
	    setState(["bindPhoneForm", "submit", "loading"], false);
	    if (this.props.UserStore.isAccountExist) {
	      message.success(i18n.App.BindPhone.bindSuc, 2, () => {
	        //重置当前组件状态
	        setState(["bindPhoneForm"], getInitBindPhoneForm());
	        resetFields();
	        //跳转到制定页面
	        const search = Router.asPath;
	        const sval = search.split("=")[1];
	        if (search && sval) {
	          location.href = configs.otcUrl + sval;
	          return;
	        }
	        Router.push({ pathname: `/${locale}/settings` });
	      });
	      return;
	    }
	    if (res.code === 228) {
	      message.error(i18n.App.BindPhone.accountExist);
	    } else {
	      message.error(res.message);
	    }
	  });
	};
	render() {
	  const {
	    getFieldDecorator,
	    getFieldsError,
	    getFieldError,
	    getFieldValue,
	    isFieldTouched
	  } = this.props.form;
	  const {
	    hasErrors,
	    areaNumberList,
	    countSecond,
	    i18n,
	    locale,
	    sendPhoneCode,
	    bindPhoneForm,
	    sendCode
	  } = this.props.BaseStore;
	  const params = {
	    phone: parseInt(getFieldValue("phone")),
	    area: getFieldValue("area")
	  };
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

	  const prefixSelector = getFieldDecorator("area", {
	    initialValue: "0086"
	  })(
	    <Select
	      style={{ width: 110 }}
	      onChange={val => this.props.UserStore.setState(["sendCodeBtn", "phoneArea"], val)}
	    >
	      <Option value="86">+86</Option>
	      {Array.from(areaNumberList).map((item, index) => {
	        return (
	          <Option key={index} value={item}>
							+{item}
	          </Option>
	        );
	      })}
	    </Select>
	  );

	  const BindPhone = i18n.App.BindPhone;
	  const phoneError = isFieldTouched("phone") && getFieldError("phone");
	  const codeError = isFieldTouched("code") && getFieldError("code");
	  return (
	    <div className="bind-div">
	      <Form className={locale}>
	        <FormItem {...formItemLayout} label={BindPhone.phoneNumbr}>
	          <Row>
	            <Col>
	              {getFieldDecorator("phone", {
	                rules: [
	                  {
	                    required: true,
	                    message: BindPhone.phoneEmpty
	                  },
	                  {
	                    validator: this.onInputPhone
	                  }
	                ]
	              })(
	                <Input
	                  addonBefore={prefixSelector}
	                  className="input-sm"
	                  placeholder={BindPhone.phonePlaceHolder}
	                  maxLength={11}
	                  onChange={e => (this.phoneCode = e.target.value)}
	                />
	              )}
	            </Col>
	          </Row>
	        </FormItem>
	        <FormItem {...formItemLayout} label={BindPhone.smsCode}>
	          <Row>
	            <Col span={15}>
	              {getFieldDecorator("code", {
	                rules: [
	                  {
	                    required: true,
	                    message: BindPhone.phoneCodeEmpty
	                  },
	                  {
	                    validator: this.onInputCode
	                  }
	                ]
	              })(<Input placeholder={BindPhone.codePlaceHolder} className="input-sm" />)}
	            </Col>
	            <Col span={9} className="mobile-verification-code">
	              <SendCodeBtn
	                value={this.phoneCode}
	                type="phone"
	                text={BindPhone.getCode}
	                isForget={false}
	                accountErrorCb={() => {
	                  const error = BindPhone.phoneLegal;
	                  message.error(error);
	                }}
	              />
	            </Col>
	          </Row>
	        </FormItem>
	        <FormItem style={{ textAlign: "center" }}>
	          <Button
	            className="btn-submit"
	            type="primary"
	            htmlType="submit"
	            onClick={this.onSubmit}
	            loading={bindPhoneForm.submit.loading}
	            disabled={!bindPhoneForm.code.validate}
	          >
	            {BindPhone.button}
	          </Button>
	        </FormItem>
	      </Form>

	      <style jsx>{`
					.bind-div {
						.ant-form {
							.mobile-verification-code {
								.bwtHCA {
									margin-left: -23px !important;
								}
							}
						}
					}
				`}</style>
	    </div>
	  );
	}
}

export default Form.create()(BindPhoneForm);
