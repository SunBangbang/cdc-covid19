<template>
  <div>
    <!--动态组件-->
    <component v-if='item.type !=="dynamic"' :is="getComponent(item.type, item.component)"
               v-model="form[item.prop]"
               v-bind="Object.assign(deepClone(item), params, { size:item.size || 'small' })"
               :placeholder="item.placeholder || getPlaceholder(item)"
               :dic="item.dicData">
      <span v-if="params.html"
            v-html="params.html">
      </span>
    </component>
  </div>
</template>
<script>
export default {
  name: 'widget-form-item',
  props: {
    item: {
      type: Object,
      default: () => {
        return {}
      }
    },
    params: {
      type: Object,
      default: () => {
        return {}
      }
    },
    relatedTable: {
      type: String,
      default: () => {
        return null
      }
    }
  },
  data () {
    return {
      form: {}
    }
  },
  methods: {
    //通过类型获取组件
    getComponent (type, component) {
      let KEY_COMPONENT_NAME = 'avue-';
      let result = 'input';
      if (component) return component
      else if (type === 'select') result = 'select';
      else if (type === 'radio') result = 'radio';
      else if (type === 'checkbox'){
        result = 'checkbox';
        this.form[this.item.prop] = [];
      }
      else if (['time', 'timerange'].includes(type)) result = 'time';
      else if (['dates', 'date', 'datetime', 'datetimerange', 'daterange', 'week', 'month', 'year'].includes(type))
        result = 'date';
      else if (type === 'cascader') result = 'cascader';
      else if (type === 'number') result = 'input-number';
      else if (type === 'password') result = 'input';
      else if (type === 'switch') result = 'switch';
      else if (type === 'dynamic') result = 'dynamic';
      return KEY_COMPONENT_NAME + result;
    },
    getPlaceholder (item) {//设置默认占位
      //如果没有label字段跳过
      if(!item.label) return;
      //去除label前序号
      let newLabelsArr = item.label.indexOf('、') > -1 ? item.label.split('、') :[]
      let  label = `${ newLabelsArr.length > 1 ? newLabelsArr[1] : item.label}`
      return `请输入 ${label}`
    }
  }
}
</script>
