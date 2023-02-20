import {isValidIdNo, isValidPPNo, isValidOCNo, isValidHKPCNo, isValidTWPCNo} from "@/utils/validate"
import {isEmpty} from "@antv/util"

//身份证类型
const ID_TYPE = '0'
//护照类型
const PP_TYPE = '1'
//军官证类型
const OC_TYPE = '1672122753581'
//港澳通行证类型
const HK_PC_TYPE = '2'
//台湾通行证类型
const TW_PC_TYPE = '1672122766402'

export default {

  methods: {
    /**
     *
     * 验证身份证号码
     * @param column 证件号输入 input
     * @param idType 证件类型 radio
     * @returns {*[]}
     */
    getNumberRule(column, idType){
      let label = column.label
      let maxLength = column.maxlength
      // console.log('getNumberRule:', column, idType, label, maxLength)
      // let idType = this.form[column.idTypeProp]
      let required = (column.required || column.fieldRequired) | false
      let idRule = (rule, value, callback)=> {
        if(required){
          //必填
          if (ID_TYPE === idType) {
            isValidIdNo(rule, value, callback, label)
          } else if (PP_TYPE === idType) {
            isValidPPNo(rule, value, callback, label)
          } else if (OC_TYPE === idType) {
            isValidOCNo(rule, value, callback, label)
          } else if (HK_PC_TYPE === idType) {
            isValidHKPCNo(rule, value, callback, label)
          } else if (TW_PC_TYPE === idType) {
            isValidTWPCNo(rule, value, callback, label)
          } else {
            callback()
          }
        }else{
          //非必填
          if(isEmpty(value)){
            callback()
            return
          }
          if (ID_TYPE === idType) {
            isValidIdNo(rule, value, callback, label)
          } else if (PP_TYPE === idType) {
            isValidPPNo(rule, value, callback, label)
          } else if (OC_TYPE === idType) {
            isValidOCNo(rule, value, callback, label)
          } else if (HK_PC_TYPE === idType) {
            isValidHKPCNo(rule, value, callback, label)
          } else if (TW_PC_TYPE === idType) {
            isValidTWPCNo(rule, value, callback, label)
          } else {
            callback()
          }
        }
      }

      let maxLengthRule = (rule, value, callback)=> {
        if(maxLength && maxLength > 0 && value && value.length > maxLength){
          callback(new Error(label + '长度非法'))
        }else{
          callback()
        }
      }

      let message = label + '必须填写'
      let rules
      if(required){
        if (ID_TYPE === idType || PP_TYPE === idType || OC_TYPE === idType || HK_PC_TYPE === idType || TW_PC_TYPE === idType) {
          rules = [{required: true, message: message, trigger: 'blur' },
            {validator: idRule, trigger: 'blur' }]
        } else{
          rules = [{required: true, message: message, trigger: 'blur' }]
        }
      }else{
        if (ID_TYPE === idType || PP_TYPE === idType || OC_TYPE === idType || HK_PC_TYPE === idType || TW_PC_TYPE === idType) {
          rules = [{validator: idRule, trigger: 'blur' }]
        } else{
          let empty = (rule, value, callback)=> {callback()}
          rules =  [{validator: empty, trigger: 'blur' }]
        }
      }
      if(maxLength && maxLength > 0){
        rules.push({validator: maxLengthRule, trigger: 'blur' })
      }
      return rules
    }
  }

}
