import {findRelFromColumns,findRelHidFormDynamic, getAll} from "@/components/form-design/utils";
import {isUndefined} from "@antv/util";

export default {
    data() {
        return {
            joinOptions: [],
            joinDynamicOptions: [],
            selectedIndex: -1,
            loadDict: false
        }
    },
    methods: {
        setDefault() {
            this.loadDict = false
            let result = [];
            let dynamicResult = [];
            // console.log(this.data, this.columns)
            findRelHidFormDynamic(this.data, this.columns).forEach(p => {
                if (p.label) {
                  let label = p.label.length > 10 ? p.label.substr(0, 10) + '...' : p.label
                  let option = {
                    label: label,
                    value: p.prop,
                    title: p.label,
                  }
                  if (!isUndefined(p.parentProp) && p.parentProp !== '') return;
                  dynamicResult.push(option)
                }
            })
            findRelFromColumns(this.data, this.columns).forEach(c => {
                if (c.label) {
                    let label = c.label.length > 10 ? c.label.substr(0, 10) + '...' : c.label
                    let option = {
                        label: label,
                        value: c.prop,
                        title: c.label,
                        disabled: !c.display
                    }
                    if (this.data.type === 'dynamic') {
                      if (c.type !== 'dynamic') return;
                      if (c.children.type === 'form') return;
                      if ((!isUndefined(c.relatedTable) && c.relatedTable !== '')
                        || (!isUndefined(c.parentProp) && c.parentProp !== '')) {
                        option.disabled = true;
                      }
                        result.push(option);
                    } else {
                      result.push(option);
                    }
                }
            })
            this.joinOptions = result;
            this.joinDynamicOptions = dynamicResult
            this.loadDict = true
        },
        handleJoinFields(index) {
            if (this.selectedIndex === index) this.selectedIndex = -1
            else {
                this.selectedIndex = index
            }
        },
        handleJoinSubjects(values) {//关联下拉框选择时触发
            let p = new Promise((resolve, reject) => {
                resolve();
            })
            p.then(() => {
                findRelFromColumns(this.data, this.columns).forEach(v => {
                    if (values.includes(v.prop)) {//如果被选择关联 display = false
                        v.display = false
                    }
                })
            })
        },
        handleRemoveTag(values) {//关联下拉框取消选择时触发
            let p = new Promise((resolve, reject) => {
                resolve();
            })
            p.then(() => {
                getAll(this.columns).forEach(v => {
                    if (values.includes(v.prop)) {
                        v.display = true
                    }
                })
            })
        },
        handleFocus() {
            let p = new Promise((resolve, reject) => {
                resolve();
            })
            p.then(() => {
                let result = [];
                findRelFromColumns(this.data, this.columns).forEach(c => {
                    if (c.label) {
                        let label = c.label.length > 10 ? c.label.substr(0, 10) + '...' : c.label
                        let option = {
                            label: label,
                            value: c.prop,
                            title: c.label,
                            disabled: !c.display
                        }
                        result.push(option);
                    }
                })
                this.joinOptions = result;
            })
        },
        handleRemoveFields(index) {
          //先取消关联后删除
          if(this.data.dicData[index].joinSubjects && this.data.dicData[index].joinSubjects.length > 0){
            let joinSubjects = this.data.dicData[index].joinSubjects;
            this.handleRemoveTag(joinSubjects);
          }
          this.data.dicData.splice(index, 1);
        },
        handleAddFields() {
            const i = Date.now();
            this.data.dicData.push({label: '请输入列名', value: `${i}`})
        },
    }
}
