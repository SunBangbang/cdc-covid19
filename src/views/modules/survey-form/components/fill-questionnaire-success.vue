<template>
  <el-dialog :visible.sync="dialogVisible"
             width="30%"
             style="text-align: center"
             append-to-body
             :close-on-click-modal = "false">
    <i class="el-icon-success fill-success-icon"></i>
    <el-row> 问卷已提交，感谢您的配合 </el-row>
    <el-button @click="handleClose" size="mini" style="margin-top: 50px">关闭页面</el-button>
  </el-dialog>
</template>
<script>
  export default {
    data() {
      return {
        dialogVisible: false,
      }
    },
    methods: {
      handleClose() {
        this.dialogVisible = false
        this.$emit('callback')
      }
    }
  }
</script>
<style>
  .fill-success-icon {
    font-size: 100px;
    color: #0faf62;
    margin-top: 0
  }
</style>
