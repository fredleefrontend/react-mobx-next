import React from "react";
import { Carousel, Row, Col, Spin, Pagination } from "antd";
import Swiper from "react-id-swiper";
import { inject, observer } from "mobx-react";
import { action, observable, computed } from "mobx";
import Layout from "../components/Layout";
import Link from "@/components/Link";
import { format } from "@/common/common";

@inject("BaseStore")
@observer
export default class NewsList extends React.Component {
	@observable
	pagination = {
		pageNo: 1,
		pageSize: 10
	};
	constructor(props) {
		super(props);
	}

	componentDidMount = async () => {
		const { getNoticeList, locale } = this.props.BaseStore;
		await getNoticeList({
			language: locale.slice(0, -3),
			...this.pagination
		});
	};

	render() {
		const { noticeList, noticeListLoading, locale, noticeCount } = this.props.BaseStore;
		const noData = locale === 'zh_cn' ? '暂无数据' : 'No Data';
		return (
			<div className="container">
				<div className="row">
					{Array.from(noticeList).length > 0 ? (
						Array.from(noticeList).map((item, index) => {
							return (
								<div className="item" key={index}>
									<Link
										href={{ pathname: `/${locale}/newsDetail`, query: { id: item.id } }}
										as={`/${locale}/n/${item.id}`}
										key="news"
									>
										<a className="title">{item.subject}</a>
									</Link>

									<div className="time">{item.publicationDate}（UTC）</div>
								</div>
							);
						})
					) : (
						<div className="loading" style={{ textAlign: "center" }}>
							{
								noticeListLoading ? <Spin /> : noData
							}
							
						</div>
					)}
					{Array.from(noticeList).length > 0 ? (
						<div className="page">
							<Pagination
								defaultCurrent={1}
								total={noticeCount}
								onChange={async pageNo => {
									const { getNoticeList, locale } = this.props.BaseStore;
									this.pagination.pageNo = pageNo;
									await getNoticeList({
										language: locale.slice(0, -3),
										...this.pagination
									});
								}}
							/>
						</div>
					) : (
						""
					)}
				</div>
				<style jsx>
					{`
						.container {
							width: 1200px;
							margin: 28px auto 0;
							background: #fff;
							min-height: 500px;
							padding: 48px 32px 97px 32px;
							.row {
								.page {
									text-align: right;
									margin-top: 30px;
								}
								.item {
									display: flex;
									justify-content: space-between;
									border-bottom: 1px solid #e2e1f0;
									padding: 10px 0 12px 0;
									.title {
										width: 720px;
										font-size: 14px;
										color: #221b2f;
										overflow: hidden;
										white-space: nowrap;
										text-overflow: ellipsis;
										&:hover {
											color: #7571d1;
										}
									}
									.time {
										flex-grow: 0.5;
										text-align: right;
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
