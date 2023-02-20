import "babel-polyfill";
import axios from "axios";
import Cookies from "js-cookie";
import router from "@/router";
import qs from "qs";
import { clearLoginInfo } from "@/utils";
import isPlainObject from "lodash/isPlainObject";
import sm2Utils from "@/utils/sm2";
import sm4Utils from "@/utils/sm4";
import store from "@/store";

const http = axios.create({
  baseURL: window.SITE_CONFIG["apiURL"],
  timeout: 1000 * 180,
  withCredentials: true
});

/**
 * 请求拦截
 */
http.interceptors.request.use(
  config => {
    config.headers["Accept-Language"] = Cookies.get("language") || "zh-CN";
    // if (config.url !== '/oauth/token') {
    //   config.headers['Authorization'] = 'Bearer ' + Cookies.get('access_token') || ''
    // }else{
    //   if (store.state.cryptoOpen === true){
    //     config.data.password = sm2Utils.encrypt(config.data.password, store.state.publicKey);
    //   }
    // }
    if (store.state.wihteList.indexOf(config.url) === -1) {
      config.headers["Authorization"] =
        "Bearer " + Cookies.get("access_token") || "";
    } else {
      if (store.state.cryptoOpen === true && !!config.data.password) {
        config.data.password = sm2Utils.encrypt(
          config.data.password,
          store.state.publicKey
        );
      }
    }
    // 默认参数
    var defaults = {};
    // 防止缓存，GET请求默认带_t参数
    if (config.method === "get") {
      config.params = {
        ...config.params,
        ...{ _t: new Date().getTime() }
      };
    }

    if (isPlainObject(config.params)) {
      config.params = {
        ...defaults,
        ...config.params
      };
    }

    if (isPlainObject(config.data)) {
      config.data = {
        ...defaults,
        ...config.data
      };
      if (
        /^application\/x-www-form-urlencoded/.test(
          config.headers["content-type"]
        )
      ) {
        config.data = qs.stringify(config.data);
      }

      if (store.state.cryptoOpen === true && config.method === "post") {
        if (store.state.wihteList.indexOf(config.url) === -1) {
          // 加密post的body
          const sm4Key = !!store.state.keyForSm4
            ? store.state.keyForSm4
            : localStorage.getItem("keyForSm4");
          let json = JSON.stringify(config.data);
          config.data = sm4Utils.encrypt(json, sm4Key);
        }

        config.headers.post["Content-Type"] = "application/json";
      }
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

/**
 * 响应拦截
 */
http.interceptors.response.use(
  response => {
    // console.log('interceptor response:', response)
    //解密responseBody, 解密方式和后端保持一致
    // if (store.state.cryptoOpen === true) {
    //   if (response.config.url.endsWith("/oauth/token")) {
    //     let data = response.data;
    //     data = sm2Utils.decrypt(data, store.state.privateKey);
    //     response.data = JSON.parse(data);
    //   } else {
    //     let data = response.data;
    //     data = sm4Utils.decrypt(data, store.state.key);
    //     response.data = JSON.parse(data);
    //   }
    // }
    // console.log(response);
    if (
      store.state.cryptoOpen === true &&
      response.config.responseType !== "blob"
    ) {
      const isWihteIndex = store.state.wihteList.findIndex(element =>
        response.config.url.endsWith(element)
      );
      const isUploadIndex = store.state.uploadList.findIndex(element =>
        response.config.url.endsWith(element)
      );

      if (isWihteIndex !== -1 && isUploadIndex === -1) {
        const data = sm2Utils.decrypt(response.data, store.state.privateKey);
        if (data === "") {
          return Promise.reject("未知错误！");
        } else {
          response.data = JSON.parse(data);
        }
      } else {
        const key = !!store.state.key
          ? store.state.key
          : localStorage.getItem("keyForSm4");
        const data = sm4Utils.decrypt(response.data, key);
        if (data === "") {
          return Promise.reject("未知错误！");
        } else {
          response.data = JSON.parse(data);
        }
      }
    }
    if (response.data.code === 401 || response.data.code === 10001) {
      clearLoginInfo();
      router.replace({ name: "login" });
      return Promise.reject(response.data.msg);
    }
    return response;
  },
  error => {
    console.error(error);
    return Promise.reject(error);
  }
);

export default http;
