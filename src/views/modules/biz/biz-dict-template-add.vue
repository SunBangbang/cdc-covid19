<template>
  <el-dialog :visible.sync="visible" :title="!dataForm.id ? $t('add') : $t('update')" :close-on-click-modal="false" :close-on-press-escape="false">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmitHandle()" label-width="120px">
      <el-form-item prop="dictName" :label="$t('dict.dictName')">
        <el-input v-model="dataForm.dictName" :placeholder="$t('dict.dictName')"></el-input>
      </el-form-item>
      <el-form-item prop="dictType" :label="$t('dict.dictType')">
        <el-input v-model="dataForm.dictType" :placeholder="$t('dict.dictType')"></el-input>
      </el-form-item>
      <el-form-item prop="text" :label="$t('dict.dictData')">
        <el-input type="textarea" :rows="5" v-model="dataForm.text" :placeholder="$t('dict.dictDataTemplate')"></el-input>
      </el-form-item>

    </el-form>
    <template slot="footer">
      <el-button type="primary" @click="dataFormSubmitHandle()" :loading="load" size="mini">{{ $t('confirm') }}</el-button>
      <el-button @click="visible = false" size="mini">{{ $t('cancel') }}</el-button>
    </template>
  </el-dialog>
</template>

<script>
import debounce from 'lodash/debounce'
export default {
  data () {
    return {
      load: false,
      visible: false,
      dataForm: {
        id: '',
        dictName: '',
        dictType: '',
        text: ''
      }
    }
  },
  computed: {
    dataRule () {
      return {
        dictName: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        dictType: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        text: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    init () {
      this.visible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
      })
    },
    // 表单提交
    dataFormSubmitHandle: debounce(function () {
      this.load = true
      this.$refs['dataForm'].validate((valid) => {
        if (!valid) {
          this.load = false
          return false
        }
        this.dataForm.clear = true
        this.$http['post']('/biz/dict/data/parseAndInsert', this.dataForm).then(({ data: res }) => {
          this.load = false
          if (res.code !== 0) {
            return this.$message.error(res.msg)
          }
          this.$message({
            message: this.$t('prompt.success'),
            type: 'success',
            duration: 500,
            onClose: () => {
              this.visible = false
              this.$emit('refreshDataList')
            }
          })
        }).catch(() => {})
      })
    }, 1000, { 'leading': true, 'trailing': false })
  }
}
</script>
