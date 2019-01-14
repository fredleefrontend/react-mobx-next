import React from "react";
import { Table, Tabs, Button, Checkbox, Divider } from "antd";
import { inject, observer } from "mobx-react";
import { action, observable } from "mobx";
import router from "next/router";
import FooterTitle from "../../components/FooterTitle";
import Link from "next/link";
import Currency from "../../components/account/Currency";
import ULButton from "../../tuli-ui/packages/TLButton";

const TabPane = Tabs.TabPane;

@inject("BaseStore")
@observer
export default class AssetsDetail extends React.Component {
	@observable
	pagination = {
	  pageNo: 1,
	  pageSize: 10
	};
	@observable rowKeys = [""];

	constructor(props) {
	  super(props);
	}
	onTabsChange = async key => {
	  const { getdepositRecord, getwithdrawRecord } = this.props.BaseStore;
	  this.pagination.pageNo = 1;
	  this.rowKeys = [""];
	  if (parseInt(key) === 1) {
	    await getdepositRecord(this.pagination);
	  } else if (parseInt(key) === 2) {
	    await getwithdrawRecord(this.pagination);
	  }
	};
	async componentDidMount() {
	  const { getdepositRecord } = this.props.BaseStore;
	  await getdepositRecord(this.pagination);
	}
	render() {
	  const {
	    depositList,
	    i18n,
	    withdrawalsList,
	    withdrawalsCount,
	    depositCount
	  } = this.props.BaseStore;
	  const language = i18n.App.AccountDetail;
	  return (
	    <div className="withdraw-main assets-list">
	      <Tabs
	        defaultActiveKey="1"
	        tabPosition={"left"}
	        className="tabs"
	        onChange={this.onTabsChange}
	      >
	        <TabPane tab={language.Deposit} key="1">
	          <Table
	            rowKey="id"
	            pagination={{
	              pageSize: 10,
	              total: depositCount,
	              onChange: async pageNo => {
	                const { getdepositRecord } = this.props.BaseStore;
	                this.pagination.pageNo = pageNo;
	                await getdepositRecord(this.pagination);
	              }
	            }}
	            locale={{
	              emptyText: language.emptyData
	            }}
	            expandedRowKeys={Array.from(this.rowKeys)}
	            columns={[
	              { title: language.Time, dataIndex: "createAt", key: "createAt" },
	              { title: language.Currency, dataIndex: "asset", key: "asset" },
	              {
	                title: language.Type,
	                key: "id",
	                render: () => {
	                  return language.depositText;
	                }
	              },
	              { title: language.Amount, dataIndex: "amount", key: "amount" },
	              {
	                title: language.Status,
	                dataIndex: "status",
	                key: "status",
	                render: (text, record) => {
	                  return language[text];
	                }
	              },
	              {
	                title: language.Address,
	                dataIndex: "address",
	                key: "address",
	                width: 200,
	                render: text => {
	                  return text;
	                }
	              }
	              // {
	              // 	title: language.Option,
	              // 	dataIndex: "option",
	              // 	render: (text, record) => {
	              // 		return (
	              // 			<a
	              // 				className={this.rowKeys[0] === record.id ? "down" : "up"}
	              // 				onClick={async () => {
	              // 					const { depositDetail } = this.props.BaseStore;
	              // 					if (this.rowKeys[0] === record.id) {
	              // 						this.rowKeys = [""];
	              // 						return;
	              // 					}
	              // 					await depositDetail(record.asset, record.hash);
	              // 					this.rowKeys = [record.id];
	              // 				}}
	              // 			/>
	              // 		);
	              // 	}
	              // }
	            ]}
	            dataSource={Array.from(depositList)}
	            // expandedRowRender={record => {
	            // 	return (
	            // 		<div className="content">
	            // 			<div className="left">
	            // 				<p>{language.Time}</p>
	            // 				<p>
	            // 					{language.progress}
	            // 					{record.createAt}
	            // 				</p>
	            // 				<p>
	            // 					{language.TxID}
	            // 					{record.txID}
	            // 				</p>
	            // 				<p>
	            // 					{language.depositAddress}
	            // 					{record.address}
	            // 				</p>
	            // 			</div>
	            // 		</div>
	            // 	);
	            // }}
	          />
	        </TabPane>
	        <TabPane tab={language.Withdraw} key="2">
	          <Table
	            rowKey="id"
	            columns={[
	              { title: language.Time, dataIndex: "createAt", key: "createAt" },
	              { title: language.Currency, dataIndex: "asset", key: "asset" },
	              {
	                title: language.Type,
	                key: "id",
	                render: () => {
	                  return language.withdrawalText;
	                }
	              },
	              { title: language.Amount, dataIndex: "amount", key: "amount" },
	              {
	                title: language.Status,
	                dataIndex: "status",
	                key: "status",
	                render: (text, record) => {
	                  const { locale } = this.props.BaseStore;
	                  return record.status === "COMPLETE"
	                    ? locale === "zh_cn"
	                      ? "提币成功"
	                      : "Withdrawal Complete"
	                    : language[text];
	                }
	              },
	              {
	                title: language.Address,
	                dataIndex: "address",
	                key: "address",
	                width: 200,
	                render: text => {
	                  return text;
	                }
	              }
	              // {
	              // 	title: language.Option,
	              // 	dataIndex: "option",
	              // 	render: (text, record) => {
	              // 		return (
	              // 			<a
	              // 				className={this.rowKeys[0] === record.id ? "down" : "up"}
	              // 				onClick={async () => {
	              // 					const { withdrawalDetail } = this.props.BaseStore;
	              // 					if (this.rowKeys[0] === record.id) {
	              // 						this.rowKeys = [""];
	              // 						return;
	              // 					}
	              // 					//await withdrawalDetail(record.asset, record.hash);
	              // 					await withdrawalDetail("ETH", "0xabcd");
	              // 					this.rowKeys = [record.id];
	              // 				}}
	              // 			/>
	              // 		);
	              // 	}
	              // }
	            ]}
	            locale={{
	              emptyText: language.emptyData
	            }}
	            dataSource={Array.from(withdrawalsList)}
	            pagination={{
	              pageSize: 10,
	              total: withdrawalsCount,
	              onChange: async pageNo => {
	                const { getwithdrawRecord } = this.props.BaseStore;
	                this.pagination.pageNo = pageNo;
	                await getwithdrawRecord(this.pagination);
	              }
	            }}
	            expandedRowKeys={Array.from(this.rowKeys)}
	            // expandedRowRender={record => {
	            // 	return (
	            // 		<div className="content">
	            // 			<div className="left">
	            // 				<p>{language.Time}</p>
	            // 				<p>
	            // 					{language.progress}
	            // 					{record.createAt}
	            // 				</p>
	            // 				<p>
	            // 					{language.TxID}
	            // 					{record.txID}
	            // 				</p>
	            // 				<p>
	            // 					{language.depositAddress}
	            // 					{record.address}
	            // 				</p>
	            // 			</div>
	            // 		</div>
	            // 	);
	            // }}
	          />
	        </TabPane>
	      </Tabs>
	      <style jsx>
	        {`
						.assets-list {
							width: 1200px;
							margin: 0 auto;
							background: #fff;
							padding: 40px;
							min-height: 500px;
							margin-top: 20px;
							margin-bottom: 147px;
							.content {
								display: flext;
								p {
									margin-bottom: 7px;
									font-size: 12px;
									color: #241c40;
									letter-spacing: 0;
									line-height: 18px;
								}
							}
						}
					`}
	      </style>
	    </div>
	  );
	}
}
