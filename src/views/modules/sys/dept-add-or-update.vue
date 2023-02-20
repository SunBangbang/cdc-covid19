<template>
  <el-dialog :visible.sync="visible" :title="!dataForm.id ? $t('add') : $t('update')" @close="beforeClose()" :close-on-click-modal="false" :close-on-press-escape="false">
    <el-form
      :model="dataForm"
      :rules="dataRule"
      ref="dataForm"
      @keyup.enter.native="dataFormSubmitHandle()"
      label-width="120px"
      size="mini">
      <el-form-item prop="name" :label="$t('dept.name')">
        <el-input v-model="dataForm.name" :placeholder="$t('dept.name')"></el-input>
      </el-form-item>
      <el-form-item prop="parentName" :label="$t('dept.parentName')" class="dept-list">
        <el-popover v-model="deptListVisible" ref="deptListPopover" placement="bottom-start" trigger="click">
          <el-tree
              :data="deptList"
              :props="{ label: 'name', children: 'children' }"
              node-key="id"
              ref="deptListTree"
              :highlight-current="true"
              :expand-on-click-node="false"
              accordion
              @current-change="deptListTreeCurrentChangeHandle">
          </el-tree>
        </el-popover>
        <el-input v-model="dataForm.parentName" v-popover:deptListPopover :readonly="true" :placeholder="$t('dept.parentName')">
          <i
              v-if="$store.state.user.superAdmin === 1 && dataForm.pid !== '0'"
              slot="suffix"
              @click.stop="deptListTreeSetDefaultHandle()"
              class="el-icon-circle-close el-input__icon">
          </i>
        </el-input>
      </el-form-item>
      <!--选择区域-->
      <el-form-item prop="region" :label="$t('dept.region')">
        <region-select v-model="region" :require-city="false" :require-area="false" ></region-select>
      </el-form-item>
      <el-form-item prop="sort" :label="$t('dept.sort')">
        <el-input-number v-model="dataForm.sort" :min="0" :label="$t('dept.sort')"></el-input-number>
      </el-form-item>
    </el-form>
    <template slot="footer">
      <el-button :loading="loading" type="primary" @click="dataFormSubmitHandle()" size="mini">{{ $t('confirm') }}</el-button>
      <el-button @click="visible = false" size="mini">{{ $t('cancel') }}</el-button>
    </template>
  </el-dialog>
</template>

<script>
import debounce from 'lodash/debounce'
import RegionSelect from '@/components/region-select/region-select'
export default {
  components: {
    RegionSelect
  },
  data () {
    return {
      loading: false,
      region:{},
      visible: false,
      deptList: [],
      deptListVisible: false,
      dataForm: {
        id: '',
        name: '',
        pid: '',
        parentName: '',
        sort: 0,
      }
    }
  },
  computed: {
    dataRule () {
      return {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        parentName: [
          { required: false, message: this.$t('validate.required'), trigger: 'change' }
        ]
      }
    }
  },
  methods: {
    init () {
      this.visible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        this.getDeptList().then(() => {
          console.log('dept add:', this.$store.state.user)
          if (this.dataForm.id) {
            this.getInfo()
          } else if (this.$store.state.user.superAdmin === 1) {
            this.deptListTreeSetDefaultHandle()
          }
        })
      })
    },
    // 获取部门列表
    getDeptList () {
      return this.$http.get('/sys/dept/list').then(({ data: res }) => {
        if (res.code !== 0) {
          return this.$message.error(res.msg)
        }
        this.deptList = res.data
      }).catch(() => {})
    },
    // 获取信息
    getInfo () {
      this.$http.get(`/sys/dept/${this.dataForm.id}`).then(({ data: res }) => {
        if (res.code !== 0) {
          return this.$message.error(res.msg)
        }
        console.log(res)
        this.dataForm = {
          ...this.dataForm,
          ...res.data
        }
        //如果没有父节点 则显示一级部门
        if(this.dataForm.pid === "0"){
          this.dataForm.parentName=this.$t('dept.parentNameDefault');
        }
        var new_region= {}
        new_region.name=res.data.regionNames//设置区域信息
        new_region.ids=res.data.regionIds.split(",")
        this.region=new_region
        this.$refs.deptListTree.setCurrentKey(this.dataForm.pid)
      }).catch(() => {})
    },
    // 上级部门树, 设置默认值
    deptListTreeSetDefaultHandle () {
      this.dataForm.pid = '0'
      this.dataForm.parentName = this.$t('dept.parentNameDefault')
    },
    // 上级部门树, 选中
    deptListTreeCurrentChangeHandle (data) {
      this.dataForm.pid = data.id
      this.dataForm.parentName = data.name
      this.deptListVisible = false
    },
    // 表单提交
    dataFormSubmitHandle: debounce(function () {
      this.loading = true
      this.$refs['dataForm'].validate((valid) => {
        if (!valid) {
          this.loading = false
          return false
        }
        if(this.region.name!==undefined){
          this.dataForm.regionNames=this.region.name
        }
        if(this.region.ids!==undefined){
          this.dataForm.regionIds=this.region.ids.join(",")//逗号拼接
        }
        this.$http[!this.dataForm.id ? 'post' : 'put']('/sys/dept', this.dataForm).then(({ data: res }) => {
          if (res.code !== 0) {
            this.loading = false
            this.region={} //提交失败置空
            return this.$message.error(res.msg)
          }
          this.region={} //提交成功置空
          this.$message({
            message: this.$t('prompt.success'),
            type: 'success',
            duration: 500,
            onClose: () => {
              this.loading = false
              this.visible = false
              this.$emit('refreshDataList')
            }
          })
        }).catch(() => {})
      })
    }, 1000, { 'leading': true, 'trailing': false }),
    beforeClose(){//dialog关闭回调函数
      this.region={} //dialog关闭置空
    }
  }
}
</script>

<style lang="scss">
.mod-sys__dept {
  .dept-list {
    .el-input__inner,
    .el-input__suffix {
      cursor: pointer;
    }
  }
}

</style>
