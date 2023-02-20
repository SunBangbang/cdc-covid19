import moment from "moment"
import {Covid19Rules} from "./rules"
import createComponent from "./createComponent"
import {isEmpty} from "@antv/util"

export class FormHandler {

  constructor(columns, form, add) {
    //表单json列结构
    this.columns = columns
    //表单数据
    this.form = form
    //true->新增, false->编辑
    this.add = add
    this.bizFieldPropMap = new Map()
    this.columnMap = new Map()
    //验证结果，错误消息列表
    this.errs = []

    if(this.columns && this.columns.length > 0){
      this.columns.forEach((col, index)=>{
        if (col.type === 'dynamic') {
          if (col.children && col.children.column && col.children.column.length > 0) {
            for(let cln of col.children.column){
              if(cln.tag){
                this.bizFieldPropMap.set(cln.tag, {prop: col.prop +'.' + cln.prop, type: col.type, })
                this.columnMap.set(cln.tag, {label: col.label + '/' + cln.label, type: cln.type, valueFormat: cln.valueFormat, parentProp: col.prop})
              }
            }
            if(col.tag){
              this.bizFieldPropMap.set(col.tag, {prop: col.prop, type: 'dn'})
              // this.columnMap.set(col.tag, {label: col.label, type: col.type, valueFormat: col.valueFormat})
            }
          }
          if(this.add){
            this.form[col.prop] = []
          }
        }else if(col.type === 'group') {
          let group = {}
          if (col.column && col.column.length > 0) {
            for(let cln of col.column){
              if(cln.tag){
                this.bizFieldPropMap.set(cln.tag, {prop: col.prop +'.' + cln.prop, type: col.type, })
                this.columnMap.set(cln.tag, {label: col.label + '/' + cln.label, type: cln.type, valueFormat: cln.valueFormat})
              }
              if(this.add){
                createComponent(cln, group)
              }
            }
            if(this.add){
              this.form[col.prop] = group
            }
          }
        }else {
          if(col.tag){
            this.bizFieldPropMap.set(col.tag, {prop: col.prop, type: 'n'})
            this.columnMap.set(col.tag, {label: col.label, type: col.type, valueFormat: col.valueFormat, dicData: col.dicData})
          }
          if(this.add){
            createComponent(col, this.form)
          }
        }
      })
      this.addLogicRules(Covid19Rules)
    }
  }

  setFormData(form) {
    this.form = form
  }

  addLogicRules(rules){
    this.rules = rules
  }

  getFormData(){
    return this.form
  }

  getColumns() {
    return this.columns
  }

  /**
   * 执行逻辑验证
   */
  doLogicValidate(){
    this.errs = []
    if(this.form && !isEmpty(this.rules.normal)){
      // for(let [key, val] of this.bizFieldPropMap){
      //   console.log('key:', key, ' val:', val)
      // }
      console.log('formData:', this.form)
      this.rules.normal.forEach(rule=>{
        const exist1 = this.bizFieldPropMap.get(rule.field1)
        if(!exist1){
          console.log('no field:', rule.desc, rule.label1, rule.field1)
        }
        const exist2 = this.bizFieldPropMap.get(rule.field2)
        if(!exist2){
          console.log('no field:', rule.desc, rule.label2, rule.field2)
        }
        //都配置了业务字段才比较
        if(exist1 && exist2) {
          if (rule.type === 'date' || rule.type === 'daterange-1') {
            this.validateDate(rule)
          }
        }
      })

      this.validateVaccTime()

      if(this.errs.length > 0){
        console.log('logic validate result:')
        this.errs.forEach(item=> console.log(item))
      }
    }
    return this.errs
  }

  /**
   * 疫苗接种情况验证
   */
  validateVaccTime(){
    // {numField: 'vacAgentTimes', dyField: 'vacTimes' , timeField: 'vacThirdInoculationDate'}
    let vaccRule = this.rules.special.vacc
    if(!isEmpty(vaccRule)){
      /*const exist1 = this.bizFieldPropMap.get(vaccRule.numField)
      if(!exist1){
        console.error('no field:', vaccRule.desc, vaccRule.numField)
      }*/
      const exist2 = this.bizFieldPropMap.get(vaccRule.dyField)
      if(!exist2){
        console.log('no field:', vaccRule.desc, vaccRule.dyLabel, vaccRule.dyField)
      }
      const exist3 = this.bizFieldPropMap.get(vaccRule.timeField)
      if(!exist3){
        console.log('no field:', vaccRule.desc, vaccRule.timeLabel, vaccRule.timeField)
      }
      //都配置了业务字段才比较
      if(exist2 && exist3) {
        // let vaccNum = this.getLabelVal(vaccRule.numField)
        let vaccData = this.getVal(vaccRule.dyField)
        let times = this.getVal(vaccRule.timeField)
        console.log('疫苗接种子表单:', vaccData, '疫苗接种时间:', times)
        if(!isEmpty(vaccData) && !isEmpty(times)){
          let arr1 = times.map(itm => new Date(itm).getTime())
          let arr2 = Array.from(new Set([...arr1].sort()))
          console.log('比较疫苗接种时间:', arr1.join(','), arr2.join(','))
          if(arr1.length !== arr2.length){
            this.errs.push('有重复疫苗接种时间')
          }else{
            if (!(arr1.join(',') === arr2.join(','))) {
              this.errs.push('疫苗接种剂次时间顺序不对')
            }
          }
        }
      }
    }
  }
  ignoreSecond(d){
    if(d instanceof Array){
      let r = []
      d.forEach(item=>{
        if(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}):(\d{2})$/g.test(item)){
          r.push(item.substring(0, item.lastIndexOf(':')))
        }
      })
      return r
    }else{
      if(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}):(\d{2})$/g.test(d)){
        d = d.substring(0, d.lastIndexOf(':'))
      }
    }
    return d
  }
  validateDate(rule){
    let o1 = this.getVal(rule.field1)
    let o2 = this.getVal(rule.field2)
    console.log('比较时间:', rule.label1 + '(' + rule.field1+'):', o1, ' ', rule.label2 + '(' + rule.field2+'):', o2)
    if(o1 && o2){
      let col1 = this.columnMap.get(rule.field1)
      let col2 = this.columnMap.get(rule.field2)
      const dateTypes = ['date', 'datetime', 'time', 'daterange']
      if(!dateTypes.includes(col1.type) || !dateTypes.includes(col2.type)){
        return '请检查字段是否是时间日期类型'
      }

      if(o1 instanceof Array){
        if(o2 instanceof Array){
          //都是数组，如何比较？
          console.log('compare array:', o1, ' ', o2)
          // console.log('column:', col1, ' ', col2)
          if(col1.parentProp !== col2.parentProp){
            let max = this.getMaxDate(o1)
            let min = this.getMinDate(o2)
            this.compareDate(rule, max, min)
          }
        }else{
          //o1为日期范围 只取开始时间做比较
          if(rule.type === 'daterange-1') {
            this.compareDate(rule, o1[0], o2)
          } else {
            o1.forEach(item=>{
              this.compareDate(rule, item, o2)
            })
          }
        }
      }else{
        if(o2 instanceof Array){
          o2.forEach(item=>{
            this.compareDate(rule, o1, item)
          })
        }else{
          this.compareDate(rule, o1, o2)
        }
      }
    }
  }

  /**
   * 根据业务属性获取对应prop
   * @param bizField
   * @returns {null}
   */
  getProp(bizField) {
    let o = this.bizFieldPropMap.get(bizField)
    return o? o.prop : null
  }

  /**
   * 通过业务查询表单值
   * @param bizField
   * @returns {null|*}
   */
  getVal(bizField){
    let o = this.bizFieldPropMap.get(bizField)
    console.log('getVal:', bizField + ',', o)
    if(o){
      if(o.type === 'n' || o.type === 'dn'){
        return this.form[o.prop]
      }else if(o.type === 'group'){
        const arr = o.prop.split('.')
        return this.form[arr[0]][arr[1]]
      }else if(o.type === 'dynamic'){
        const arr = o.prop.split('.')
        return this.form[arr[0]].map(item=> item[arr[1]])
      }
    }
    return null
  }

  /**
   * 通过业务属性查询标签值
   * @param bizField
   * @returns {null|*}
   */
  getLabelVal(bizField){
    let o = this.bizFieldPropMap.get(bizField)
    console.log('getLabelVal:', bizField + ',', o)
    let r = null
    if(o){
      if(o.type === 'n'){
        let val = this.getVal(bizField)
        let dicData = this.columnMap.get(bizField).dicData
        dicData.some(itm=>{
          if(itm.value === val){
            r = itm.label
            return true
          }
        })
        return r
      }else {
        return this.getVal(bizField)
      }
    }
    return null
  }

  getValue(o){
    if(o){
      if(o.ptype === 'n'){
        return this.form[o.prop]
      }else if(o.ptype === 'group'){
        const arr = o.prop.split('.')
        return this.form[arr[0]][arr[1]]
      }else if(o.ptype === 'form' || o.type==='table'){
        // console.log('getValue:', o)
        // const arr = o.prop.split('.')
        // return this.form[arr[0]].map(item=> item[arr[1]])
      }
    }
    return null
  }

  /**
   * 更改组件值
   * @param o 基本组件
   * @param v 值
   */
  setValue(o, v, did){
    console.log('setValue:', o, v, did)
    if(o){
      if(o.ptype === 'n'){
        this.form[o.prop] = v
      }else if(o.ptype === 'group'){
        const arr = o.prop.split('.')
        this.form[arr[0]][arr[1]] = v
      }else if(o.ptype === 'form' || o.ptype ==='table'){
        const arr = o.prop.split('.')
        let dforms = this.form[arr[0]]
        if(dforms && dforms.length > 0){
          if(did){
            let find = false
            dforms.some((item, idx)=>{
              if(item.did === did){
                item[arr[1]] = v
                find = true
                return true
              }
            })
            if(!find){
              let obj = {did: did}
              obj[arr[1]] = v
              dforms.push(obj)
            }
          }else{
            dforms.forEach(item=>{
              item[arr[1]] = v
            })
          }
        }else {
          dforms = []
          if(did){
            let obj = {did: did}
            obj[arr[1]] = v
            dforms.push(obj)
            this.form[arr[0]] = dforms
          }
        }
      }
    }
  }

  /**
   * 子表单关联删除
   * @param dprop 子表单属性名称
   * @param did 子表单行ID
   */
  delRow(dprop, did){
    let dforms = this.form[dprop]
    if(dforms && dforms.length > 0){
      dforms.some((item, idx)=>{
        if(item.did === did){
          dforms.splice(idx, 1)
          return true
        }
      })
    }
  }

  getMaxDate(dates){
    let arr = dates.map(d=>moment(d).toDate().getTime())
    return Math.max(...arr)
  }

  getMinDate(dates, col){
    let arr = dates.map(d=>moment(d).toDate().getTime())
    return Math.min(...arr)
  }

  compareDate(rule, o1, o2){
    console.log('compare:', o1, ' ', o2)
    if(isEmpty(o1) || isEmpty(o2)){
      return
    }
    let col1 = this.columnMap.get(rule.field1)
    let col2 = this.columnMap.get(rule.field2)

    let label1 = this.ignoreSecond(o1)
    let label2 = this.ignoreSecond(o2)
    let startLabel = ''
    if(col1.type === 'daterange' && rule.type === 'daterange-1') {
      startLabel = '的开始时间'
    }
    let message = col1.label + startLabel + label1 + rule.message + col2.label + label2
    //time比较时加上年月日
    let mockDate1 = ''
    let mockDate2 = ''
    if(col1.type === 'time'){
      mockDate1 = '2021-12-01 '
    }
    if(col2.type == 'time'){
      mockDate2 = '2021-12-01 '
    }
    //当有其中一个类型为日期时只比较日期
    if(col1.type === 'date' || col2.type === 'date') {
      o1 = moment(o1).format("YYYY-MM-DD")
      o2 = moment(o2).format("YYYY-MM-DD")
    }
    let d1 = moment(mockDate1 + o1)
    let d2 = moment(mockDate2 + o2)

    let diff = d1.diff(d2, 'seconds')
    if(rule.expect === '<'){
      if(!(diff<0)){
        this.errs.push(message)
      }
    }else if(rule.expect === '<='){
      if(!(diff<=0)){
        this.errs.push(message)
      }
    }else if(rule.expect === '>'){
      if(!(diff>0)){
        this.errs.push(message)
      }
    }else if(rule.expect === '>='){
      if(!(diff>=0)){
        this.errs.push(message)
      }
    }else if(rule.expect === '='){
      if(!(diff===0)){
        this.errs.push(message)
      }
    }else if(rule.expect === '!='){
      if(!(diff!==0)){
        this.errs.push(message)
      }
    }
  }

  /**
   * 发病后是否就诊
   */
  yesForClinicAfterOnset(){
    let val = this.getLabelVal('clinicAfterOnset')
    return '是'===val
  }

  getPropForClinicAfterOnset() {
    return this.getProp('clinicAfterOnset')
  }
}

