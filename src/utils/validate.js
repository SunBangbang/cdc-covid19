import {isEmpty} from "@antv/util"

/**
 * 邮箱
 * @param {*} s
 */
export function isEmail (s) {
  return /^([a-zA-Z0-9._-])+@([a-zA-Z0-9_-])+((.[a-zA-Z0-9_-]{2,3}){1,2})$/.test(s)
}

/**
 * 手机号码
 * @param {*} s
 */
export function isMobile (s) {
  return /^1[0-9]{10}$/.test(s)
}

/**
 * 电话号码
 * @param {*} s
 */
export function isPhone (s) {
  return /^([0-9]{3,4}-)?[0-9]{7,8}$/.test(s)
}

/**
 * 身份证
 * @param {*} s
 */
 export function isIdNo (s) {
  // let pattern = '^([1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx])$'
  // let pattern = "^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}$"
  // let reg = new RegExp(pattern);
  let reg = /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}$)/;
  return reg.test(s)
}

/**
 * URL地址
 * @param {*} s
 */
export function isURL (s) {
  return /^http[s]?:\/\/.*/.test(s)
}

export function isTaskName(rule, value, callback) {
  let reg =  /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/
  if (value === '' || value === undefined || value == null) {
    callback()
  } else {
    if ((!reg.test(value)) && value !== '') {
      callback(new Error('任务名称不能包含特殊字符，请重新输入！'))
    } else {
      callback()
    }
  }
}

/**
 * 验证手机号和固定电话
 * @param rule
 * @param value
 * @param callback
 */
export function isMobileOrTelephone(rule, value, callback) {
  let reg =  /^(\d{3}-\d{8}|\d{4}-\d{7}|\d{3}\d{8}|\d{4}\d{7}|1[0-9]{10})$/
  if (value === '' || value === undefined || value == null) {
    callback()
  } else {
    if ((!reg.test(value)) && value !== '') {
      callback(new Error('请输入合法手机号或固定电话号码！'))
    } else {
      callback()
    }
  }
}

/**
 * 验证手机号
 * @param rule
 * @param value
 * @param callback
 */
export function validatePhone(rule, value, callback) {
  let reg =  /^1[0-9]{10}$/
  if (value === '' || value === undefined || value == null) {
    callback()
  } else {
    if ((!reg.test(value)) && value !== '') {
      callback(new Error('请输入合法手机号！'))
    } else {
      callback()
    }
  }
}

export function isValidIdNo(rule, value, callback, label) {
  // console.log('isValidIdNo:', rule, value)
  if (isEmpty(value)) {
    callback(new Error(label + '不能为空'))
  } else {
    let idCardRule = {
      message: label + '非法',
      pattern: '^([1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx])$'
    }
    let reg = new RegExp(idCardRule.pattern)
    if(!reg.test(value)){
      callback(new Error(idCardRule.message))
    } else {
      callback()
    }
  }
}

/**
 * 验证护照
 */
export function isValidPPNo(rule, value, callback, label) {
  // console.log('isValidIdNo:', rule, value)
  if (isEmpty(value)) {
    callback(new Error(label + '不能为空'))
  } else {
    let ppRule = {
      message: label + '非法',
      pattern: '^([a-zA-z]|[0-9]){5,17}$'
    }
    let reg = new RegExp(ppRule.pattern)
    if(!reg.test(value)){
      callback(new Error(ppRule.message))
    } else {
      callback()
    }
  }
}

/**
 * 验证军官证
 */
export function isValidOCNo(rule, value, callback, label) {
  // console.log('isValidIdNo:', rule, value)
  if (isEmpty(value)) {
    callback(new Error(label + '不能为空'))
  } else {
    let ocRule = {
      message: label + '非法',
      pattern: '^[\u4E00-\u9FA5](字第)([0-9a-zA-Z]{4,8})(号)$'
    }
    let reg = new RegExp(ocRule.pattern)
    if(!reg.test(value)){
      callback(new Error(ocRule.message))
    } else {
      callback()
    }
  }
}

/**
 * 验证港澳通行证
 */
export function isValidHKPCNo(rule, value, callback, label) {
  // console.log('isValidIdNo:', rule, value)
  if (isEmpty(value)) {
    callback(new Error(label + '不能为空'))
  } else {
    let pcCardRule = {
      message: label + '非法',
      pattern: '^[HMhm]{1}([0-9]{10}|[0-9]{6})$',
    }
    let reg = new RegExp(pcCardRule.pattern)
    if(!reg.test(value)){
      callback(new Error(pcCardRule.message))
    } else {
      callback()
    }
  }
}

/**
 * 验证台湾通行证
 */
export function isValidTWPCNo(rule, value, callback, label) {
  // console.log('isValidIdNo:', rule, value)
  if (isEmpty(value)) {
    callback(new Error(label + '不能为空'))
  } else {
    let pcCardRule = {
      message: label + '非法',
      pattern: '^[a-zA-Z][0-9]{9}$',
    }
    let reg = new RegExp(pcCardRule.pattern)
    if(!reg.test(value)){
      callback(new Error(pcCardRule.message))
    } else {
      callback()
    }
  }
}

export function isMapAddress(rule, value, callback) {
  if (value === undefined|| value === null || value.formattedAddress === undefined) {
    callback(new Error('请选择地址！'))
  } else {
    callback()
  }
}

export function isRegionAddress(rule, value, callback) {
  let b = value === undefined || value.name === undefined || value.name === null || value.name===''
  if (b) {
    callback(new Error('请选择地址！'))
  } else {
    // if(isEmpty(value.detailedAddress)){
    //   callback(new Error('请选择地址！'))
    // }else{
    //   callback()
    // }
    callback()
  }
}
