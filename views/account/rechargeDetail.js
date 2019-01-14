import React from "react";
import { Table, Tabs, Button, Icon, Modal } from "antd";
import { inject, observer } from "mobx-react";
import { action, observable, computed } from "mobx";
import router from "next/router";
import FooterTitle from "../../components/FooterTitle";
import Link from "next/link";
import Currency from "../../components/account/Currency";
import QrCode from "qrcode";
import copy from "copy-to-clipboard";
import { deposit_address } from "@/store/Base/api";

@inject("BaseStore")
@observer
export default class RechargeDetail extends React.Component {
	@observable symbol = "";
	@observable modalVisible = false;
	@observable price = 0;
	@observable active = {};
	@observable addressCode = "";
	//获取充币地址
	@action
	deposit_address = async params => {
	  let res = await deposit_address(params);
	  if (res && parseInt(res.status.success) === 1) {
	    this.addressCode = res.result.data.address;
	  } else {
	    this.addressCode = "";
	  }
	};

	constructor(props) {
	  super(props);
	}
	setQrcode = () => {
	  if (!this.addressCode) {
	    let c = document.getElementById("canvas");
	    let cxt = c.getContext("2d");
	    cxt.clearRect(0, 0, c.width, c.height);
	    return false;
	  }
	  QrCode.toCanvas(
	    document.getElementById("canvas"),
	    this.addressCode,
	    {
	      color: {
	        dark: "#000000"
	      },
	      scale: 4
	    },
	    error => {
	      if (error != null) console.error(error);
	    }
	  );
	};
	handleCallback = async (active, value) => {
	  this.active = active;
	  await this.deposit_address(this.active.symbol);
	  this.setQrcode();
	};

	render() {
	  const { i18n, depositList, depositCount, query, locale } = this.props.BaseStore;
	  const language = i18n.App.Recharge;
	  const languageDetail = i18n.App.AccountDetail;
	  let symbol = this.props.symbol;
	  return (
	    <div className="recharge-main">
	      <div className="left-content">
	        <Currency callback={this.handleCallback} symbol={symbol} type="deposit"/>
	        <div className="content">
	          <div className="box">
	            <span className="line" style={{ flexGrow: "0.1" }} />
	            <span className="text">
	              {this.active.symbol}
	              {language.address}
	            </span>
	            <span className="line" />
	          </div>
	          <div className="box" style={{ marginTop: "30px" }}>
	            <div className="depositaddress">{this.addressCode}</div>

	            <a
	              className="copy"
	              onClick={() => {
	                const { openNotificationWithIcon } = this.props.BaseStore;
	                if (!this.addressCode) {
	                  return;
	                }
	                copy(this.addressCode);
	                openNotificationWithIcon("success", "", language.copyMes);
	              }}
	            >
	              {language.copyAddress}
	            </a>
	          </div>
	          <div className="box">
	            <canvas id="canvas" />
	          </div>
	          {1 !== 1 ? (
	            <div>
	              <div className="box">
	                <span className="line" style={{ flexGrow: "0.1" }} />
	                <span className="text">memo地址</span>
	                <span className="line" />
	              </div>
	              <div className="box memo">1231231231</div>
	            </div>
	          ) : (
	            ""
	          )}
	        </div>
	      </div>
	      <div className="deposit-type">
	        <div className="bank">
	          <ul>
	            {/* <li>●充值POE需要30个网络确认才可安全到账</li>
							<li>●充值跟踪请跳转至资产记录页面</li> */}
	            <li style={{ paddingBottom: "20px" }}>
	              <Icon type="warning" style={{ color: "orange", paddingRight: "10px" }} />{" "}
	              {language.notice}
	            </li>
	            <li>
	              {language.tips[0]}&nbsp;
	              {this.active.minHeight || 0}&nbsp;
	              {language.tips[1]}
	              {this.active.height || 0}&nbsp;
	              {language.tips[2]}
	            </li>
	            <li>
	              {language.tips[3]}
	              {this.active.minDeposit || 0}
	              {this.active.symbol}
	              {language.tips[4]}
	            </li>
	            <li>
	              {language.tips[5]}&nbsp;
	              <Link href={`/${locale}/account/assets_records`}>
	                <a>{language.AsRecord}</a>
	              </Link>&nbsp;
	              {language.tips[6]}
	            </li>
	            <li>{language.tips[7]}</li>
	            <li>{language.tips[8]}</li>
	          </ul>
	        </div>
	      </div>
	      <style jsx>
	        {`
						.recharge-main {
							color: #151f3f;
							min-height: 557px;
							margin-top: 28px;
							background: #fff;
							width: 1200px;
							margin: 0 auto 148px auto;
							padding: 0;
							margin-top: 20px;
							display: flex;
							justify-content: space-between;
							.left-content {
								padding: 30px;
								.content {
									.memo {
										font-size: 16px;
										color: #ee9b25;
										justify-content: center !important;
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
										.depositaddress {
											background: #ffffff;
											border: 1px solid #58516f;
											border-radius: 2px;
											width: 448px;
											height: 36px;
											line-height: 36px;
											text-align: left;
											padding-left: 10px;
										}
										.copy {
											background: #6f52c1;
											border-radius: 2px;
											width: 128px;
											height: 38px;
											line-height: 38px;
											color: #fff;
											text-align: center;
										}
										#canvas {
											width: 135px;
											height: 135px;
											margin: 0 auto;
										}
									}
								}
							}

							.deposit-type {
								padding: 28px;
								font-size: 13px;
								width: 426px;
								background: #efeef7;
								.bank {
									width: 292px;

									margin: 0 auto;
									padding-top: 94px;
									ul > li {
										font-size: 14px;
										color: #241c40;
										margin-bottom: 20px;
									}
								}
							}
						}
					`}
	      </style>
	    </div>
	  );
	}
}
