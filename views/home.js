// import React from "react";
// import { Carousel, Row, Col } from "antd";
// import Swiper from "react-id-swiper";
// import { inject, observer } from "mobx-react";
// import Trend from "../components/tradingView/Trend";
// import Link from "next/link";
// import TradePreview from "../components/TradePreview";
// import Head from "next/head";

// @inject("BaseStore")
// @inject("TradeStore")
// @observer
// export default class Home extends React.Component {
// 	constructor(props) {
// 		super(props);
// 		this.state = {
// 			activeAssetCoin: "ZDC",
// 			activeMainCoin: "ETP"
// 		};
// 	}

// 	async componentDidMount() {
// 		const { getSettings, isLogin } = this.props.BaseStore;
// 		const { getTickers, getActiveTicker, pageTickers } = this.props.TradeStore;
// 		await getTickers();
// 	}

// 	handleTickers(data) {
// 		this.setState({
// 			activeAssetCoin: data.asset,
// 			activeMainCoin: data.askAsset
// 		});
// 		this.props.TradeStore.getActiveTicker(data.asset, data.askAsset);
// 	}

// 	render() {
// 		const params = {
// 			navigation: {
// 				nextEl: ".swiper-button-next",
// 				prevEl: ".swiper-button-prev"
// 			},
// 			spaceBetween: 30
// 		};

// 		const tradingProps = {
// 			interval: "1",
// 			symbol: "BTC",
// 			locale: "zh"
// 		};
// 		const { i18n } = this.props.BaseStore;
// 		const { activeTicker, pageTickers } = this.props.TradeStore;
// 		const HomeText = i18n.App.Home;
// 		console.log("activeTicker", activeTicker);
// 		return (
// 			<div className="home">
// 				<div className="rbtc-carousel-wrapper">
// 					<Swiper {...params}>
// 						<div className="rbtc-carousel-slider">
// 							<ul className="banner-list">
// 								<li>
// 									<Link href="/">
// 										<a>
// 											<img src="/static/rbimages/home/coinlancer.png" alt="" />
// 										</a>
// 									</Link>
// 								</li>
// 								<li>
// 									<Link href="/">
// 										<a>
// 											<img src="/static/rbimages/home/coinlancer.png" alt="" />
// 										</a>
// 									</Link>
// 								</li>
// 								<li>
// 									<Link href="/">
// 										<a>
// 											<img src="/static/rbimages/home/coinlancer.png" alt="" />
// 										</a>
// 									</Link>
// 								</li>
// 							</ul>
// 						</div>
// 						<div className="rbtc-carousel-slider">
// 							<ul className="banner-list">
// 								<li>
// 									<Link href="/">
// 										<a>
// 											<img src="/static/rbimages/home/coinlancer.png" alt="" />
// 										</a>
// 									</Link>
// 								</li>
// 								<li>
// 									<Link href="/">
// 										<a>
// 											<img src="/static/rbimages/home/coinlancer.png" alt="" />
// 										</a>
// 									</Link>
// 								</li>
// 								<li>
// 									<Link href="/">
// 										<a>
// 											<img src="/static/rbimages/home/coinlancer.png" alt="" />
// 										</a>
// 									</Link>
// 								</li>
// 							</ul>
// 						</div>
// 					</Swiper>
// 					<div className="balance-types">
// 						<ul>
// 							{Array.from(pageTickers).length
// 								? Array.from(pageTickers).map((item, index) => {
// 										return (
// 											<li
// 												key={index}
// 												className={
// 													this.state.activeAssetCoin === item.asset &&
// 													this.state.activeMainCoin === item.askAsset
// 														? "active"
// 														: ""
// 												}
// 												onClick={() => {
// 													this.handleTickers(item);
// 												}}
// 											>
// 												<p>
// 													{item.asset}/{item.askAsset}
// 												</p>
// 												<p className={item.differenceClass}>{item.hightPrice}</p>
// 											</li>
// 										);
// 								  })
// 								: null}
// 						</ul>
// 					</div>
// 				</div>
// 				<div className="kline-wrapper">
// 					<TradePreview
// 						style={{ margin: "20px 0" }}
// 						activeTicker={activeTicker}
// 						i18nData={i18n.App.Common}
// 					/>
// 					<p className="kline-ttl">实时价格走势</p>
// 					<Trend {...tradingProps} />
// 				</div>
// 				<div className="home-phone">
// 					<div className="bg-mask" />
// 					<div className="phone-content">
// 						<img src="/static/rbimages/home/phone.png" alt="" />
// 						<div className="ttl">
// 							{HomeText.homePhone.map((item, index) => {
// 								return (
// 									<p key={index}>
// 										<strong>{item}</strong>
// 									</p>
// 								);
// 							})}
// 						</div>
// 					</div>
// 				</div>
// 				<div className="home-advantage">
// 					<h4>{HomeText.advantageTtl}</h4>
// 					<div className="advantage-list">
// 						{HomeText.advantages.map((item, index) => {
// 							return (
// 								<dl className={item} key={index}>
// 									<dt>{HomeText[`advantage${index + 1}`].title}</dt>
// 									<dd>{HomeText[`advantage${index + 1}`].des}</dd>
// 								</dl>
// 							);
// 						})}
// 					</div>
// 				</div>
// 				<style jsx>
// 					{`
// 						.home {
// 							padding-top: 80px;

// 							.swiper-container {
// 								height: 550px;
// 							}

// 							.balance-types {
// 								opacity: 0.8;
// 								color: #fff;
// 								background-color: #141d36;

// 								ul {
// 									display: flex;
// 									justify-content: center;
// 									align-items: flex-start;
// 									flex-flow: wrap;
// 									max-width: 1200px;
// 									margin: 0 auto;

// 									li {
// 										width: 138px;
// 										height: 74px;
// 										padding: 16px;
// 										text-align: center;

// 										p {
// 											margin-bottom: 8px;
// 										}

// 										&.active,
// 										&:hover {
// 											background: #213569;
// 										}
// 									}
// 								}
// 							}

// 							.kline-wrapper {
// 								position: relative;
// 								width: 1200px;
// 								margin: 0 auto 80px;
// 								height: 600px;

// 								&::after {
// 									content: "";
// 									position: absolute;
// 									top: 105px;
// 									left: 0;
// 									width: 100%;
// 									height: 38px;
// 									background: #fff;
// 								}

// 								.kline-ttl {
// 									position: absolute;
// 									top: 106px;
// 									left: 0;
// 									width: 100%;
// 									text-align: center;
// 									color: #000;
// 									z-index: 5;
// 									font-size: 16px;
// 								}

// 								.trade-preview {
// 									border: 1px solid #dcdadd;
// 									height: 86px;
// 									margin: 20px 0;
// 								}
// 								.top {
// 									display: flex;

// 									.split {
// 										flex: 1;
// 										height: 50px;
// 										margin-left: -1px;
// 										margin-top: -1px;
// 										border: 1px solid #dcdadd;

// 										&:last-of-type {
// 											border-right: none;
// 										}

// 										.inner {
// 											padding: 5px 0 0 30px;

// 											> * {
// 												display: block;
// 											}

// 											small {
// 												line-height: 20px;
// 												font-size: 12px;
// 											}
// 										}
// 									}
// 								}
// 								.bottom {
// 									height: 33px;
// 									line-height: 33px;
// 									padding: 0 0 0 30px;
// 									color: #151f42;
// 								}
// 							}

// 							.home-phone {
// 								position: relative;
// 								height: 340px;
// 								margin-bottom: 100px;
// 								background: url("/static/rbimages/home/shutterstock.jpg") no-repeat center/cover
// 									fixed;

// 								.bg-mask {
// 									position: absolute;
// 									width: 100%;
// 									height: 100%;
// 									background: rgba(33, 53, 105, 0.9);
// 									z-index: 1;
// 								}

// 								.phone-content {
// 									position: relative;
// 									width: 1200px;
// 									margin: 0 auto;
// 									z-index: 2;
// 									img {
// 										position: absolute;
// 										top: -4px;
// 										left: 0;
// 										height: 392px;
// 									}
// 									.ttl {
// 										position: absolute;
// 										top: 75px;
// 										right: 78px;
// 										width: 412px;
// 										color: #fff;
// 										font-size: 24px;

// 										p {
// 											margin-bottom: 45px;
// 										}
// 									}
// 								}
// 							}

// 							.home-advantage {
// 								text-align: center;
// 								h4 {
// 									display: inline-block;
// 									position: relative;
// 									color: #272130;
// 									font-size: 18px;
// 									font-weight: 600;

// 									&::before,
// 									&::after {
// 										content: "";
// 										position: absolute;
// 										top: 8px;
// 										width: 40px;
// 										height: 14px;
// 										background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFYAAAAcCAYAAAD7lUj9AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo4RUY5QzQ4NDk2QjMxMUU3QUJCNThDNDEyM0E3NUZDQiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo4RUY5QzQ4NTk2QjMxMUU3QUJCNThDNDEyM0E3NUZDQiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjhFRjlDNDgyOTZCMzExRTdBQkI1OEM0MTIzQTc1RkNCIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjhFRjlDNDgzOTZCMzExRTdBQkI1OEM0MTIzQTc1RkNCIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+cFZYxwAAAopJREFUeNrsmTFP20AUx99zDKmVpmHo2KBUbad8gY51oEOkECIhtWxsHejEV2CAb8CESgcQK0pbhhCSbkh8AJYuoaETSyNSE4rj17+doiZSRSPXqWP1nnQ6Ozmdf/e/8/+ddToFFPl9iV92L5LudeZusv3W5A5FIPY/SdxI9LjpKtk2HwbDrQUF2LFbFRLn3C2NduuIIhLxO5eVrh0794puBcYdmLBCPHlzzfLretxDiPq4aXLshFUxGPowjcxya0VYiphRR9N467CQ2vbzMLN8sUDUXRYmjZkO6oWptVEOrnZmrThCRSZCxVuzacMXd61pLWBlL4u7EJkPZh8Ya4EIS0yv8c48QscglBgqX4DCzhL6ybnvHwaaxU8jFVYccJN43JhI/9xCS0KS60khQ3ErKxhRKGGVsBFLXua7rxvwkDzcw2aN1+uFe2/CBJp531rsCq3C2CaY+LheTL38XbvDs28b5HAepmdje7eemzZC5a5+thbBsooEP4HbYw0ZZd79WIJFPxZx8mHPNJLjc4j6xGVCwnhxSyacx/8ZEXCzhM6NTbDH7TGBW1mB8lglrAolrBJWCatCCTtiYVk+MNMXlFMSqoYNJMQ1VA2XCRvuvVtagpvBzafYx4bOHSOthg+axk+mPb0+N/VqnGb641xqB9XOH7/Q0omx4jbTxgC3sgLlsUpYFTTkCQKTbBJzSYQEBr3texY12nUcvs/weiGqjHx0zJt4Vsk7sPgLbsQu+vK4kewrw2kWUDwru0fe8rTXKZ/Ui6lsFFZWtWkdkdxw08nMdCKrrOC/8Fgmu2+PaUdGAenjHhjDP/DYoTbIBpdiHT3j3Xx3mtFZWkZJ06497mvrKjDuHwIMAE7l5Tpk20rLAAAAAElFTkSuQmCC")
// 											no-repeat center/cover;
// 									}

// 									&::before {
// 										left: -50px;
// 									}

// 									&::after {
// 										right: -50px;
// 									}
// 								}

// 								.advantage-list {
// 									display: flex;
// 									justify-content: center;
// 									align-items: center;
// 									flex-flow: wrap;
// 									width: 1200px;
// 									margin: 0 auto;
// 									padding: 80px 0 100px;

// 									dl {
// 										position: relative;
// 										width: 50%;
// 										padding-left: 60px;
// 										margin-bottom: 50px !important;
// 										text-align: left;

// 										&::before {
// 											content: "";
// 											position: absolute;
// 											top: 0;
// 											left: 0;
// 											width: 40px;
// 											height: 60px;
// 										}

// 										&.safe::before {
// 											background: url("/static/rbimages/home/safe.png") no-repeat center/contain;
// 										}
// 										&.professional::before {
// 											background: url("/static/rbimages/home/safe.png") no-repeat center/contain;
// 										}
// 										&.easy::before {
// 											background: url("/static/rbimages/home/safe.png") no-repeat center/contain;
// 										}
// 										&.multiple::before {
// 											background: url("/static/rbimages/home/safe.png") no-repeat center/contain;
// 										}

// 										dt {
// 											font-size: 18px;
// 											line-height: 38px;
// 											font-weight: 600;
// 										}
// 										dd {
// 											color: #8c8990;
// 										}
// 									}
// 								}
// 							}
// 						}
// 					`}
// 				</style>
// 			</div>
// 		);
// 	}
// }
