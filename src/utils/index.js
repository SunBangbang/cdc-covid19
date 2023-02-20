import Cookies from "js-cookie";
import store from "@/store";
import { getSpecialWorkOptions } from "@/api/sys/specialWork";

/**
 * 权限
 * @param {*} key
 */
export function hasPermission(key) {
  return window.SITE_CONFIG["permissions"].indexOf(key) !== -1 || false;
}

/**
 * IM
 * @param {Object} func
 * @param {Object} wait
 */
export function throttle(func, wait) {
  let timeout;
  return function() {
    let that = this;
    let args = arguments;

    if (!timeout) {
      timeout = setTimeout(() => {
        timeout = null;
        func.apply(that, args);
      }, wait);
    }
  };
}

/**
 * 利用 document.title 做新消息提示
 * @export
 * @param {Number} count
 */
export function titleNotify(count) {
  const hasNewMessage = count > 0;
  if (hasNewMessage) {
    if (document.title.search(/\((.*?)\)/) >= 0) {
      document.title = document.title.replace(
        /\((.*?)\)/,
        `(${count > 99 ? "99+" : count})`
      );
    } else {
      document.title = `(${count})${document.title}`;
    }
  } else {
    document.title = document.title.replace(/\((.*?)\)/, "");
  }
}

/**
 * 获取字典数据列表
 * @param dictType  字典类型
 */
export function getDictDataList(dictType) {
  let type = {};
  if (window.SITE_CONFIG["dictList"]) {
    type = window.SITE_CONFIG["dictList"].find(
      element => element.dictType === dictType
    );
  } else {
    console.log("dictList is null, load dictList from localStorage");
    let data = localStorage.getItem("dictList");
    if (data) {
      let dictList = JSON.parse(data);
      type = dictList.find(element => element.dictType === dictType);
    }
  }
  if (type) {
    return type.dataList;
  } else {
    return [];
  }
}

/**
 * 获取业务字典数据列表
 * @param dictType  字典类型
 */
export function getBizDictDataList(dictType) {
  let type = {};
  if (window.SITE_CONFIG["bizDictList"]) {
    type = window.SITE_CONFIG["bizDictList"].find(
      element => element.dictType === dictType
    );
  } else {
    console.log("bizDictList is null, load bizDictList from localStorage");
    let data = localStorage.getItem("bizDictList");
    if (data) {
      let dictList = JSON.parse(data);
      type = dictList.find(element => element.dictType === dictType);
    }
  }
  if (type) {
    return type.dataList;
  } else {
    return [];
  }
}

/**
 * 获取业务属性表单模板列表
 * @param dictType  字典类型
 */
export function getBizFormTemplateKeys() {
  let templates = [];
  if (window.SITE_CONFIG["bizDictList"]) {
    templates = window.SITE_CONFIG["bizDictList"].map(ele => {
      return { id: ele.id, dicType: ele.dictType };
    });
  } else {
    console.log("bizDictList is null, load bizDictList from localStorage");
    let data = localStorage.getItem("bizDictList");
    if (data) {
      let dictList = JSON.parse(data);
      templates = window.SITE_CONFIG["bizDictList"].map(ele => {
        return { id: ele.id, dicType: ele.dictType };
      });
    }
  }
  return templates ? templates : [];
}

/**
 * 获取字典名称
 * @param dictType  字典类型
 * @param dictValue  字典值
 */
export function getDictLabel(dictType, dictValue) {
  if (
    window.SITE_CONFIG["dictList"] &&
    window.SITE_CONFIG["dictList"].length > 0
  ) {
    const type = window.SITE_CONFIG["dictList"].find(
      element => element.dictType === dictType
    );
    if (type) {
      const val = type.dataList.find(
        element => element.dictValue === dictValue + ""
      );
      if (val) {
        return val.dictLabel;
      } else {
        return dictValue;
      }
    } else {
      return dictValue;
    }
  } else {
    return "";
  }
}

/**
 * 获取字典名称
 * @param dictType  字典类型
 * @param dictValue  字典值
 */
export function getDictValue(dictType, dictLabel) {
  if (
    window.SITE_CONFIG["dictList"] &&
    window.SITE_CONFIG["dictList"].length > 0
  ) {
    const type = window.SITE_CONFIG["dictList"].find(
      element => element.dictType === dictType
    );
    if (type) {
      const val = type.dataList.find(
        element => element.dictLabel === dictLabel + ""
      );
      if (val) {
        return val.dictValue;
      } else {
        return dictLabel;
      }
    } else {
      return dictLabel;
    }
  } else {
    return "";
  }
}

/**
 * 获取特殊场所名称
 * @param value 值
 */
export function getSpecialWorkLabel(value) {
  const val = getSpecialWorkOptions();
  let data = "非重点场所工作人员";
  val.forEach(item => {
    if (value == item.value) {
      data = item.label;
    }
  });
  return data;
}

/**
 * 清除登录信息
 */
export function clearLoginInfo() {
  store.commit("resetStore");
  Cookies.remove("access_token");
  window.SITE_CONFIG["dynamicMenuRoutesHasAdded"] = false;
  localStorage.removeItem("keyForSm4");
}

/**
 * 获取uuid
 */
export function getUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    return (c === "x" ? (Math.random() * 16) | 0 : "r&0x3" | "0x8").toString(
      16
    );
  });
}

/**
 * 获取uuid, 可以指定长度和基数, 如: uuid(8, 16) // "098F4D35"
 */
export function getUUID2(len = 8, radix = 16) {
  let chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(
    ""
  );
  let uuid = [],
    i;
  radix = radix || chars.length;

  if (len) {
    // Compact form
    for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)];
  } else {
    // rfc4122, version 4 form
    let r;

    // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = "-";
    uuid[14] = "4";

    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16);
        uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r];
      }
    }
  }

  return uuid.join("");
}

/**
 * 获取svg图标(id)列表
 */
export function getIconList() {
  let res = [];
  let list = document.querySelectorAll("svg symbol");
  for (let i = 0; i < list.length; i++) {
    res.push(list[i].id);
  }

  return res;
}

/**
 * 树形数据转换
 * @param {*} data
 * @param {*} id
 * @param {*} pid
 */
export function treeDataTranslate(data, id = "id", pid = "pid") {
  let res = [];
  let temp = {};
  for (let i = 0; i < data.length; i++) {
    temp[data[i][id]] = data[i];
  }
  for (let k = 0; k < data.length; k++) {
    if (!temp[data[k][pid]] || data[k][id] === data[k][pid]) {
      res.push(data[k]);
      continue;
    }
    if (!temp[data[k][pid]]["children"]) {
      temp[data[k][pid]]["children"] = [];
    }
    temp[data[k][pid]]["children"].push(data[k]);
    data[k]["_level"] = (temp[data[k][pid]]._level || 0) + 1;
  }
  return res;
}

// 将workbook装化成blob对象
export function workbook2blob(workbook) {
  // 生成excel的配置项
  let wopts = {
    // 要生成的文件类型
    bookType: "xlsx",
    // // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
    bookSST: false,
    type: "binary"
  };
  let wbout = XLSX.write(workbook, wopts);
  // 将字符串转ArrayBuffer
  function s2ab(s) {
    let buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    for (let i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  }
  let blob = new Blob([s2ab(wbout)], {
    type: "application/octet-stream"
  });
  return blob;
}

// 将blob对象创建bloburl，然后用a标签实现弹出下载框
export function openDownloadDialog(blob, fileName) {
  if (typeof blob == "object" && blob instanceof Blob) {
    blob = URL.createObjectURL(blob); // 创建blob地址
  }
  var aLink = document.createElement("a");
  aLink.href = blob;
  // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，有时候 file:///模式下不会生效
  aLink.download = fileName || "";
  var event;
  if (window.MouseEvent) event = new MouseEvent("click");
  //   移动端
  else {
    event = document.createEvent("MouseEvents");
    event.initMouseEvent(
      "click",
      true,
      false,
      window,
      0,
      0,
      0,
      0,
      0,
      false,
      false,
      false,
      false,
      0,
      null
    );
  }
  aLink.dispatchEvent(event);
}

/**
 * 是否为空
 * @param val
 * @returns {boolean}
 */
export function isEmpty(val) {
  // null or undefined
  if (val == null) return true;
  if (typeof val === "boolean") return false;
  if (typeof val === "number") return !val;
  // if (typeof val === 'number') return (val ===0? false : !val);
  if (val instanceof Error) return val.message === "";

  switch (Object.prototype.toString.call(val)) {
    // String or Array
    case "[object String]":
    case "[object Array]":
      return !val.length;

    // Map or Set or File
    case "[object File]":
    case "[object Map]":
    case "[object Set]": {
      return !val.size;
    }
    // Plain Object
    case "[object Object]": {
      return !Object.keys(val).length;
    }
  }

  return false;
}

export function getResult(data) {
  let result = {};
  result.data = {};
  result.data.code = 0;
  if (data) {
    result.data.data = data;
  }
  return result;
}

/**
 * 格式化时间: 分、秒
 * @param value
 * @returns {string}
 */
export function formatTime(value) {
  if (value == 0) return "0秒";
  // console.log('time:', value)
  let minute = parseInt(value / 60);
  let seconds = value % 60;
  if (minute > 0) {
    return minute + "分" + (seconds > 0 ? seconds + "秒" : "");
  } else {
    return seconds > 0 ? seconds + "秒" : "";
  }
}
