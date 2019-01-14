import React from "react";
import { Table, Tabs, Button, Checkbox, message } from "antd";
import { inject, observer } from "mobx-react";
import { action, observable } from "mobx";
import router from "next/router";
import FooterTitle from "../../components/FooterTitle";
import Link from "next/link";
import Currency from "../../components/account/Currency";

const TabPane = Tabs.TabPane;

@inject("BaseStore")
@observer
export default class AccountDetail extends React.Component {
	@observable isSendcode = true;
	@observable hideAssets = false;

	@observable
	pagination = {
	  page: 0,
	  items_per_page: 10
	};
	state = {
	  assList: null
	};
	constructor(props) {
	  super(props);
	}

	async componentDidMount() {
	  const { getAssetsBalance } = this.props.BaseStore;
	  await getAssetsBalance();
	  this.setState({
	    assList: Array.from(this.props.BaseStore.assetsBalanceList)
	  });
	}

	render() {
	  const { i18n, assetsBalanceList, locale, userInfo } = this.props.BaseStore;
	  const language = i18n.App.AccountDetail;
	  const columns = [
	    {
	      title: language.Currency,
	      key: "symbol",
	      dataIndex: "symbol",
	      render: symbol => {
	        return `${symbol}`;
	      }
	    },
	    {
	      title: language.Total,
	      key: "total",
	      className: "column-money",
	      dataIndex: "total"
	    },
	    {
	      title: language.Tradable,
	      key: "balance",
	      dataIndex: "balance"
	    },
	    {
	      title: language.Frozen,
	      key: "frozen",
	      dataIndex: "frozen"
	    },
	    {
	      title: language.Option,
	      key: "operation",
	      width: 200,
	      render: (text, record) => {
	        return (
	          <div>
	             <Link
	              href={{ pathname:parseInt(record.deposit) === 0 ? `/${locale}/account/recharge`:"#", query: { id: record.symbol } }}
	              as={parseInt(record.deposit) === 0 ? `/${locale}/a/r/${record.symbol}`:"#"}
	            >
	              <a
	                style={{background: parseInt(record.deposit) === 0?"#6965e1":"#ddd"}}
	                className="withdraw"
	              >
	                {language.Deposit}
	              </a>
	            </Link>
	          <Link
	              href={{ pathname:parseInt(record.withdraw) === 0? `/${locale}/account/withdraw`:"", query: { id: record.symbol } }}
	              as={parseInt(record.withdraw) === 0?`/${locale}/a/w/${record.symbol}`:""}
	            >
	              <a
	                style={{background: parseInt(record.withdraw) === 0?"#f5a623":"#ddd"}}
	                // onClick={() => {
	                // 	message.error(language.notOpend);
	                // }}
	                className="recharge"
	              >
	                {language.Withdraw}
	              </a>
	            </Link>
	           
	          </div>
	        );
	      }
	    }
	  ];
	  return (
	    <div className="account-main">
	      <div className="head">
	        <div className="checkbox">
	          <Checkbox
	            checked={this.hideAssets}
	            onChange={() => {
	              const { assetsBalanceList } = this.props.BaseStore;
	              this.hideAssets = !this.hideAssets;
	              if (this.hideAssets) {
	                this.setState({
	                  assList: this.state.assList.filter(x => parseInt(x.total) !== 0 || !x.total)
	                });
	              } else {
	                this.setState({
	                  assList: Array.from(assetsBalanceList)
	                });
	              }
	            }}
	          >
	            {language.hideAsset0}
	          </Checkbox>
	        </div>
	      </div>
	      <div className="table">
	        <Table
	          rowKey="symbol"
	          pagination={false}
	          columns={columns}
	          dataSource={this.state.assList}
	          locale={{
	            emptyText: language.emptyData
	          }}
	        />
	      </div>
	      <style jsx>
	        {`
						.account-main {
							color: #151f3f;
							min-height: 640px;
							margin-top: 20px;
							background: #fff;
							width: 1200px;
							margin: 30px auto 148px auto;
							position: relative;
							.table {
								padding: 0 5px;
							}
							.head {
								display: flex;
								padding-top: 14px;
								padding-bottom: 16px;
								padding-right: 35px;
								justify-content: flex-end;
								.checkbox {
									padding-left: 10px;
									.ant-checkbox + span,
									.ant-checkbox-wrapper + span {
										font-size: 12px;
										color: #2e2662;
									}
								}
								.button {
									background: #40b2f0;
									color: #fff;
									border-radius: 2px;
									display: inline-block;
									padding: 4px 10px;
									margin-left: 10px;
								}
							}
						}
					`}
	      </style>
	    </div>
	  );
	}
}
