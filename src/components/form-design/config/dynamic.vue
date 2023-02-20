<template>
  <div>
    <el-form-item label="表单格式">
      <el-select
        v-model="data.children.type"
        :disabled="
          (data.edit !== undefined && !data.edit) ||
            (data.parentProp !== '' && data.parentProp !== undefined)
        "
        @change="setDefault"
        placeholder="表单格式"
      >
        <el-option label="表格" value=""></el-option>
        <el-option label="表单" value="form"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item
      label="关联表格"
      v-if="
        data.children.type === '' &&
          (data.parentProp === undefined || data.parentProp === '')
      "
    >
      <el-select
        v-model="data.relatedTable"
        clearable
        @visible-change="getDefault($event)"
        @change="setRelatedColumn"
        placeholder="选择关联表格"
      >
        <el-option
          v-for="(item, index) in joinOptions"
          :key="index + 'options' + item.value"
          :label="item.label"
          :title="item.title"
          :value="item.value"
          :disabled="item.disabled"
        >
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="是否是核心表">
      <el-switch
        v-model="data.coreItem"
        :disabled="data.edit !== undefined && !data.edit"
      ></el-switch>
    </el-form-item>
    <!--    <el-form-item label="是否轨迹">-->
    <!--      <el-switch v-model="data.track"></el-switch>-->
    <!--    </el-form-item>-->
  </div>
</template>

<script>
import dictModule from "../mixins/dict-module-mixin";
export default {
  name: "config-dynamic",
  props: ["data", "columns"],
  mixins: [dictModule],
  created() {
    this.setDefault();
  },
  methods: {
    getDefault(callback) {
      if (callback) {
        this.setDefault();
      }
    },
    setRelatedColumn(value) {
      for (let item of this.columns) {
        if (item.parentProp === this.data.prop) {
          item.parentProp = "";
          item.children.column = item.children.column.filter(v => {
            return v.isRelatedTableColumn === undefined;
          });
          break;
        }
      }
      if (value !== "") {
        const column = JSON.parse(JSON.stringify(this.data.children.column));
        column.forEach(item => {
          item.prop = item.prop + "_1";
          item.isRelatedTableColumn = true;
        });
        for (let item of this.columns) {
          if (item.prop === value) {
            item.parentProp = this.data.prop;
            item.children.column.push(...column);
            break;
          }
        }
      }
    }
  }
};
</script>
