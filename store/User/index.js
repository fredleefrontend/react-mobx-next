import { observable, action, runInAction, computed, when, extendObservable, autorun } from "mobx";
import Cookies from "universal-cookie";
import i18n from "../../common/i18n";
import router from "next/router";
import { notification } from "antd";
import _debug from "debug";
import Utils from "../../utils";
import { email, phone } from "@/utils/constant";
import _ from "lodash";
import ParentStore from "../parentStore";

import {
  
} from "./api";

const debug = _debug("app: UserStore");
const cookies = new Cookies();

export default class UserStore extends ParentStore {
	root = null;
	constructor(isServer, preFetchObj, root) {
	  super();
	  this.root = root;
	}
}
