<template>
  <el-dialog title="编辑段落" :close-on-click-modal="false" :visible.sync="dialogVisible" width="60%">
    <el-form ref="form" :model="dataForm">
      <el-form-item >
        <el-input v-model="dataForm.title" placeholder="请输入段落标题" maxlength="200" show-word-limit></el-input>
      </el-form-item>
      <el-form-item>
        <!-- <avue-ueditor v-model="dataForm.content" :options="editorOptions"></avue-ueditor> -->
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
    <el-button size="mini" @click="dialogVisible = false">取 消</el-button>
    <el-button size="mini" type="primary" @click="handleClose">确 定</el-button>
  </span>
  </el-dialog>
</template>
<script>
  import {editorOptions} from "../option/editorOptions"

  export default {
    data() {
      return {
        editorOptions,
        dialogVisible: false,
        index: '',
        dataForm: {
          title: '',
          content: ''
        },
      };
    },
    methods: {
      init(title, content, index) {
        this.dialogVisible = true
        this.dataForm.title = title
        this.dataForm.content = content
        this.index = index
      },
      handleClose() {
        this.$emit('callback', this.dataForm.title, this.dataForm.content, this.index)
        this.dialogVisible = false
      }
    }
  };
</script>
