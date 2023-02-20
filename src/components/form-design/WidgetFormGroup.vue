<template>
  <el-collapse>
    <el-collapse-item  :name="column.label">
      <template slot="title">
        <span v-if="column.required" class="live-group">&nbsp;* &nbsp;</span>
        <span>{{column.label}}</span>
      </template>
  <div>
   <!-- <h4 class="widget-form-group__head" v-show="column.label">
      <i :class="column.icon" v-show="column.icon" style="margin-right: 10px;">
      </i>{{column.label}}
    </h4>-->
    <draggable class="widget-form-group__body"
               :list="column.children.column"
               :group="{ name: 'form' }"
               :disabled="column.edit !== undefined && !column.edit"
               ghost-class="ghost"
               :animation="200"
               @add="handleWidgetGroupAdd">
      <template v-for="(item, groupIndex) in column.children.column">
        <el-col :key="groupIndex"
                :md="item.span || 12"
                :xs="24"
                :offset="item.offset || 0">
          <el-form-item class="widget-form-group__item"
                        :prop="item.prop"
                        :class="{ active: selectWidget.prop === item.prop, 'required': item.required }"
                        @click.native.stop="handleWidgetTableSelect(groupIndex)">
            <template slot="label">
              <span :class="item.fieldRequired? 'live-required' : ''">{{item.label}}</span>
            </template>
            <widget-form-item :item="item"
                              :params="column.params"></widget-form-item>
            <el-button title="删除"
                       @click.stop="handleWidgetTableDelete(column,groupIndex)"
                       class="widget-form-group__item--delete"
                       v-if="selectWidget.prop === item.prop && item.edit"
                       circle
                       plain
                       type="danger">
              <i class="feisicon icon-delete"></i>
            </el-button>
            <el-button title="复制"
                       @click.stop="handleWidgetTableClone(column,item)"
                       class="widget-form-group__item--clone"
                       v-if="selectWidget.prop === item.prop && item.edit"
                       circle
                       plain
                       type="primary">
              <i class="feisicon icon-copy"></i>
            </el-button>
          </el-form-item>
        </el-col>
      </template>
    </draggable>
    <el-button title="删除"
               @click.stop="handleWidgetDelete(index)"
               class="widget-action-delete"
               v-if="selectWidget.prop === column.prop && column.edit"
               circle
               plain
               size='small'
               type="danger">
      <i class="feisicon icon-delete"></i>
    </el-button>
    <el-button title="清空"
               @click.stop="handleWidgetClear"
               class="widget-action-clear"
               v-if="selectWidget.prop === column.prop && column.edit"
               circle
               plain
               size='small'
               type="warning">
      <i class="feisicon icon-clear"></i>
    </el-button>
    <el-button title="复制"
               @click.stop="handleWidgetCloneTable(index)"
               class="widget-action-clone"
               v-if="selectWidget.prop === column.prop && column.edit"
               circle
               plain
               size='small'
               type="primary">
      <i class="feisicon icon-copy"></i>
    </el-button>
  </div>
    </el-collapse-item>
  </el-collapse>
</template>
<script>
import WidgetFormItem from './WidgetFormItem'
import WidgetFormTable from './WidgetFormTable'
import draggable from 'vuedraggable'
import {getAll, resetPropAndRel, specialRelTypes} from './utils/index'
import {isUndefined} from "@antv/util";

export default {
  name: 'widget-form-table',
  props: ['data', 'column', 'select', 'index'],
  components: { WidgetFormItem, WidgetFormTable, draggable },
  data () {
    return {
      selectWidget: this.select,
    }
  },
  created(){
    this.column.children.column.forEach(item=>{
      item.subfield = false
    })
  },
  methods: {
    handleSelectWidget (index) {
      this.selectWidget = this.data.column[index]
    },
    handleWidgetClear () {
      this.column.children.column = [];
      this.selectWidget = this.column;
    },
    handleWidgetDelete (index) {
      if (this.data.column.length - 1 === index) {
        if (index === 0) this.selectWidget = {}
        else this.handleSelectWidget(index - 1)
      } else this.handleSelectWidget(index + 1)

      this.$nextTick(() => {
        this.data.column.splice(index, 1)
        this.$emit('handleRefreshNewLabel', this.column.prop)
      })
    },
    handleWidgetCloneTable (index) {
      let cloneData = this.deepClone(this.column);
      cloneData.prop = Date.now() + '_' + Math.ceil(Math.random() * 99999)
      resetPropAndRel(cloneData.children.column);
      cloneData.display=true;
      this.data.column.splice(index+1, 0, cloneData)
      this.$nextTick(() => {
        this.handleSelectWidget(index + 1)
      })
      this.$nextTick(() => {
        this.handleSelectWidget(index);
        this.$emit('handleRefreshNewLabel')
        // this.handleRefreshGroupNewLabel();
      });
    },
    handleWidgetTableSelect (index) {
      this.selectWidget = this.column.children.column[index];
    },
    handleWidgetTableClone (column, item) {
      const data = this.deepClone(item);
      data.prop = Date.now() + '_' + Math.ceil(Math.random() * 99999)
      if(specialRelTypes.includes(data.type)){//关联组件删除关联配置
        data.dicData.forEach(dic =>{
          if(dic.joinSubjects){
            delete dic.joinSubjects;
          }
        })
      }
      data.display=true;
      this.$set(column.children.column, column.children.column.length, { ...data })
      this.$nextTick(() => {
        this.selectWidget = column.children.column[column.children.column.length - 1]
        this.handleRefreshGroupNewLabel();
      })
    },
    handleWidgetTableDelete (column, index) {
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
          });
          if(joinSubjects.length>0){
            getAll(this.data.column).forEach(v => {
              if (joinSubjects.includes(v.prop)) {//如果被选择关联 display = false
                v.display = true;
              }
            })
          }
        }
        if (column.children.column.length - 1 === index) {
          if (index === 0) this.selectWidget = column
          else this.selectWidget = column.children.column[index - 1]
        } else this.selectWidget = column.children.column[index + 1]
        this.$nextTick(() => {
          column.children.column.splice(index, 1)
          this.handleRefreshGroupNewLabel(this.selectWidget.prop);
        })
      })
    },
    handleWidgetGroupAdd (evt) {
      let newIndex = evt.newIndex;
      let columns = this.column.children.column;
      if (newIndex === 1 && newIndex > columns.length - 1) newIndex = 0

      const data = this.deepClone(columns[newIndex]);
      if (['bigtitle','description', 'title', 'group', 'dynamic'].includes(columns[newIndex].type)) {//分组中不能加分组
        columns.splice(newIndex, 1)
        return
      }
      if (!data.prop) data.prop = Date.now() + '_' + Math.ceil(Math.random() * 99999)
      delete data.icon;
      data.span = 12;
      this.$set(columns, newIndex, { ...data })
      this.selectWidget = columns[newIndex]

      this.$nextTick(() => {
        // this.handleSelectWidget(newIndex);
        this.handleRefreshGroupNewLabel();
      });
    },
    handleRefreshGroupNewLabel (delRelProp) {
      let ascIndex = 1
      let relation = []
      let parentIndx = this.column.index
      this.column.children.column.forEach(data => {
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
          const childIndex = this.column.children.column.findIndex(c => c.prop === item.child)
          const parentIndex = this.column.children.column.findIndex(c => c.prop === item.parent)
          if (childIndex === -1 || parentIndex === -1) {
            continue;
          }
          const child = this.column.children.column[childIndex];
          const parent = this.column.children.column[parentIndex];
          //调整child的序号
          let childLabelsArr = child.label.indexOf('、') > -1 ? child.label.split('、') :[]
          let parentLabelsArr = parent.label.indexOf('、') > -1 ? parent.label.split('、') :[]
          child.label = `${parentLabelsArr[0]}.${item.childSort}、${childLabelsArr.length > 1 ? childLabelsArr[1] : child.label}`
          child.index = `${parent.index}.${item.childSort}`
          //先删除
          this.column.children.column.splice(childIndex, 1)
          //再插入
          this.column.children.column.splice(parentIndex+item.childSort, 0, child)
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
    'column.children.column': {
      handler (val) {
        let arr = val.filter( v => {
          return v.required === true
        })
        if (arr.length > 0) {
          this.column.required = true
        } else {
          this.column.required = false
        }
      },
      deep: true
    }
  }
}
</script>
