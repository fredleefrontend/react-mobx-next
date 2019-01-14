import React from "react";
import { inject, observer } from "mobx-react";
import { action, observable, computed } from "mobx";
import Link from "next/link";
import { withRouter } from "next/router";
import { Popover, message } from "antd";
import Utils from "@/utils";
// import { credentialList } from "../../config";

@inject("BaseStore")
@withRouter
@observer
class SettingsView extends React.Component {
	constructor(props) {
		super(props);
	}

	async componentDidMount() {
		const { getSettings, isLogin, getKycStatus, getUserInfo, locale } = this.props.BaseStore;
		if (!isLogin) {
			this.props.router.push(`/${locale}/login`);
		} else {
			await getSettings();
			await getKycStatus();
			await getUserInfo();
		}
	}

	render() {
		const { BaseStore } = this.props;
		const { userInfo, i18n, locale, kycStatus, kycUserInfo } = BaseStore;
		const hasEmail = userInfo.hasEmail;
		const Settings = i18n.App.Settings;
		let credentialList = [
			{
				name: Settings.idCard,
				value: 1
			},
			{
				name: Settings.passport,
				value: 2
			},
			{
				name: Settings.driver,
				value: 3
			}
		];
		const c1UserInfo = !!kycUserInfo ? (
			<div className="content">
				<dl>
					<dt>{Settings.userKey.name}:</dt>
					<dd>{kycUserInfo.realName}</dd>
				</dl>
				<dl>
					<dt>{Settings.userKey.country}:</dt>
					<dd>{locale === 'zh_cn' ? kycUserInfo.nationalName : kycUserInfo.nationalCode }</dd>
				</dl>
				<dl>
					<dt>{Settings.userKey.docuType}:</dt>
					<dd>{credentialList.find(x => x.value === kycUserInfo.credential).name}</dd>
				</dl>
				<dl>
					<dt>{Settings.userKey.docuNum}:</dt>
					<dd>{kycUserInfo.credentialCode}</dd>
				</dl>
				<style jsx>{`
					.content {
						padding-top: 16px;
						padding-left: 24px;
						dl {
							display: flex;
							justify-content: flex-start;
							padding: 8px 0;
							dt {
								width: 60px;
							}
							dd {
								margin-left: 30px !important;
								word-break: break-all;
								max-width: 200px;
							}
						}
					}
				`}</style>
			</div>
		) : (
			""
		);
		return (
			<div className="setting-tab">
				{/* 基本信息 */}
				<div className="setting-item">
					<h3>{Settings.baseTitle}</h3>
					<div className="setting-item-content">
						<div className="setting-item-list">
							<dl className="account-on" />
							<dl>
								<dt>{Settings.account.name}</dt>
								<dd>{Settings.account.desc}</dd>
								<dt>{userInfo.userId}</dt>
							</dl>
						</div>
						<div className="setting-item-list">
							<dl className={`tel-${userInfo.phone ? "on" : "off"}`} />
							<dl>
								<dt>{Settings.tel.name}</dt>
								<dd>{Settings.tel.desc}</dd>
								{/* this.props.BaseStore.userName */}
								{!!userInfo.phone ? (
									<dt>{Utils.decodeUserName(userInfo.phoneBinded)}</dt>
								) : (
									<dt>
										<Link
											href={{ pathname: `/${locale}/settings/bind2FA`, query: { type: "phone" } }}
											as={`/${locale}/settings/bind2FA/phone`}
										>
											<a>{Settings.binding}</a>
										</Link>
									</dt>
								)}
							</dl>
						</div>
						<div className="setting-item-list">
							<dl className="email-on" />
							<dl>
								<dt>{Settings.email.name}</dt>
								<dd>{Settings.email.desc}</dd>
								{hasEmail ? (
									<dt>
										{/* <span>{Settings.binded}</span> */}
										{Utils.decodeUserName(userInfo.emailBinded)}
									</dt>
								) : (
									<dt>
										<Link
											href={{ pathname: `/${locale}/settings/bind2FA`, query: { type: "email" } }}
											as={`/${locale}/settings/bind2FA/email`}
										>
											<a>{Settings.binding}</a>
										</Link>
									</dt>
								)}
							</dl>
						</div>
					</div>
				</div>

				{/* 安全设置 */}
				<div className="setting-item">
					<h3>{Settings.secuTitle}</h3>
					<div className="setting-item-content">
						<div className="setting-item-list">
							<dl className="password-on" />
							<dl>
								<dt>{Settings.login.name}</dt>
								<dd />
								<dt>
									<span>{Settings.beenSet}</span>
									<Link href={`/${locale}/settings/password`}>
										<a>{Settings.edit}</a>
									</Link>
								</dt>
							</dl>
						</div>
						<div className="setting-item-list">
							<dl className={`fundspwd-${!!userInfo.secertStatus ? "on" : "off"}`} />
							<dl>
								<dt>{Settings.funds.name}</dt>
								<dd />
								{userInfo.secertStatus ? (
									<dt>
										<span>{Settings.beenSet}</span>
										<Link href={`/${locale}/settings/fundsPwd`}>
											<a>{Settings.edit}</a>
										</Link>
									</dt>
								) : (
									<dt>
										<Link href={`/${locale}/settings/fundsPwd`}>
											<a>{Settings.notSet}</a>
										</Link>
									</dt>
								)}
							</dl>
						</div>
					</div>
				</div>
				{/* KYC */}
				<div className="setting-item">
					<h3>{Settings.identityTitle}</h3>
					<div className="setting-item-content">
						<div className="setting-item-list">
							<dl className={`C1-${kycStatus.c1Status === 1 ? "on" : "off"}`} />
							<dl>
								<dt>{Settings.c1.name}</dt>
								<dd />
								{kycStatus.c1Status === 1 ? (
									<Popover
										content={c1UserInfo}
										title={Settings.c1Title}
										trigger="hover"
										overlayClassName="c1user-info"
									>
										<dt style={{ color: "#1890FE", cursor: "pointer" }}>{Settings.certified}</dt>
									</Popover>
								) : (
									<dt>
										<Link href={`/${locale}/settings/c1Auth`}>
											<a>{Settings.notSet}</a>
										</Link>
									</dt>
								)}
							</dl>
						</div>
						<div className="setting-item-list">
							<dl className={`C2-${kycStatus.c2Status === 1 ? "on" : "off"}`} />
							<dl>
								<dt>{Settings.c2.name}</dt>
								<dd />
								{kycStatus.c2.isCerting ? (
									<dt>
										<span style={{ marginRight: "0px" }}>{Settings.pending}</span>
									</dt>
								) : null}

								{kycStatus.c1.isUnset && kycStatus.c2.isUnset ? (
									<dt>
										<a onClick={() => message.error(Settings.c1Certify)}>{Settings.notSet}</a>
									</dt>
								) : null}
								{kycStatus.c1.isCerted && (kycStatus.c2.isUnset || kycStatus.c2.isRefuse) ? (
									<dt>
										<Link
											href={{
												pathname: `/${locale}/settings/c2Auth`,
												query: { status: kycStatus.c2Status }
											}}
										>
											<a>{kycStatus.c2.isRefuse ? Settings.AuthFail : Settings.notSet}</a>
										</Link>
									</dt>
								) : null}

								{kycStatus.c2.isCerted ? (
									<dt>
										<span style={{ marginRight: "0px" }}>{Settings.beenSet}</span>
									</dt>
								) : null}
							</dl>
						</div>
					</div>
				</div>

				{/* 2FA */}
				<div className="setting-item">
					<h3>{Settings.FATitle}</h3>
					<div className="setting-item-content">
						<div className="setting-item-list">
							<dl className={`google-${userInfo.googleBinded ? "on" : "off"}`} />
							<dl>
								<dt>{Settings.google.name}</dt>
								<dd />
								{userInfo.googleBinded ? (
									<dt>
										<span>{Settings.binded}</span>
										<Link
											href={{
												pathname: `/${locale}/settings/bind2FA/`,
												query: { type: "unbindGoogle" }
											}}
											as={`/${locale}/settings/bind2FA/unbindGoogle`}
										>
											<a>{Settings.unbundling}</a>
										</Link>
									</dt>
								) : (
									<dt>
										<Link href={`/${locale}/settings/bind2FA/google`}>
											<a>{Settings.unbounded}</a>
										</Link>
									</dt>
								)}
							</dl>
						</div>
					</div>
				</div>

				{/* 其他 */}
				<div className="setting-item">
					<h3>{Settings.otherTitle}</h3>
					<div className="setting-item-content">
						<div className="setting-item-list">
							<dl className="api-off" />
							<dl>
								<dt>{Settings.api.name}</dt>
								<dd>{Settings.api.desc}</dd>
								<dt>{/* <Link href={`/${locale}/xxxxxxxx`}>
										<a>{Settings.gain}</a>
									</Link> */}</dt>
							</dl>
						</div>
						<div className="setting-item-list">
							<dl className="order-off" />
							<dl>
								<dt>{Settings.workOrder.name}</dt>
								<dd>{Settings.workOrder.desc}</dd>
								<dt>
									<Link href={`/${locale}/workorder/lists`}>
										<a>{Settings.entry}</a>
									</Link>
								</dt>
							</dl>
						</div>
					</div>

					<div className="last-div" />
				</div>

				<style jsx>{`
					.setting-tab {
						max-width: 1200px;
						margin: 20px auto 0;
						background-color: #ffffff;

						.setting-item {
							padding-top: 44px;
							h3 {
								position: relative;
								padding-left: 20px;
								margin: 0;
								font-family: PingFangSC-Medium;
								color: #151f3f;
								font-size: 16px;
								font-weight: bold;
								line-height: 24px;
								&:before {
									content: "";
									position: absolute;
									top: 0;
									left: 0;
									width: 5px;
									height: 22px;
									background: #40b2f0;
								}
							}
							.setting-item-content {
								width: 994px;
								margin: 0 auto;
								padding-top: 22px;

								> div {
									border-bottom: 2px solid #e9e7ee;
								}
							}
						}
						.setting-item-list {
							display: flex;
							// justify-content: space-between;
							justify-content: flex-start;
							align-items: center;
							padding: 20px 0;
							dl {
								position: relative;
								line-height: 24px;

								&:first-of-type {
									padding-left: 120px;
									padding-top: 42px;

									&:before {
										content: "";
										position: absolute;
										top: 0;
										left: 0;
										width: 44px;
										height: 44px;
									}
								}
								dt {
									display: inline-block;
									width: 100px;
									font-family: PingFangSC-Medium;
									font-size: 14px;
									color: #221b2f;
									&:first-child {
										font-weight: bold;
									}
									&:last-child {
										width: 393px;
										text-align: right;
									}
									span {
										color: #c2c0c6;
										margin-right: 30px;
									}
								}
								dd {
									display: inline-block;
									margin-left: 100px !important;
									width: 280px;
									font-family: PingFangSC-Regular;
									font-size: 12px;
									color: #c2c0c6;

									&.funds-edit {
										a {
											display: block;
											text-align: right;

											label {
												display: block;
											}
										}
									}
								}

								&.account-on::before,
								&.account-off::before {
									background: url("/static/rbimages/settings/account-on.png") center / cover;
								}

								&.email-on::before,
								&.email-off::before {
									background: url("/static/rbimages/settings/email-on.png") center / cover;
								}
								&.api-on::before,
								&.api-off::before {
									background: url("/static/rbimages/settings/api-on.png") center / cover;
								}

								&.tel-on::before {
									background: url("/static/rbimages/settings/tel-on.png") center / cover;
								}

								&.tel-off::before {
									background: url("/static/rbimages/settings/tel-off.png") center / cover;
								}

								&.C1-on::before {
									background: url("/static/rbimages/settings/C1-on.png") center / cover;
								}

								&.C1-off::before {
									background: url("/static/rbimages/settings/C1-off.png") center / cover;
								}

								&.C2-on::before {
									background: url("/static/rbimages/settings/C2-on.png") center / cover;
								}
								&.C2-off::before {
									background: url("/static/rbimages/settings/C2-off.png") center / cover;
								}
								&.password-on::before {
									background: url("/static/rbimages/settings/password-on.png") center / cover;
								}
								&.password-off::before {
									background: url("/static/rbimages/settings/password-off.png") center / cover;
								}

								&.fundspwd-on::before {
									background: url("/static/rbimages/settings/fundspwd-on.png") center / cover;
								}
								&.fundspwd-off::before {
									background: url("/static/rbimages/settings/fundspwd-off.png") center / cover;
								}
								&.google-on::before {
									background: url("/static/rbimages/settings/Google-verifier-on.png") center / cover;
								}
								&.google-off::before {
									background: url("/static/rbimages/settings/Google-verifier-off.png") center /
										cover;
								}
								&.order-on::before {
									background: url("/static/rbimages/settings/User-work-order-on.png") center / cover;
								}
								&.order-off::before {
									background: url("/static/rbimages/settings/User-work-order-off.png") center /
										cover;
								}
							}
						}

						.last-div {
							height: 200px;
						}
					}
				`}</style>
			</div>
		);
	}
}

export default SettingsView;
