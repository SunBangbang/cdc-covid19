<template>
  <div>
    <el-form-item label="只读表格">
      <el-select
        v-model="data.table"
        placeholder="请选择类型"
        clearable
        :disabled="data.edit !== undefined && !data.edit"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
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
  </div>
</template>

<script>
export default {
  name: "config-table",
  props: ["data", "columns"],
  data() {
    return {
      options: [
        {
          value: "epidSpotTab",
          label: "疫点表"
        }
        /*,{
        value: 'closeContactTab',
        label: '密接表'
      }*/
      ],
      value: ""
    };
  }
};
</script>
