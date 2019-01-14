import React from "react";
import { inject, observer } from "mobx-react";
import { action, observable } from "mobx";
import Dialog from "../../components/Dialog";
import config from "../../config";
import router from "next/router";
import FooterTitle from "../../components/FooterTitle";

import { Table } from "antd";

@inject("BaseStore")
@observer
export default class FeeList extends React.Component {
	constructor(props) {
		super(props);
	}
	componentDidMount = async () => {
		const { getFee } = this.props.BaseStore;
		await getFee();
	};
	render() {
		const { i18n, feeList } = this.props.BaseStore;
		const language = i18n.App.Fee;
		const columns = [
			{
				title: language.currency,
				dataIndex: "name",
				render: name => {
					return language[`${name}`];
				}
			},
			{
				title: language.baseFee,
				dataIndex: "withdrawal_fee",
				render: withdrawal_fee => {
					return withdrawal_fee / 100000000;
				}
			},
			{
				title: language.theRate,
				dataIndex: "min_withdrawal_rate",
				render: min_withdrawal_rate => {
					return min_withdrawal_rate / 1000000 + "%";
				}
			}
		];
		return (
			<div className="fee-content">
				<FooterTitle data={language.rate} />
				<div className="rate-content">
					<p>{language.rateBtc}</p>
					<p>&nbsp;&nbsp;&nbsp;{language.rateEtp}</p>
					<p>&nbsp;&nbsp;&nbsp;{language.rateEth}</p>
					<p>&nbsp;&nbsp;&nbsp;{language.rateBit}</p>
					<p>{language.rateContent}</p>
				</div>
				<FooterTitle data={language.fee} />
				<div className="table">
					<Table pagination={false} columns={columns} dataSource={Array.from(feeList)} />
				</div>
				<div className="rate-content">{language.feeContent}</div>
				<style jsx>{`
					.fee-content {
						width: 1200px;
						background: #fff;
						margin: 28px auto;
						padding-bottom: 60px;
						.rate-content {
							padding: 10px 100px;
							p {
								color: #6a5f76;
								margin: 20px 0;
								font-size: 14px;
							}
						}
						.table {
							width: 1000px;
							margin: 20px auto;
						}
					}
				`}</style>
			</div>
		);
	}
}
