import React from "react";
import { Carousel, Row, Col } from "antd";
import { inject, observer } from "mobx-react";
import Layout from "../components/Layout";
import Link from "next/link";
import { format } from "@/common/common";

@inject("BaseStore")
@observer
export default class NewsData extends React.Component {
	constructor(props) {
		super(props);
	}
	async componentDidMount() {
		const { getNoticeById } = this.props.BaseStore;
		await getNoticeById({
			id: this.props.id
		});
	}

	render() {
		const { notice, locale, i18n } = this.props.BaseStore;
		const language = i18n.App.Notice;
		return (
			<div className="container">
				<div className="title">
					<span>{!!notice ? notice.subject : ""}</span>
					<span>
						{!!notice && notice.publicationDate
							? `${notice.publicationDate}（UTC）`
							: ""}
					</span>
				</div>
				<div
					className="content"
					dangerouslySetInnerHTML={{ __html: notice ? notice.content : "" }}
				/>
				<style jsx>
					{`
						.container {
							min-height: 500px;
							margin-top: 28px;
							background: #fff;
							width: 1200px;
							margin: 28px auto 0px auto;

							.title {
								width: 1056px;
								margin: 0 auto;
								text-align: center;
								font-weight: 500;
								padding-top: 46px;
								display: flex;
								justify-content: center;
								flex-flow: column;
								span:first-child {
									font-size: 18px;
									color: #221b2f;
								}
								span:last-child {
									font-size: 12px;
									color: #7e7d83;
								}
							}
							.content {
								padding-top: 48px;
								width: 1056px;
								margin: 0 auto;
								font-size: 14px;
								color: #221b2f;
							}
						}
					`}
				</style>
			</div>
		);
	}
}
