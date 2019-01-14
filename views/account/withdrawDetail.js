import React from "react";
import {
  Table,
  Tabs,
  Form,
  Row,
  Col,
  Checkbox,
  Button,
  Select,
  Input,
  Icon,
  message,
  Spin
} from "antd";
import { inject, observer } from "mobx-react";
import { action, observable, computed } from "mobx";
import router from "next/router";
import FooterTitle from "../../components/FooterTitle";
import Link from "next/link";
import Currency from "../../components/account/Currency";
import Address from "../../components/account/Address";
import TwoFA from "../../components/TwoFA";
import { TLButton } from "@/tuli-ui";
import Dailog from "../../components/Dialog";
import Utils from "@/utils";

const FormItem = Form.Item;
const Option = Select.Option;
const TabPane = Tabs.TabPane;

function clearNoNum(value) {
  value = value.replace(/[^\d.]/g, ""); //清除“数字”和“.”以外的字符
  value = value.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的
  value = value
    .replace(".", "$#$")
    .replace(/\./g, "")
    .replace("$#$", ".");
  value = value.replace(/^(\-)*(\d+)\.(\d\d\d\d\d\d\d\d).*$/, "$1$2.$3"); //只能输入两个小数
  if (value.indexOf(".") < 0 && value != "") {
    //以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额
    value = parseFloat(value);
  }
  return value;
}

@inject("BaseStore")
@inject("UserStore")
@observer
class WithdrawDetail extends React.Component {
	@observable active = {};
	@observable symbol = "";
	@observable price = 0;
	@observable number = 0;
	@observable tabsKey = "1";
	@observable isShowDeleteModal = false;
	@observable url = "/transaction/withdraw/submitWithdraw";
	@observable loading = false;
	@observable
	pagination = {
	  pageNo: 1,
	  pageSize: 10
	};

	constructor(props) {
	  super(props);
	}
	componentDidMount = async () => {
	  const { getAssetsBalance, getSettings } = this.props.BaseStore;
	  await getSettings();
	  await getAssetsBalance();
	};
	handleCallback = async active => {
	  this.active = active;
	  const { getAddress } = this.props.BaseStore;
	  await getAddress({}, this.active.symbol);
	  this.props.form.resetFields(["number", "password", "address"]);
	  this.number = ""; //清空到账数量
	  this.price = ""; //清空手续费
	};
	handleCallbackByAddress = async active => {
	  this.symbol = active.symbol;
	  this.props.form.resetFields(["in_address", "remark"]);
	};
	checkNumber = (rule, value, cb) => {
	  const { i18n } = this.props.BaseStore;
	  this.price = 0;
	  if (!value) {
	    cb();
	    //cb(i18n.App.WithDraw.withdraw_number_req);
	    return;
	  }
	  if (Number(number) === 0) {
	    cb();
	    //cb(i18n.App.WithDraw.withdraw_number_req);
	    return;
	  }
	  let number = clearNoNum(value);
	  if (!this.active || Object.keys(this.active).length <= 0) {
	    return;
	  }
	  if (
	    Number(number) > Number(this.active.maxWithdraw) ||
			Number(number) < Number(this.active.minWithdraw)
	  ) {
	    cb(i18n.App.WithDraw.withdraw_balance_limit);
	    return;
	  }

	  if (Number(number) > Number(this.active.balance)) {
	    cb(i18n.App.WithDraw.withdraw_over_limit);
	    return;
	  }
	  let fee = Utils.multi(this.active.minWithdrawalRate, value);
	  this.price = Utils.toFixed8(Utils.plus(this.active.withdrawalFee, fee));
	  this.number = Utils.toFixed8(Utils.minus(number, this.price));
	  if (Number(this.number) === 0) {
	    cb(i18n.App.WithDraw.withdraw_cur);
	    return;
	  }
	  cb();
	};
	withdraw = async () => {
	  const {
	    submitWithdraw,
	    verifySecret,
	    withdrawAddressList,
	    locale,
	    userInfo
	  } = this.props.BaseStore;
	  const form = this.props.form;
	  let number = form.getFieldValue("number");
	  let addressCode = form.getFieldValue("address");

	  if (userInfo.secertStatus === 0) {
	    message.error(this.props.BaseStore.i18n.App.Prompt.setFundsPwd);
	    this.loading = false;
	    return;
	  }

	  if (Number(this.active.totals) === 0) {
	    message.error(this.props.BaseStore.i18n.App.WithDraw.notAllow);
	    this.loading = false;
	    return;
	  }
	  await verifySecret({
	    secret: form.getFieldValue("password")
	  });

	  if (!this.props.BaseStore.isVerifySecret) {
	    message.error(this.props.BaseStore.i18n.App.WithDraw.passwordError);
	    this.loading = false;
	    return;
	  }

	  let res = await submitWithdraw({
	    fee: 0,
	    amount: number,
	    asset: this.active.symbol,
	    minWithdrawalRate: this.active.minWithdrawalRate,
	    realAmount: this.number,
	    address: withdrawAddressList
	      ? withdrawAddressList.find(x => x.id === parseInt(addressCode)).address
	      : "",
	    withdrawalAddressId: addressCode,
	    withdrawalFee: this.active.withdrawalFee
	  });
	  if (res && parseInt(res.result.code) === 1) {
	    message.error(res.result.result);
	    this.loading = false;
	  } else {
	    message.success(this.props.BaseStore.i18n.App.WithDraw.submitted);
	    router.push(`/${locale}/account`);
	  }
	};
	handleSubmit = async e => {
	  const { userInfo, hasErrors } = this.props.BaseStore;
	  e.preventDefault();
	  this.props.form.validateFieldsAndScroll(
	    ["address", "password", "number"],
	    async (err, values) => {
	      if (!err) {
	        if (userInfo.googleBinded) {
	          //输入谷歌验证码
	          this.props.BaseStore.setState(["googlePopVisible"], true);
	        } else {
	          this.withdraw();
	        }
	      } else {
	        this.loading = false;
	      }
	    }
	  );
	  if (!this.props.form.getFieldValue("address")) {
	    this.loading = false;
	  }
	};
	handleSubmitAddress = async e => {
	  const { userInfo } = this.props.BaseStore;
	  e.preventDefault();
	  this.props.form.validateFieldsAndScroll(["remark", "in_address"], async (err, values) => {
	    if (!err) {
	      // if (userInfo.googleBinded) {
	      //   //输入谷歌验证码
	      //   this.props.BaseStore.setState(["googlePopVisible"], true);
	      // } else {
	      //   this.address();
	      //   this.loading = false;
	      // }
	      this.address();
	    } else {
	      this.loading = false;
	    }
	  });
	};

	address = async () => {
	  const { putAddres, i18n, getAddress, openNotificationWithIcon } = this.props.BaseStore;
	  const form = this.props.form;
	  if (!this.symbol) {
	    message.error(i18n.App.Address.selectPlaceHolder);
	    this.loading = false;
	    return;
	  }

	  await putAddres({
	    remark: form.getFieldValue("remark"),
	    address: form.getFieldValue("in_address"),
	    asset: this.symbol
	  });
	  if (!this.props.BaseStore.isAddress) {
	    openNotificationWithIcon("error", i18n.App.Address.error, i18n.App.Address.address_error);
	    this.loading = false;
	    return;
	  }
	  await getAddress(this.pagination);
	  this.loading = false;
	};

	googleError = () => {
	  message.error(this.props.BaseStore.i18n.App.Login.imgVcodeError);
	  this.loading = false;
	};
	googleCancel = ()=>{
	  this.loading = false;
	}
	googleSuccess = async () => {
	  if (this.tabsKey == 1) {
	    this.withdraw();
	  } else {
	    this.address();
	  }
	};
	handleOk = async () => {
	  const { deleteAddress, getAddress, i18n } = this.props.BaseStore;
	  this.pagination.pageNo = 1;
	  let res = await deleteAddress(this.Id);
	  if (res) {
	    this.isShowDeleteModal = false;
	    await getAddress(this.pagination);
	  } else {
	    openNotificationWithIcon("error", i18n.App.Address.error, i18n.App.Address.delete_error);
	  }
	};
	handleCancel = () => {
	  this.isShowDeleteModal = false;
	};

	render() {
	  const { getFieldDecorator, getFieldsError, isFieldTouched, getFieldError } = this.props.form;
	  const {
	    i18n,
	    hasErrors,
	    query,
	    locale,
	    withdrawAddressList,
	    assetsBalanceList,
	    addressListCount,
	    userInfo
	  } = this.props.BaseStore;
	  const language = i18n.App.WithDraw;
	  const address_language = i18n.App.Address;
	  const account_language = i18n.App.AccountDetail;
	  const dialogConfig = {
	    title: address_language.delete_title,
	    content: address_language.delete_content,
	    handleOk: this.handleOk,
	    okText: address_language.okText,
	    cancelText: address_language.cancelText,
	    handleCancel: this.handleCancel
	  };
	  let symbol = this.props.symbol;
	  const formItemLayout = {
	    labelCol: {
	      xs: {
	        span: 6
	      },
	      sm: {
	        span: 6
	      }
	    },
	    wrapperCol: {
	      xs: {
	        span: 18
	      },
	      sm: {
	        span: 18
	      }
	    }
	  };

	  return (
	    <div className="withdraw-main">
	      <div className="content">
	        <Tabs
	          className="withdraw-tabs"
	          activeKey={this.tabsKey}
	          onChange={async index => {
	            const { getAddress, setState } = this.props.BaseStore;
	            this.tabsKey = index;
	            this.props.form.resetFields();
	            if (parseInt(index) === 2) {
	              this.url = "/transaction/withdraw/address";
	              await getAddress(this.pagination);
	            } else {
								setState(["withdrawAddressList"], []);
	              //await getAddress({}, this.active.symbol);
	              this.number = ""; //清空到账数量
	              this.price = ""; //清空手续费
	              this.url = "/transaction/withdraw/submitWithdraw"; //谷歌验证需要URL
	            }
	          }}
	          tabPosition={"left"}
	        >
	          <TabPane tab={language.tabTitle1} key="1">
	            <Currency callback={this.handleCallback} symbol={symbol} type="withdraw"/>
	            <div className="box">
	              <span className="line" style={{ flexGrow: "0.1" }} />
	              <span className="text">{language.withdraw_address}</span>
	              <span className="line" />
	            </div>
	            {/* onSubmit={this.handleSubmit} */}
	            <Form className="withdraw-form">
	              <FormItem>
	                {getFieldDecorator("address", {
	                  rules: [
	                    {
	                      required: true,
	                      message: language.selectPlaceHolder
	                    }
	                  ]
	                })(
	                  <Select
	                    placeholder={`${language.selectPlaceHolder}`}
	                    style={{ height: 40 }}
	                    dropdownMatchSelectWidth={true}
	                  >
	                    {Array.from(withdrawAddressList).map((item, index) => {
	                      return (
	                        <Option key={item.id} className="withdraw-option">
	                          <span
	                            style={{
	                              fontSize: "14px",
	                              color: "#acabca"
	                            }}
	                          >
	                            {item.remark}-
	                          </span>
	                          {item.address}
	                        </Option>
	                      );
	                    })}
	                  </Select>
	                )}
	              </FormItem>
	              <div className="limit">
	                {language.limit[0]}
	                {this.active.maxWithdraw ? this.active.maxWithdraw : 0}
	                {language.limit[1]}
	                {this.active.minWithdraw ? this.active.minWithdraw : 0}
	              </div>
	              <FormItem>
	                {getFieldDecorator("number", {
	                  rules: [
	                    {
	                      required: true,
	                      message: language.withdraw_number_req
	                    },
	                    {
	                      validator: this.checkNumber
	                    }
	                  ]
	                })(
	                  <Input
	                    onChange={e => {
	                      e.target.value = clearNoNum(e.target.value);
	                      //.replace(/[^\d.]/g, "");
	                    }}
	                    placeholder={language.withdraw_number_req}
	                  />
	                )}
	              </FormItem>
	              <div style={{ marginBottom: 18 }}>
	                {language.serCharge}
	                {this.price}
	              </div>
	              <div className="amount">
	                <span>{language.arrivalAcc}</span>
	                <span>{this.number}</span>
	              </div>
	              {
	              userInfo.secertStatus!== 0 ? (<FormItem>
	                {getFieldDecorator("password", {
	                  rules: [
	                    {
	                      required: true,
	                      message: language.passwordPlaceholder
	                    }
	                  ]
	                })(<Input type="password" placeholder={language.passwordPlaceholder} />)}
	              </FormItem>)
	                : <Link href={`/${locale}/settings/fundsPwd`} >
									 		<a>{i18n.App.Prompt.setFundsPwd}</a>
	                  </Link>
	              }
	             

	              <FormItem style={{ marginTop: 80 }}>
	                <Button
	                  className="btn-submit"
	                  type="primary"
	                  disabled={this.loading}
	                  htmlType="submit"
	                  loading={this.loading}
	                  onClick={e => {
	                    this.loading = true;
	                    this.handleSubmit(e);
	                  }}
	                >
	                  {language.confirm}
	                </Button>
	              </FormItem>
	            </Form>
	          </TabPane>
	          <TabPane tab={language.tabTitle2} key="2">
	            <div className="table">
	              <Table
	                rowKey="id"
	                dataSource={Array.from(withdrawAddressList)}
	                pagination={{
	                  current: this.pagination.pageNo,
	                  total: addressListCount,
	                  pageSize: 10,
	                  onChange: async pageNumber => {
	                    this.pagination.pageNo = pageNumber;
	                    await this.props.BaseStore.getAddress(this.pagination);
	                  }
	                }}
	                locale={{
	                  emptyText: account_language.emptyData
	                }}
	                columns={[
	                  {
	                    title: account_language.Currency,
	                    key: "asset",
	                    dataIndex: "asset"
	                    // render: asset => {
	                    // 	return asset;
	                    // }
	                  },
	                  {
	                    title: address_language.withdraw_address,
	                    key: "address",
	                    dataIndex: "address",
	                    width: 500
	                  },
	                  {
	                    title: address_language.remarks,
	                    key: "remarks",
	                    dataIndex: "remark"
	                  },
	                  {
	                    title: account_language.Option,
	                    key: "Option",
	                    render: record => {
	                      return (
	                        <Icon
	                          type="minus-circle"
	                          style={{ color: "red" }}
	                          onClick={() => {
	                            this.isShowDeleteModal = true;
	                            this.Id = record.id;
	                          }}
	                        />
	                      );
	                    }
	                  }
	                ]}
	              />
	            </div>
	            <div className="box">
	              <span className="line" style={{ flexGrow: "0.1" }} />
	              <span className="text">{language.addAddress}</span>
	              <span className="line" />
	            </div>
	            <Form
	              className="withdraw-form"
	              onSubmit={this.handleSubmitAddress}
	              layout="vertical"
	              style={{ width: "100%" }}
	            >
	              <FormItem>
	                <Currency callback={this.handleCallbackByAddress} isShowTbale={false} />
	              </FormItem>
	              <Row>
	                <Col span={11}>
	                  <FormItem label={address_language.remarks}>
	                    {getFieldDecorator("remark", {
	                      rules: [
	                        {
	                          required: true,
	                          message: address_language.custNamePlaceHolder
	                        }
	                      ]
	                    })(
	                      <Input
	                        onChange={e => {
	                          e.target.value = e.target.value.replace(/^\s+|\s+$/g, "");
	                        }}
	                        placeholder={address_language.custNamePlaceHolder}
	                        maxLength="20"
	                      />
	                    )}
	                  </FormItem>
	                </Col>
	                <Col
	                  span={2}
	                  style={{
	                    height: "100%",
	                    lineHeight: "83px",
	                    textAlign: "center",
	                    color: "#e2e1f0"
	                  }}
	                >
										_____
	                </Col>
	                <Col span={11}>
	                  <FormItem label={language.withdraw_address}>
	                    {getFieldDecorator("in_address", {
	                      rules: [
	                        {
	                          required: true,
	                          message: address_language.address_req
	                        }
	                      ]
	                    })(
	                      <Input
	                        onChange={e => {
	                          e.target.value = e.target.value
	                            .replace(/^\s+|\s+$/g, "")
	                            .replace(/[\W]/g, "");
	                        }}
	                        placeholder={address_language.address_req}
	                        maxLength="100"
	                      />
	                    )}
	                  </FormItem>
	                </Col>
	              </Row>
	              <FormItem>
	                <Button
	                  className="btn-submit"
	                  type="primary"
	                  htmlType="submit"
	                  style={{ float: "right" }}
	                  loading={this.loading}
	                  disabled={this.loading}
	                  onClick={e => {
	                    this.loading = true;
	                    this.handleSubmitAddress(e);
	                  }}
	                >
	                  {language.addAddress}
	                </Button>
	              </FormItem>
	            </Form>
	          </TabPane>
	        </Tabs>
	      </div>
	      {this.tabsKey == 1 ? (
	        <div className="fotter">
	          <div className="fotter-content">
	            <ul>
	              <li style={{ marginBottom: 30 }}>
	                <Icon type="warning" style={{ color: "#f76e1e", paddingRight: 10 }} />{" "}
	                {language.reminder}
	              </li>
	              <li style={{ marginBottom: 15 }}>
	                {language.notice[0]}&nbsp;
	                {userInfo.userLevel}。
	              </li>
	              {userInfo.userLevel === "LV1" ? (
	                <li style={{ marginBottom: 15 }}>
	                  {language.notice[1]}&nbsp;
	                  <Link href={`/${locale}/settings`}>
	                    <a>{language.userCenter}</a>
	                  </Link>&nbsp;
	                  {language.notice[2]}
	                </li>
	              ) : (
	                <li style={{ marginBottom: 15 }}>
	                  {language.notice[3]}
	                  {this.active.minWithdraw || 0}
	                  {this.active.symbol}。
	                </li>
	              )}
	              <li style={{ marginBottom: 15 }}>
	                {language.notice[4]}&nbsp;
	                <Link href={`/${locale}/account/assets_records`}>
	                  <a>{language.record}</a>
	                </Link>&nbsp;
	                {language.notice[5]}
	              </li>
	              <li>{language.notice[6]}</li>
	            </ul>
	          </div>
	        </div>
	      ) : (
	        ""
	      )}
	      {this.isShowDeleteModal ? <Dailog {...dialogConfig} /> : ""}
	      <TwoFA handleSuccess={this.googleSuccess} handleCancel={this.googleCancel} handleError={this.googleError} url={this.url} />
	      <style jsx>
	        {`
						.withdraw-main {
							color: #151f3f;
							min-height: 911px;
							background: #fff;
							width: 1200px;
							margin: auto;
							padding: 0;
							margin-top: 20px;
							display: flex;
							flex-flow: column;
							.content {
								padding: 40px;
							}
							.fotter {
								background: #efeef7;

								.fotter-content {
									width: 700px;
									margin: 0 auto;
									margin-top: 40px;
									margin-bottom: 40px;
									ul > li {
										color: #241c40;
									}
								}
							}
							.box {
								display: flex;
								justify-content: space-between;
								align-items: center;
								margin-top: 30px;
								.line {
									height: 1px;
									flex-grow: 1;
									background-color: #e2e1f0;
								}
							}
						}
					`}
	      </style>
	    </div>
	  );
	}
}
export default Form.create()(WithdrawDetail);
