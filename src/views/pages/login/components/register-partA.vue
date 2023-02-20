<template>
  <el-row>
    <el-form :model="formPartA" ref="formPartA" label-width="90px">
      <el-form-item label="账户名称：" >
        <el-input ></el-input>
      </el-form-item>
      <el-form-item label="手机号码：" >
        <el-input ></el-input>
      </el-form-item>
      <el-form-item label="组织机构：" class="is-required role-list" >
        <treeselect class="treeSelectClass" v-model="deptSelectedList"
                    :multiple="true"
                    :flat="true"
                    :load-options="loadOptions"
                    :auto-load-root-options="true"
                    :options="deptList"
                    retryText="重试？"
                    noOptionsText="无任何组织"
                    placeholder="请选择所属组织"
        />
      </el-form-item>
    </el-form>
  </el-row>
</template>

<script>
import { Treeselect, LOAD_CHILDREN_OPTIONS } from '@riophae/vue-treeselect'
import {lazyDeptTreeWithoutLogin} from "@/api/sys/dept";
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: "register-partA",
  components: { Treeselect },
  data() {
    return {
      deptSelectedList: [],
      deptList: [],
      formPartA: {}
    }
  },
  created() {
    this.getDeptList()
  },
  methods: {
    loadOptions({ action, parentNode, callback }){
      if (action === LOAD_CHILDREN_OPTIONS) {
        lazyDeptTreeWithoutLogin({pid: parentNode.id}).then((res) => {
          if (res.data.code === 0) {
            parentNode.children = this.deleteChildren(res.data.data)
            callback()
          } else {
            callback(new Error(res.data.msg))
          }
        }).catch(() => {
          callback(new Error('加载失败！'))
        })
      }
    },
    // 获取组织机构列表数
    getDeptList () {
      return lazyDeptTreeWithoutLogin().then((res) => {
        this.deptList = res.data.data
      }).catch(() => {})
      //   return this.$http.get('/sys/dept/treeSelectList').then(({ data: res }) => {
      //       if (res.code !== 0) {
      //           return this.$message.error(res.msg)
      //       }
      //       // this.deptList = res.data;
      //       this.deptList = this.deleteChildren(res.data)
      //   }).catch(() => {})
    },
    deleteChildren(deptList){
      deptList.forEach(item=>{
        if(!item.children || !item.children.length){
          delete item.children
        }else{
          this.deleteChildren(item.children)
        }
      })
      console.log(deptList)
      return deptList
    },
  }
}
</script>

<style lang="scss" scoped>
.mod-sys__user {
  .role-list {
    .el-select {
      width: 100%;
    }
  }
}
.el-dialog {
  width: 60%;
}
.el-card__body {
  .el-form-item {
    margin-bottom: 15px;
  }
}
.treeSelectClass {
  line-height: 20px;
}
.avatar-uploader {
  text-align: center;
  padding-top: 30px;
}
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}
.avatar {
  width: 100px;
  height: 100px;
  display: block;
}
</style>

