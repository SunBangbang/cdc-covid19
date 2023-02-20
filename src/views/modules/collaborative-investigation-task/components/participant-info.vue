<template>
<el-row>
  <el-col>
    <el-descriptions title="" :column="8" size="medium" >
      <el-descriptions-item label="姓名"> {{params.name}}</el-descriptions-item>
      <el-descriptions-item label="性别"> {{params.gender | getDict}}</el-descriptions-item>
      <el-descriptions-item label="证件号">{{params.identity}}</el-descriptions-item>
    </el-descriptions>
  </el-col>
</el-row>
</template>

<script>
import {getDictLabel} from "@/utils";

export default {
  name: "participant-info",
  props: {
    params: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  filters: {
    getDict(dictValue) {
      return getDictLabel('gender', dictValue)
    }
  }
}
</script>

<style scoped>

</style>
