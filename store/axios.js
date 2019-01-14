import axios from "axios";
// import { message, Modal } from "antd";
import { UNAUTHORIZED, TIMEOUT } from "../utils/constant";
import Utils from "../utils";
import Cookies from "universal-cookie";
import configs from "../config";
import Router from "next/router";
import { userLogout } from "../store/User/api";
import _ from "lodash";
import { spy } from "mobx";
import i18n from "@/common/i18n";

const cookies = new Cookies();

let ErrorCode = null;
spy(event => {
  if (event.type == "update" && event.name == "locale" && event.newValue) {
    const locale = event.newValue;
    if (locale == cookies.get("locale")) {
      ErrorCode = i18n.get(locale).App.ErrorCode;
    }
  }
});

axios.defaults.timeout = TIMEOUT; //tslint:disable-line

//axios.defaults.baseURL = "https://www.rightbtc.com/"; //Configs.DEFAULT.SERVER;
// axios.defaults.baseURL = "http://54.183.77.249/"; //Configs.DEFAULT.SERVER;
// axios.defaults.baseURL = "http://172.16.0.78";
// axios.defaults.withCredentials =  true;
// 禁止缓存
axios.defaults.headers.get["Content-Type"] = "application/json";
axios.defaults.headers.get["Content-Type"] = "application/json";
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.headers.put["Content-Type"] = "application/json";
axios.defaults.withCredentials = true;
//request to show loading

axios.interceptors.request.use(
  config => {
    const { token } = cookies.get("globals") ? cookies.get("globals") : "";
    // if (config.url.indexOf("kyc") > 0) {
    // 	config.baseURL = configs.kycUrl;
    // 	if (token) {
    // 		config.headers.token = token;
    // 	}
    // } else if (config.url.indexOf("google") > 0 && config.url.indexOf("user") > 0) {
    // 	config.baseURL = configs.googleUrl;
    // 	if (token) {
    // 		config.headers.token = token;
    // 	}
    // } else if (config.url.indexOf("user") > 0) {
    // 	config.baseURL = configs.userUrl;
    // 	if (token) {
    // 		config.headers.token = token;
    // 	}
    // } else if (config.url.indexOf("ticket") > 0) {
    // 	config.baseURL = configs.workorder;
    // 	if (token) {
    // 		config.headers.token = token;
    // 	}
    // } else {
    // 	config.baseURL = configs.baseUrl;
    // }
    config.baseURL = configs.baseUrl;
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

//response to hide loading
axios.interceptors.response.use(
  response => {
    const code = response && response.data ? response.data.code : 200;

    const errorCode =
			(response && response.data && response.data.code && response.data.code != 200) || false;

    //映射错误消息
    if (response && response.data && Utils.isObject(response.data) && errorCode && ErrorCode) {
      let message = ErrorCode[code];
      if (code == 452 || code == 224) {
        message = message.replace(/count/, response.data.description);
      }
      response.data.message = message;
    }

    if (code === 401) {
      // message.error("登录状态已失效");
      cookies.remove("globals", { path: "/" });
      cookies.remove("isLogin", { path: "/" });
      cookies.remove("username", { path: "/" });
      cookies.remove("currentNickname", { path: "/" });
      Router.push(`/${cookies.get("locale")}/login`);
    } else {
      return response && response.data
        ? response.data
        : response && response.status
          ? response.status
          : null;
    }
  },
  error => {
    let code = error.response ? error.response.status : "";
    //没有权限，登出，跳转登录
    if (code === 401) {
      // message.error("登录状态已失效");
      cookies.remove("globals", { path: "/" });
      cookies.remove("isLogin", { path: "/" });
      cookies.remove("username", { path: "/" });
      cookies.remove("currentNickname", { path: "/" });
      Router.push(`/${cookies.get("locale")}/login`);
    }
  }
);

// debug(axios.defaults)
export default axios;
