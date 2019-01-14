import React from "react";
import { Row, Col, Tabs, Icon, Input, Button, message, DatePicker, Pagination } from "antd";
import { inject, observer } from "mobx-react";
import Link from "next/link";
import Head from "next/head";
import TradingView from "../components/tradingView/TradingView";
import TLTable from "../components/TLTable";
import TradeForm from "../components/TradeForm";
import Router from "next/router";
import { observable, action } from "mobx";
import { withRouter } from "next/router";
import moment from "moment";
import Utils from "../utils";
import configs from "../config";
import TradeTable from "../components/TradeTable";

const TabPane = Tabs.TabPane;
let TradeTimer = null;
const { RangePicker } = DatePicker;

@inject("BaseStore")
@inject("TradeStore")
@withRouter
@observer
export default class TradeView extends React.Component {
	@observable tardePairDataSource = [];
	@observable searchValue = "";
	@observable collectionTradingNames = [];
	@observable offset = 0;
	@observable limit = 10;
	@observable activeTab = "delegate";
	@observable activeMainCoin = configs.defaultTradePair.mainAsset;
	@observable isSearchShow = false;
	@observable.deep
	historyOrderParams = {
		page: 1,
		count: 10,
		begtime: '',
		endtime: ''
	};

	@action
	setTradeAttr = (key, val) => {
		this[key] = val;
	};

	constructor(props) {
		super(props);
		this.state = {
			offset: 0,
			limit: 30,
			activeTab: "delegate",
			activeMainCoin: "USD"
		};
		clearInterval(TradeTimer);
	}

	componentDidMount() {
		const { isLogin } = this.props.BaseStore;
		if (this.props.router.query && this.props.router.query.tradepair) {
			this.setTradeAttr(
				"activeMainCoin",
				this.props.router.query.tradepair.split("_")[1].toUpperCase()
			);
			this.props.TradeStore.setStoreAttr(
				"activeMainCoin",
				this.props.router.query.tradepair.split("_")[1].toUpperCase()
			);
			this.props.TradeStore.setStoreAttr(
				"activeAssetCoin",
				this.props.router.query.tradepair.split("_")[0].toUpperCase()
			);
		}
		if (!isLogin) {
			this.setTradeAttr(
				"collectionTradingNames",
				JSON.parse(localStorage.getItem("collectionTradingNames"))
			);
		}

		this.upDateDatas();

		TradeTimer = setInterval(() => {
			this.upDateDatas();
		}, 6000);
	}

	componentWillUnmount() {
		clearInterval(TradeTimer);
		this.props.TradeStore.setStoreAttr("pageTickers", []);
		this.props.TradeStore.setStoreAttr("allTicker", {});
	}

	upDateDatas = async () => {
		const {
			getTickers,
			getDeths,
			getTradeHistory,
			getBalances,
			tradeRow,
			getCurrentOrders,
			getHistoryOrders,
			activeMainCoin,
			activeAssetCoin,
			changePageTickers
		} = this.props.TradeStore;
		const tradePair = `${activeAssetCoin + activeMainCoin}`;
		await getTickers();
		await changePageTickers(this.activeMainCoin);
		await getDeths({
			tradePair
		});
		await getTradeHistory(`${activeAssetCoin + activeMainCoin}`);
		if (await this.props.BaseStore.isLogin) {
			getBalances(activeAssetCoin, "activeAssetCoinBalance");
			getBalances(activeMainCoin, "activeMainCoinBalance");
			getCurrentOrders();
			getHistoryOrders(this.historyOrderParams);
		}
	};

	handleChangeCoin(val) {
		this.setState({
			activeCoin: val
		});
	}

	handleRowChange(rowVal) {
		const {
			setStoreAttr,
			getDeths,
			activeAssetCoin,
			activeMainCoin,
			tradeRow
		} = this.props.TradeStore;

		setStoreAttr("tradeRow", rowVal);
		getDeths({ tradePair: activeAssetCoin + activeMainCoin, row: rowVal });
	}

	async handleTableRow(record) {
		const { setStoreAttr, getActiveTicker, activeMainCoin } = this.props.TradeStore;
		const { locale } = this.props.BaseStore;
		let asset = Utils.formatterCoin(record.tradingName);
		let mainAsset = record.tradingName.slice(-3);
		setStoreAttr("activeAssetCoin", asset);
		setStoreAttr("activeMainCoin", mainAsset);
		setStoreAttr("isFilterLike", false);
		getActiveTicker(asset, mainAsset);
		const href = `/${locale}/trade?tradepair=${asset.toLowerCase()}_${mainAsset.toLowerCase()}`;
		const hrefas = `/${locale}/trade/${asset.toLowerCase()}_${mainAsset.toLowerCase()}`;
		Router.push(href, hrefas, { shallow: true });

		this.upDateDatas(asset, mainAsset);
	}

	async handeUndo(record) {
		const {
			activeAssetCoin,
			activeMainCoin,
			deleteOrder,
			openNotificationWithIcon
		} = this.props.TradeStore;
		const Trade = this.props.BaseStore.i18n.App.Trade;
		let res = await deleteOrder({ tradePair: record.tradingPair, id: record.id });
		if (res.status.success) {
			message.success(Trade.revokeSuc);

			this.props.TradeStore.getCurrentOrders();
			this.props.TradeStore.getHistoryOrders();
		} else {
			message.error(Trade.revokeFail);
		}
	}

	hanldeTabChange(activeKey) {
		const { isLogin } = this.props.BaseStore;
		const {
			activeAssetCoin,
			activeMainCoin,
			getCurrentOrders,
			getWithdrawalHistory
		} = this.props.TradeStore;

		if (activeKey === "withdrawal") {
			getWithdrawalHistory({
				tradePair: `${activeAssetCoin + activeMainCoin}`,
				offset: this.state.offset,
				limit: this.state.limit
			});
		} else {
			getCurrentOrders(`${activeAssetCoin + activeMainCoin}`);
		}

		this.setState({
			activeTab: activeKey
		});
	}

	tardePairInputChange = e => {
		this.setTradeAttr("searchValue", e.target.value.toUpperCase());
	};

	showSearch = () => {
		this.setTradeAttr("isSearchShow", true);
	};

	hideSearch = () => {
		this.setTradeAttr("isSearchShow", false);
	};

	hanldeCollection = (e, record) => {
		e.stopPropagation();
		this.props.TradeStore.collectionPageTickers(record.asset + record.askAsset, record.collection);
	};

	handleRangeChange = (dates, dateStrings) => {
		const { page, count } = this.historyOrderParams;
		let params = {
			page,
			count,
			begtime: moment(`${dateStrings[0]} 00:00:00`, "YYYY-MM-DD hh:mm:ss")
				.toDate()
				.getTime(),
			endtime: moment(`${dateStrings[1]} 00:00:00`, "YYYY-MM-DD hh:mm:ss")
				.toDate()
				.getTime()
		};
		this.props.TradeStore.getHistoryOrders(params);
		this.setTradeAttr("historyOrderParams", params);
	};

	onPageChange = (current, pageSize) => {
		const { page, count, begtime, endtime } = this.historyOrderParams;
		let params = {
			page: current,
			count: pageSize,
			begtime,
			endtime
		};

		this.props.TradeStore.getHistoryOrders(params);
		this.setTradeAttr("historyOrderParams", params);
	};

	render() {
		const { i18n, isLogin, locale } = this.props.BaseStore;
		const Trade = i18n.App.Trade;
		const {
			pageTickers,
			category,
			getTickers,
			filterLike,
			isFilterLike,
			filterLikeList,
			activeTicker,
			changePageTickers,
			activeMainCoin,
			activeAssetCoin,
			setStoreAttr,
			getActiveTicker,
			tradeHistoryData,
			tradeDethSell,
			tradeDethBuy,
			tradeRow,
			curDelegate,
			hisDelegate,
			hisDelegateTotal,
			withdrawalHistory,
			activeAssetCoinBalance,
			activeMainCoinBalance
		} = this.props.TradeStore;
		const columns = [
			{
				title: "Currency",
				dataIndex: "tradingName",
				width: "20%",
				render: (val, record) => (
					<div>
						<span
							style={{ cursor: "pointer" }}
							onClick={e => {
								this.hanldeCollection(e, record);
							}}
						>
							<Icon type={record.collection ? "star" : "star-o"} style={{ fontSize: "16px" }} />
						</span>
						{isFilterLike ? `${val.split(val.slice(-3))[0]}/${val.slice(-3)}` : val.slice(0, -3)}
					</div>
				),
				sorter: (pre, next) => next.tradingName.charCodeAt() - pre.tradingName.charCodeAt()
			},
			{
				title: "Last Trade Price",
				dataIndex: "price",
				width: "25%",
				sorter: (pre, next) => next.price - pre.price
			},
			{
				title: "24h Change(%)",
				dataIndex: "quotes",
				width: "25%",
				render: val => (
					<span className={val && val.indexOf("+") > -1 ? "up-green" : "down-red"}>{val}</span>
				),
				sorter: (pre, next) => next.quotes.slice(0, -1) - pre.quotes.slice(0, -1)
			},
			{
				title: "Volume",
				dataIndex: "amount",
				width: "20%",
				align: "right",
				sorter: (pre, next) => next.amount - pre.amount
			}
		];
		const myAccountCol = [
			{
				title: "Coin",
				width: "30%",
				dataIndex: "tradingName",
				render: val => <span>123{/*`${Utils.formatterCoin(val)}`*/}</span>,
				sorter: true
			},
			{
				title: "All quantity",
				dataIndex: "price",
				width: "30%",
				render: val => (
					<span className={val && val > 0 ? "up-green" : val < 0 ? "down-red" : ""}>{val}</span>
				),
				sorter: (pre, next) => next.price - pre.price
			},
			{
				title: "Frozen assets",
				dataIndex: "quotes",
				width: "40%",
				render: val => (
					<span className={val && val > 0 ? "up-green" : val < 0 ? "down-red" : ""}>{val}</span>
				),
				sorter: (pre, next) => next.quotes - pre.quotes
			}
		];

		const orderColBuy = [
			{
				title: `${Trade.orderCol.volume}(${activeMainCoin})`,
				dataIndex: "volume",
				align: "left",
				width: "33%"
			},
			{
				title: `${Trade.orderCol.amount}(${activeAssetCoin})`,
				dataIndex: "amount",
				align: "center",
				width: "33%",
				render: val => <span style={{ color: "#72b43a" }}>{val}</span>
			},
			{
				title: `${Trade.orderCol.price}(${activeMainCoin})`,
				dataIndex: "price",
				align: "right",
				width: "33%"
			}
		];

		const orderColSell = [
			{
				title: `${Trade.orderCol.price}(${activeMainCoin})`,
				dataIndex: "price",
				align: "left",
				width: "33%"
			},
			{
				title: `${Trade.orderCol.amount}(${activeAssetCoin})`,
				dataIndex: "amount",
				align: "center",
				width: "33%",
				render: val => <span style={{ color: "#c61a50" }}>{val}</span>
			},
			{
				title: `${Trade.orderCol.volume}(${activeMainCoin})`,
				dataIndex: "volume",
				align: "right",
				width: "33%"
			}
		];

		const historyCol = [
			{
				title: Trade.orderCol.date,
				dataIndex: "date",
				width: "20%",
				render: text => <span style={{ fontSize: "12px", color: "#7f77a1" }}>{text}</span>
			},
			{
				title: Trade.orderCol.unitPrice + `(${activeMainCoin})`,
				dataIndex: "price",
				align: "right",
				width: "40%",
				render: (text, record) => (
					<span style={{ color: record.side === "SELL" ? "#c61a50" : "#72b43a" }}>{text}</span>
				)
			},
			{
				title: Trade.orderCol.coinAmount + `(${activeAssetCoin})`,
				dataIndex: "amount",
				align: "right",
				width: "40%"
			}
		];

		const activeDelegateCol = [
			{
				dataIndex: "id",
				className: "hide"
			},
			{
				title: Trade.delegateCol.date,
				dataIndex: "datetime",
				align: "left",
				width: "20%",
				render: (val, record, index) => (
					<span>
						<em style={{ color: "#6f6790" }}>{val.split(" ")[0]}</em> {val.split(" ")[1]}
					</span>
				)
			},
			{
				title: Trade.delegateCol.tradePair,
				align: "left",
				dataIndex: "tradingPair"
			},
			{
				title: Trade.delegateCol.type,
				align: "left",
				dataIndex: "type",
				render: val => (
					<span>{val === "1" ? Trade.delegateCol.limited : Trade.delegateCol.market}</span>
				)
			},
			{
				title: Trade.delegateCol.deal,
				align: "left",
				dataIndex: "direction"
			},
			{
				title: Trade.delegateCol.price,
				align: "right",
				dataIndex: "price"
			},
			{
				title: Trade.delegateCol.count,
				align: "right",
				dataIndex: "count"
			},
			{
				title: Trade.delegateCol.turnOverRate,
				align: "right",
				dataIndex: "turnoverRate"
			},
			{
				title: Trade.delegateCol.amount,
				align: "right",
				dataIndex: "amount"
			},
			{
				title: Trade.delegateCol.operate,
				align: "right",
				render: (text, record) => (
					<span
						className="withdrawBtn"
						onClick={() => {
							this.handeUndo(record);
						}}
					>
						{Trade.delegateCol.revoke}
					</span>
				)
			}
		];

		const delegateHistoryCol = [
			{
				dataIndex: "id",
				className: "hide"
			},
			{
				title: Trade.delegateCol.date,
				dataIndex: "created_at",
				align: "left",
				width: "20%",
				render: val => (
					<span>
						<em style={{ color: "#6f6790" }}>{val.split(" ")[0]}</em> {val.split(" ")[1]}
					</span>
				)
			},
			{
				title: Trade.delegateCol.tradePair,
				align: "left",
				dataIndex: "trading_pair"
			},
			{
				title: Trade.delegateCol.direction,
				dataIndex: "side",
				align: "right",
				render: val => <span>{val === "S" ? Trade.delegateCol.sell : Trade.delegateCol.buy}</span>
			},
			{
				title: Trade.delegateCol.price,
				align: "right",
				dataIndex: "limit"
			},
			{
				title: Trade.delegateCol.quantity,
				align: "right",
				dataIndex: "quantity"
			},
			{
				title: Trade.delegateCol.status,
				align: "right",
				dataIndex: "type",
				render: val => <span>{val == "0" ? '已成交' : '已撤单'}</span>
			}
		];
		return (
			<div className="trade">
				<div className="trade-content">
					<div className="l-trade">
						<div className="active-tradepair">
							<div className="trade-name">
								<span className="cion-logo" />
								<h1>
									{activeTicker.asset}/{activeTicker.askAsset}
								</h1>
								<p className="price">
									{activeTicker.price}{" "}
									<span
										style={{
											background: activeTicker.quotes.indexOf("+") > -1 ? "#72b43a" : "#c61a50"
										}}
									>
										<em>{activeTicker.quotes}</em>
									</span>
								</p>
							</div>
							<div className="trade-data">
								<p>
									24hr VOL:&nbsp;
									<span>
										{activeTicker.amount} {activeTicker.asset}
									</span>
								</p>
								<p>
									24hr HIGH:&nbsp;
									<span>
										{activeTicker.high24h} {activeTicker.askAsset}
									</span>
								</p>
								<p>
									24hr LOW:&nbsp;<span>
										{activeTicker.low24h} {activeTicker.askAsset}
									</span>
								</p>
							</div>
						</div>
						{/* 市场 */}
						<div className="market-block trade-card">
							<div className="card-head">
								<h4>
									<Icon type="down" />
									<span>{Trade.market.title}</span>
								</h4>
								<div className="card-actions">
									<span className="trade-category">
										{Array.from(this.props.TradeStore.category).map((item, index) => (
											<em
												key={index}
												onClick={() => {
													this.setTradeAttr("activeMainCoin", item);
													setStoreAttr("isFilterLike", false);
													changePageTickers(item);
												}}
												className={this.activeMainCoin === item ? "active" : ""}
											>
												{item}
											</em>
										))}
									</span>
									<span
										onClick={() => {
											filterLike();
										}}
									>
										<Icon type="star" />
										{Trade.market.optional}
									</span>
									<span className={!this.isSearchShow ? "search-show search" : "search"}>
										<Input
											suffix={<Icon type="search" onClick={this.showSearch} />}
											size="small"
											value={this.searchValue}
											maxLength="8"
											onChange={this.tardePairInputChange}
											onBlur={this.hideSearch}
										/>
									</span>
								</div>
							</div>
							<div className="trade-table">
								<TLTable
									rowKey={record => record.tradingName}
									// loading={true}
									columns={columns}
									onRow={record => {
										return {
											onClick: () => {
												this.handleTableRow(record);
											}
										};
									}}
									rowClassName={record =>
										record.tradingName.slice(0, -3) === activeAssetCoin ? "active" : ""
									}
									dataSource={
										isFilterLike
											? Array.from(filterLikeList).filter(
													item =>
														Utils.formatterCoin(item.tradingName).indexOf(this.searchValue) > -1
											  )
											: pageTickers
												? Array.from(pageTickers).filter(
														item =>
															Utils.formatterCoin(item.tradingName).indexOf(this.searchValue) > -1
												  )
												: []
									}
								/>
							</div>
						</div>
						{/* 下单 */}
						<div className="trade-order trade-card">
							<div className="card-head">
								<h4>
									<Icon type="down" />
									<span>{Trade.order.title}</span>
								</h4>
								<div className="card-actions">
									<span>
										<Icon type="exception" />
										{Trade.order.type}:
										<span style={{ cursor: "auto" }} className="trade-pair-category">
											<em> {Trade.order.curType}</em>
										</span>
									</span>
								</div>
							</div>
							<div className="trade-con">
								<div className="split">
									<TradeForm type="buy" />
								</div>
								<div className="split">
									<TradeForm type="sell" />
								</div>
							</div>
						</div>
						{/* 账户 */}
					</div>
					<div className="r-trade">
						<div className="tradingview-wrapper trade-card">
							<div className="card-head">
								<h4>
									<Icon type="down" />
									<span>{Trade.kChart.title}</span>
								</h4>
							</div>
							<div className="tradingview-con">
								<TradingView
									locale={locale}
									symbol={
										this.props.router.query.tradepair
											? `${this.props.router.query.tradepair
													.split("_")[0]
													.toUpperCase()}${this.props.router.query.tradepair
													.split("_")[1]
													.toUpperCase()}`
											: `${configs.defaultTradePair.asset}${configs.defaultTradePair.mainAsset}`
									}
								/>
							</div>
						</div>
						{/* 挂单 */}
						<div className="bottom-right-wrapper">
							<div className="trade-order trade-card">
								<div className="card-head">
									<h4>
										<Icon type="down" />
										<span>{Trade.guadan.title}</span>
									</h4>
									<div className="trade-actions">
										<span>
											<Icon type="switcher" />
											{Trade.guadan.depth}
										</span>
									</div>
								</div>
								<div className="trade-table guadan">
									<TradeTable
										columns={orderColBuy}
										scroll={{ y: "254px" }}
										background={"rgba(57,73,39,0.53)"}
										backgroundAlign="right"
										dataSource={tradeDethBuy && tradeDethBuy.length ? Array.from(tradeDethBuy) : []}
										locale={{
											emptyText: (
												<span>
													<Icon type="file-text" />
													{Trade.guadan.buyMes}
												</span>
											)
										}}
									/>
									<TradeTable
										columns={orderColSell}
										scroll={{ y: "254px" }}
										background={"rgba(147,49,79,0.53)"}
										dataSource={
											tradeDethSell && tradeDethSell.length ? Array.from(tradeDethSell) : []
										}
										locale={{
											emptyText: (
												<span>
													<Icon type="file-text" />
													{Trade.guadan.sellMes}
												</span>
											)
										}}
									/>
								</div>
							</div>
							{/* 最新成交额 */}
							<div className="new-trade trade-card">
								<div className="card-head">
									<h4>
										<Icon type="down" />
										<span>{Trade.newTrade.title}</span>
									</h4>
								</div>
								<div className="trade-table">
									<TradeTable
										columns={historyCol}
										scroll={{ y: "254px" }}
										dataSource={
											Array.from(tradeHistoryData).length ? Array.from(tradeHistoryData) : []
										}
										locale={{
											emptyText: (
												<span>
													<Icon type="file-text" />
													{Trade.guadan.buyMes}
												</span>
											)
										}}
									/>
								</div>
							</div>
						</div>
						{/* 当前委托 */}
						{this.props.BaseStore.isLogin ? (
							<div className="delegate trade-card">
								<div className="card-head">
									<h4>
										<Icon type="down" />
										<span>{Trade.current.title}</span>
									</h4>
								</div>
								<div className="trade-table">
									<TradeTable
										columns={activeDelegateCol}
										scroll={{ y: "148px" }}
										dataSource={Array.from(curDelegate).length ? Array.from(curDelegate) : []}
										locale={{
											emptyText: (
												<span>
													<Icon type="file-text" />
													{Trade.current.mes}
												</span>
											)
										}}
									/>
								</div>
							</div>
						) : null}

						{/* 历史委托 */}
						{this.props.BaseStore.isLogin ? (
							<div className="delegate trade-card">
								<div className="card-head">
									<h4>
										<Icon type="down" />
										<span>{Trade.hisDelegate.title}</span>
									</h4>
									<div className="trade-actions" style={{ width: "220px" }}>
										<RangePicker format="YYYY-MM-DD" onChange={this.handleRangeChange} />
									</div>
								</div>
								<div className="tarde-table">
									<TradeTable
										columns={delegateHistoryCol}
										// scroll={{ y: "148px" }}
										dataSource={Array.from(hisDelegate).length ? Array.from(hisDelegate) : []}
										locale={{
											emptyText: (
												<span>
													<Icon type="file-text" />
													{Trade.hisDelegate.mes}
												</span>
											)
										}}
									/>
									{Array.from(hisDelegate).length ? (
										<Pagination
											showSizeChanger
											onChange={this.onPageChange}
											onShowSizeChange={this.onPageChange}
											total={hisDelegateTotal}
										/>
									) : null}
								</div>
							</div>
						) : null}
					</div>
				</div>
				<style jsx>
					{`
						$blockBg: #191036;

						@mixin blockGap {
							margin-bottom: 10px;
						}

						.trade {
							overflow: hidden;
							margin-top: 10px;
							min-width: 1200px;
							color: #fff;
							font-weight: 200;

							.trade-content {
								display: flex;
								justify-content: space-between;

								.active-tradepair {
									display: flex;
									justify-content: space-between;
									padding: 10px 0;
									@include blockGap;
									align-items: center;
									background: $blockBg;

									.trade-name {
										position: relative;
										padding-left: 18px;
										font-size: 18px;

										h1 {
											color: #fff;
											font-size: 24px;
										}

										.price {
											position: relative;

											span {
												position: absolute;
												top: 4px;
												right: 0;
												height: 18px;
												font-size: 12px;
												text-align: center;
												border-radius: 2px;
												transform: translate(100%, 0);
												em {
													display: inline-block;
													transform: scale(0.83);
												}
											}
										}
									}

									.trade-data {
										padding-right: 28px;
										p {
											font-size: 12px;
											color: #827a9f;

											span {
												color: #fff;
												font-style: normal;
											}
										}
									}
								}

								.l-trade {
									width: 460px;
									min-width: 460px;
									margin-right: 10px;

									.market-block {
										height: 345px;
									}
									.my-account {
										height: 223px;
									}
								}
								.r-trade {
									flex: 1;
									min-width: 730px;

									.tradingview-wrapper {
										overflow: hidden;
										position: relative;
										height: 698px;

										.tradingview-con {
											width: 100%;
											height: 670px;
										}
									}

									.bottom-right-wrapper {
										display: flex;
										justify-content: flex-start;

										> div {
											height: 313px;
										}

										> div:first-of-type {
											flex: 2;
											margin-right: 10px;
										}

										> div:last-of-type {
											flex: 1;
										}
									}

									.delegate {
										min-height: 215px;
									}
								}
							}
						}

						.trade-con {
							position: relative;
							display: flex;
							padding: 15px 0;

							.split {
								flex: 1;

								&:first-of-type {
									margin-right: 4px;
								}

								&:last-of-type {
									margin-left: 4px;
								}
							}
						}

						.guadan {
							display: flex;
							justify-content: space-between;
						}

						.trade-card {
							padding: 0 10px 10px;
							@include blockGap;
							color: #fff;
							background: $blockBg;

							.card-head {
								position: relative;
								display: flex;
								justify-content: space-between;
								line-height: 33px;
								height: 34px;
								border-bottom: 1px solid #453f68;

								h4 {
									color: #fff;
									font-size: 14px;
									font-weight: 200;
								}

								.card-actions {
									position: relative;
									> span {
										position: relative;
										display: inline-block;
										padding: 0 5px;
										line-height: 33px;
										font-size: 12px;
										color: #6e668f;
										cursor: pointer;

										&.trade-category {
											em {
												display: inline-block;
												position: relative;
												padding: 0 5px;

												&.active {
													color: #fff;
												}

												&:not(:last-of-type):after {
													content: "/";
													display: inline-block;
													padding-left: 5px;
													color: #6e668f;
												}
											}
										}

										&.search {
											transition: width 0.5s;
											width: 134px;
										}

										&.active {
											background: #241e48;
											.trade-pair-category {
												display: block;
											}
										}
									}
								}
							}

							.trade-tab-con {
								.trade-pair-filter {
									padding: 8px;
								}
								.tarde-tab-head {
									z-index: 5;
									position: relative;
									display: flex;
									justify-content: space-between;
									height: 26px;
									line-height: 26px;
									padding: 0 8px;

									.like {
										cursor: pointer;
									}

									ul {
										display: flex;
										justify-content: flex-start;
										> li {
											height: 26px;
											padding: 0 10px;
											margin-top: -1px;
											margin-left: -1px;
											color: rgba(0, 0, 0, 0.6);
											line-height: 26px;
											cursor: pointer;

											&.active {
												color: #42b3f0;
											}
										}
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
