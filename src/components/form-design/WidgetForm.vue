<template>
  <div class="widget-form-container">
    <el-form style="position: relative" :label-position="data.labelPosition || 'left'"
             :label-width="data.labelWidth ? `${data.labelWidth}px` : '100px' "
             :label-suffix="data.labelSuffix"
             :model="form"
             ref="widgetForm"
             size="small">
      <el-row :gutter="data.gutter">
        <draggable class="widget-form-list"
                   id="tt"
                   :list="data.column"
                   :disabled="!draggabled"
                   :group="{ name: 'form' }"
                   ghost-class="ghost"
                   :animation="300"
                   filter=".undraggable"
                   @add="handleWidgetAdd"
                   @end="handleWidgetMoveEnd">
          <template v-for="(column, index) in data.column">
            <div class="widget-form-table"
                 v-if="column.type === 'dynamic'"
                 :key="index"
                 :class="{ active: selectWidget.prop === column.prop, undraggable: column.edit !== undefined && !column.edit }"
                 @click="handleSelectWidget(index)">

              <widget-form-table :data="data"
                                 :column="column"
                                 :index="index"
                                 @handleRefreshNewLabel="handleRefreshNewLabel"
                                 :select.sync="selectWidget"></widget-form-table>
            </div>
            <div class="widget-form-group"
                 v-else-if="column.type === 'group'"
                 :key="index"
                 :class="{ active: selectWidget.prop === column.prop, undraggable: column.edit !== undefined && !column.edit}"
                 @click="handleSelectWidget(index)">
              <widget-form-group :data="data"
                                 :column="column"
                                 :index="index"
                                 @handleRefreshNewLabel="handleRefreshNewLabel"
                                 :select.sync="selectWidget">
              </widget-form-group>
            </div>
            <el-col v-else-if="column.type !== 'model'"
                    :key="index"
                    :md="column.span || 12"
                    :class="column.edit || column.edit === undefined? '' : 'undraggable'"
                    :xs="24"
                    :offset="column.offset || 0">
              <el-form-item class="widget-form-item"
                            :labelWidth="column.labelWidth"
                            :prop="column.prop"
                            :class="{ active: selectWidget.prop === column.prop, 'required': column.required }"
                            @click.native="handleSelectWidget(index)">
                <template slot="label">
                  <span :class="column.fieldRequired? 'live-required' : ''">{{column.label}}</span>
                </template>
                <!--'undraggable':['bigtitle', 'description'].includes(column.type) class 设置'undraggable'可以控制是否能拖拽-->
                <widget-form-item :item="column"
                                  :params="column.params"
                                  :class="specialTypes.includes(column.type)? '':'fixedhight'">
                </widget-form-item>
                <el-button title="删除"
                           @click.stop="handleWidgetDelete(index, column.prop)"
                           class="widget-action-delete"
                           v-if="selectWidget.prop === column.prop && (column.edit === undefined? true: column.edit)"
                           circle
                           plain
                           size="small"
                           type="danger">
                  <i class="feisicon icon-delete"></i>
                </el-button>
                <el-button title="复制"
                           @click.stop="handleWidgetClone(index)"
                           class="widget-action-clone"
                           v-if="selectWidget.prop === column.prop && (column.edit === undefined? true: column.edit)"
                           circle
                           plain
                           size="small"
                           type="primary">
                  <i class="feisicon icon-copy"></i>
                </el-button>
              </el-form-item>
            </el-col>
          </template>
        </draggable>
      </el-row>
    </el-form>
    <slider div-id="tt"></slider>
  </div>
</template>

<script>
import WidgetFormItem from './WidgetFormItem'
import WidgetFormTable from './WidgetFormTable'
import WidgetFormGroup from './WidgetFormGroup'
import Draggable from 'vuedraggable'
import {getAll, numberToChinese, resetPropAndRel, specialRelTypes, specialSpanTypes} from './utils'
import Slider from "@/components/slider/up-bottom-slider";
import {isUndefined} from "@antv/util";


export default {
  name: 'widget-form',
  components: {Slider, Draggable, WidgetFormItem, WidgetFormTable, WidgetFormGroup },
  props: ['data', 'select', 'canOperate'],//data:表单设计器配置项   select是双重绑定，表示当前选中的组件配置
  data () {
    return {
      draggabled: true,
      selectWidget: this.select,//表示选中的组件
      form: {},
      specialTypes:specialSpanTypes,//不固定高度的组件
      loadingInstance:null
    }
  },
  methods: {
    handleSelectWidget (index) {//更新selectWidget
      this.selectWidget = this.data.column[index]
    },
    handleWidgetAdd (evt) {//draggable新增时调用的方法
      let p = new Promise((resolve, reject) => {
        resolve();
      })
      p.then(() =>{
        let newIndex = evt.newIndex;//获取新增内容的序列
        const data = this.deepClone(this.data.column[newIndex]);//克隆新增内容
        // console.log(data)
        if(data.type === 'model'){//如果是公共模板类型
          let index=newIndex;
          this.data.column.splice(index,1);//删除该新加入的数据
          resetPropAndRel(data.column);//删除关联并重新设置prop
          data.column.forEach(c =>{//拆分column
            this.data.column.splice(index++,0,c);
          });
          this.$emit('update:data', this.data);
        }else{//正常类型
          if (!data.prop) data.prop = Date.now() + '_' + Math.ceil(Math.random() * 99999)//设置prop
          delete data.icon
          delete data.subfield
          this.$set(this.data.column, newIndex, { ...data })//重新设置
        }
        this.$nextTick(() => {
          this.handleSelectWidget(newIndex);
          this.handleRefreshNewLabel();
        });
      })
    },
    handleWidgetDelete (index, prop) {//删除组件
      let p = new Promise((resolve, reject) => {
        resolve();
      })
      //可关联类型删除时需要将被关联的对象display设置为true
      p.then(()=>{
        if(specialRelTypes.includes(this.selectWidget.type)){
          let joinSubjects=[];
          this.selectWidget.dicData.forEach(dic =>{
            if(dic.joinSubjects){
              joinSubjects=joinSubjects.concat(dic.joinSubjects);
            }
            // this.$set(this.joinSubjects)
          });
          if(joinSubjects.length>0){
            getAll(this.data.column).forEach(v => {
              if (joinSubjects.includes(v.prop)) {//如果被选择关联 display = false
                v.display = true;
              }
            })
          }
        }
        if (this.data.column.length - 1 === index) {//如果时最后一个 选择上一个组件为selectWidget
          if (index === 0) this.selectWidget = {}
          else this.handleSelectWidget(index - 1)
        } else this.handleSelectWidget(index + 1)//选择下一个组件为selectWidget

        this.$nextTick(() => {
          this.data.column.splice(index, 1)
          this.handleRefreshNewLabel(prop)
        })
      })
    },
    handleWidgetClone (index) {//克隆组件
      let cloneData = this.deepClone(this.data.column[index])
      cloneData.prop = Date.now() + '_' + Math.ceil(Math.random() * 99999);
      if(specialRelTypes.includes(cloneData.type)){//关联组件删除关联配置
        cloneData.dicData.forEach(dic =>{
          if(dic.joinSubjects){
            delete dic.joinSubjects;
          }
        })
      }
      cloneData.display=true;
      this.data.column.splice(index+1, 0, cloneData);
      this.$nextTick(() => {
        this.handleSelectWidget(index + 1)
        this.handleRefreshNewLabel()
      })
    },
    handleWidgetMoveEnd() {
      //分组，子表单不能相互嵌套
      this.data.column.forEach(item=>{
        if(item.type === 'group' || item.type === 'dynamic'){
          if(item.children.column){
            item.children.column = item.children.column.filter(itm=> itm.type !== 'group' && itm.type !== 'dynamic')
          }
        }
      })
      this.handleRefreshNewLabel()
    },
    handleRefreshNewLabel(delRelProp) {//更新标签顺序
      let ascIndex = 1
      let groupIndex = 1
      let relation = []
      this.data.column.forEach(data => {
        //排除主标题，描述信息
        if(!['bigtitle', 'description'].includes(data.type)){
          if(data.type === 'title') {//标题递增 一、 二、 三、 ...
            // let newLabelsArr = data.params.html.indexOf('、') > -1 ? data.params.html.split('、') :[]
            let newLabel = data.params.html.indexOf('、') > -1 ?  data.params.html.substring(data.params.html.indexOf('、') + 1, data.params.html.length) : data.params.html
            let suffix = numberToChinese(groupIndex)//数字转汉字
            data.params.html = `${suffix}、${ newLabel }`
            groupIndex ++
          } else {//其他组件label递增 1、 2、 3、 ...
            //如果关联信息存在，删除
            if (!isUndefined(delRelProp) && delRelProp !== '') {
              if (data.relatedDynamic === delRelProp) {
                data.relatedDynamic = ''
              }
              if (data.relatedTable === delRelProp) {
                data.relatedTable = ''
              }
              if (data.parentDynamicProp === delRelProp) {
                data.parentDynamicProp = ''
              }
              if (data.parentProp === delRelProp) {
                data.parentProp = ''
              }
            }
            // let newLabelsArr = data.label.indexOf('、') > -1 ? data.label.split('、') :[]
            let newLabel = data.label.indexOf('、') > -1 ? data.label.substring(data.label.indexOf('、') + 1, data.label.length) : data.label
            if (data.dicData && data.dicData.length> 0) {
              data.dicData.forEach(item => {
                if (item.joinSubjects && item.joinSubjects.length > 0) {
                  if (!isUndefined(delRelProp) && delRelProp !== '') {
                    const removeIndex = item.joinSubjects.findIndex(v => v === delRelProp)
                    if (removeIndex > -1) {
                      item.joinSubjects.splice(removeIndex, 1)
                    }
                  }
                  item.joinSubjects.forEach((item1,index1) => {
                    relation.push({
                      child: item1,
                      childSort: index1+1,
                      parent: data.prop,
                      parentName: data.label
                    })
                  })
                }
              })
            }
            if (data.display) {
              data.label = `${ascIndex}、${newLabel}`
              data.index = ascIndex
              ascIndex ++
            } else {
              data.label = `${newLabel}`
            }

            if (data.rules && data.rules.length > 0) {
              for (let item of data.rules) {
                if (item.required) {
                  item.message = data.label + '必须填写'
                } else if (item.pattern) {
                  item.message = data.label + '格式不匹配'
                }
              }
            }

            if (data.type === 'group') {
              this.handleRefreshGroupNewLabel(data, delRelProp)
            }
          }
        }
      })
      if (relation && relation.length > 0) {
        for( const item of relation) {
          const childIndex = this.data.column.findIndex(c => c.prop === item.child)
          const parentIndex = this.data.column.findIndex(c => c.prop === item.parent)
          if (childIndex === -1 || parentIndex === -1) {
            continue;
          }
          const child = this.data.column[childIndex];
          const parent = this.data.column[parentIndex];
          //调整child的序号
          let childLabelsArr = child.label.indexOf('、') > -1 ? child.label.split('、') :[]
          child.label = `${parent.index}.${item.childSort}、${ child.label }`
          child.index = `${parent.index}.${item.childSort}`
          //调整child的rules提示
          if (child.rules && child.rules.length > 0) {
            for (let item of child.rules) {
              if (item.required) {
                item.message = child.label + '必须填写'
              } else if (item.pattern) {
                item.message = child.label + '格式不匹配'
              }
            }
          }
          //先删除
          this.data.column.splice(childIndex, 1)
          //再插入
          this.data.column.splice(parentIndex+item.childSort, 0, child)
        }
      }
    },
    handleRefreshGroupNewLabel (groupColumn, delRelProp) {
      let ascIndex = 1
      let relation = []
      let parentIndx = groupColumn.index
      groupColumn.children.column.forEach(data => {
        //如果关联信息存在，删除
        if (!isUndefined(delRelProp) && delRelProp !== '') {
          if (data.relatedDynamic === delRelProp) {
            data.relatedDynamic = ''
          }
          if (data.relatedTable === delRelProp) {
            data.relatedTable = ''
          }
          if (data.parentDynamicProp === delRelProp) {
            data.parentDynamicProp = ''
          }
          if (data.parentProp === delRelProp) {
            data.parentProp = ''
          }
        }
        //label递增 1、 2、 3、 ...
        let newLabel = data.label.indexOf('、') > -1 ? data.label.substring(data.label.indexOf('、') + 1, data.label.length) : data.label
        if (data.dicData && data.dicData.length > 0) {
          data.dicData.forEach(item => {
            if (item.joinSubjects && item.joinSubjects.length > 0) {
              if (!isUndefined(delRelProp) && delRelProp !== '') {
                const removeIndex = item.joinSubjects.findIndex(v => v === delRelProp)
                if (removeIndex > -1) {
                  item.joinSubjects.splice(removeIndex, 1)
                }
              }
              item.joinSubjects.forEach((subjItem, idx) => {
                relation.push({
                  child: subjItem,
                  childSort: idx + 1,
                  parent: data.prop,
                  parentName: data.label
                })
              })
            }
          })
        }
        if (data.display) {
          let label = `${parentIndx}.${ascIndex}、${newLabel}`
          data.label = label
          data.index = ascIndex
          ascIndex++
        } else {
          let label = `${newLabel}`
          data.label = label
        }

        if (data.rules && data.rules.length > 0) {
          for (let item of data.rules) {
            if (item.required) {
              item.message = data.label + '必须填写'
            } else if (item.pattern) {
              item.message = data.label + '格式不匹配'
            }
          }
        }
      })


      // 处理关联表单项的（因为可能是隐藏状态，因此编号为被关联项的下一级编号。如被关联项编号是11.1 关联项的编号就是11.1.1、 11.1.2
      if (relation && relation.length > 0) {
        for( const item of relation) {
          const childIndex = groupColumn.children.column.findIndex(c => c.prop === item.child)
          const parentIndex = groupColumn.children.column.findIndex(c => c.prop === item.parent)
          if (childIndex === -1 || parentIndex === -1) {
            continue;
          }
          const child = groupColumn.children.column[childIndex];
          const parent = groupColumn.children.column[parentIndex];
          //调整child的序号
          let childLabelsArr = child.label.indexOf('、') > -1 ? child.label.split('、') :[]
          let parentLabelsArr = parent.label.indexOf('、') > -1 ? parent.label.split('、') :[]
          child.label = `${parentLabelsArr[0]}.${item.childSort}、${childLabelsArr.length > 1 ? childLabelsArr[1] : child.label}`
          child.index = `${parent.index}.${item.childSort}`
          //先删除
          groupColumn.children.column.splice(childIndex, 1)
          //再插入
          groupColumn.children.column.splice(parentIndex+item.childSort, 0, child)
        }
      }
    }
  },
  watch: {
    select (val) {
      this.selectWidget = val
    },
    selectWidget: {
      handler (val) {
        this.$emit('update:select', val)
      },
      deep: true
    },
    // 'data.column'(newVal, oldVal) {
      // console.log('newVal:',newVal.length)
      // console.log('oldVal:',oldVal.length)
        // this.$nextTick( () => {
        //   this.handleRefreshNewLabel()
        // })
    // }
  }
}
</script>

<style type="text/css">
  .fixedhight{
    height:50px;
  }
</style>
