<template>
  <el-row>
    <el-col :span="10">
      <el-input placeholder="请选择地址">
        <template slot="append">
          <el-button icon="el-icon-search" ></el-button>
        </template>
      </el-input>
    </el-col>
    <el-col :span="10" :offset="1">
      <el-input  placeholder="详细地址" ></el-input>
    </el-col>
  </el-row>
</template>

<script>
export default {
name: "RegionSelectItem"
}
</script>

<style scoped>

</style>
