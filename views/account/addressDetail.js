import React from "react";
import { Table, Tabs, Button, Form, Row, Col, Checkbox, Select, Input } from "antd";
import { inject, observer } from "mobx-react";
import { action, observable } from "mobx";
import router from "next/router";
import FooterTitle from "../../components/FooterTitle";
import Link from "next/link";
import Currency from "../../components/account/Currency";
import Address from "../../components/account/Address";
import Dailog from "../../components/Dialog";
const FormItem = Form.Item;
const Option = Select.Option;

@Form.create(AddressDetail)
@inject("BaseStore")
@observer
export default class AddressDetail extends React.Component {
	@observable isShowModal = false;
	@observable isShowDeleteModal = false;
	@observable Id = 0;
	@observable
	pagination = {
		pageNo: 1,
		pageSize: 10
	};
	constructor(props) {
		super(props);
	}
	componentDidMount = async () => {
		const { getAssetsBalance, getAddress } = this.props.BaseStore;
		await getAssetsBalance();
		await getAddress(this.pagination);
		this.props.form.validateFields();
	};

	handleCallback = async symbol => {
		const { getWithdrawaladdresses } = this.props.BaseStore;
		this.symbol = symbol;
		await getWithdrawaladdresses(this.symbol);
	};

	handleClick = async value => {
		const { getWithdrawaladdresses } = this.props.BaseStore;
		this.symbol = value;
		await getWithdrawaladdresses(this.symbol);
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
	hadnleCallback = () => {
		this.isShowModal = false;
	};
	handleSubmit = e => {
		const { putAddres, i18n, getAddress, openNotificationWithIcon } = this.props.BaseStore;

		e.preventDefault();
		this.props.form.validateFieldsAndScroll(async (err, values) => {
			if (!err) {
				await putAddres(values);
				if (!this.props.BaseStore.isAddress) {
					openNotificationWithIcon("error", i18n.App.Address.error, i18n.App.Address.address_error);
					return;
				}
				await getAddress();
			}
		});
	};
	render() {
		const {
			i18n,
			withdrawAddressList,
			assetsBalanceList,
			hasErrors,
			addressListCount
		} = this.props.BaseStore;
		const { getFieldDecorator, getFieldsError, isFieldTouched, getFieldError } = this.props.form;
		const language = i18n.App.Address;
		const account_language = i18n.App.AccountDetail;
		const assetError = isFieldTouched("asset") && getFieldError("asset");
		const remarkError = isFieldTouched("remark") && getFieldError("remark");
		const addressError = isFieldTouched("address") && getFieldError("address");
		const dialogConfig = {
			title: language.delete_title,
			content: language.delete_content,
			handleOk: this.handleOk,
			okText: language.okText,
			cancelText: language.cancelText,
			handleCancel: this.handleCancel
		};
		return (
			<div className="address-main">
				<div className="table">
					<Table
						dataSource={Array.from(withdrawAddressList)}
						pagination={{
							total: addressListCount,
							pageSize: 10,
							onChange: async pageNumber => {
								this.pagination.pageNo = pageNumber;
								await this.props.BaseStore.getAddress(this.pagination);
							}
						}}
						columns={[
							{
								title: account_language.Currency,
								key: "asset",
								dataIndex: "asset",
								render: asset => {
									return account_language[asset];
								}
							},
							{
								title: language.address,
								key: "address",
								dataIndex: "address"
							},
							{
								title: language.remarks,
								key: "remarks",
								dataIndex: "remark"
							},
							{
								title: account_language.Option,
								key: "Option",
								render: record => {
									return (
										<a
											onClick={() => {
												this.isShowDeleteModal = true;
												this.Id = record.id;
											}}
										>
											{language.delete}
										</a>
									);
								}
							}
						]}
					/>
				</div>
				{this.isShowDeleteModal ? <Dailog {...dialogConfig} /> : ""}
				<div className="add-address">
					<Form onSubmit={this.handleSubmit} layout="vertical">
						<Row>
							<Col span={6}>
								<FormItem
									label={language.currency}
									validateStatus={assetError ? "error" : ""}
									help={assetError || ""}
								>
									{getFieldDecorator("asset", {
										rules: [
											{
												required: true,
												message: language.selectPlaceHolder
											}
										]
									})(
										<Select placeholder={`${language.selectPlaceHolder}`}>
											{Array.from(assetsBalanceList).map((item, index) => {
												return (
													<Option key={item.symbol} className="withdraw-option">
														{item.symbol}-{account_language[item.symbol]}
													</Option>
												);
											})}
										</Select>
									)}
								</FormItem>
							</Col>
							<Col span={6}>
								<FormItem
									label={language.custName}
									style={{ marginLeft: "10px" }}
									validateStatus={remarkError ? "error" : ""}
									help={remarkError || ""}
								>
									{getFieldDecorator("remark", {
										rules: [
											{
												required: true,
												message: language.selectPlaceHolder
											}
										]
									})(<Input placeholder={language.custNamePlaceHolder} />)}
								</FormItem>
							</Col>
							<Col span={6}>
								<FormItem
									label={language.withdraw_address}
									style={{ marginLeft: "10px" }}
									validateStatus={addressError ? "error" : ""}
									help={addressError || ""}
								>
									{getFieldDecorator("address", {
										rules: [
											{
												required: true,
												message: language.address_req
											}
										]
									})(<Input placeholder={language.address_req} />)}
								</FormItem>
							</Col>
						</Row>
						<FormItem>
							<Button
								className="btn-submit"
								type="primary"
								htmlType="submit"
								disabled={hasErrors(getFieldsError())}
								style={{ float: "right" }}
							>
								{language.confirm}
							</Button>
						</FormItem>
					</Form>
				</div>
				<style jsx>{`
					.address-main {
						color: #151f3f;
						margin-top: 28px;
						background: #fff;
						width: 1200px;
						margin: auto;
						padding: 20px;
						margin-top: 28px;
						.add-address {
							margin: 20px;
							padding: 20px;
							border: 1px solid #ddd;
						}
						.title {
							padding-top: 36px;
							display: flex;
							justify-content: space-between;
							width: 100%;
							font-size: 16px;
							.add-address {
								color: #40b2f0;
								font-size: 13px;
								padding-right: 20px;
								&:before {
									content: "+";
									font-size: 20px;
									display: inline-block;
									font-weight: 700;
								}
								a {
									color: #40b2f0;
								}
							}
							span {
								width: 176px;
								display: inline-block;
								height: 100%;
								color: #151f3f;
								font-weight: 700;
								border-bottom: 2px solid #40b2f0;
								cursor: pointer;
								padding-left: 40px;
								padding-bottom: 20px;
							}
						}
					}
				`}</style>
			</div>
		);
	}
}
