<template>
  <el-dialog title="选择用户" :visible.sync="dialogVisible" width="50%" :before-close="handleSubmit">
    <el-transfer
      filterable
      :titles="['待选用户', '已选用户']"
      :filter-method="filterMethod"
      filter-placeholder="请输入用户名"
      v-model="value"
      :props="{label: 'label', key: 'id'}"
      :data="userList">
    </el-transfer>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="handleSubmit()" size="mini">确 定</el-button>
      <el-button @click="dialogVisible = false" size="mini">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import {getUserPageList} from "@/api/message/message";

  export default {
    data() {
      return {
        dialogVisible: false,
        userList: [],
        value: [],
        filterMethod(query, item) {
          // return item.username.indexOf(query) > -1 || item.realName.indexOf(query) > -1;
          return item.realName.indexOf(query) > -1;
        }
      }
    },
    created() {
      this.getUserList()
    },
    methods: {
      // handleClose() {
      //   this.dialogVisible = false
      // },
      getUserList () {
        //仅查询当前用户所在部门，人数限制2000
        getUserPageList(1, 2000, {onlyMydept: true}).then(res => {
          if(res.data.code === 0){
            this.userList = res.data.data.list
            // this.userList.forEach(item => item.label = item.realName + '(' + item.username + ')')
            this.userList.forEach(item => item.label = item.realName)
          }else{
            console.log('err:', res.data.msg)
            this.$message.error("获取用户列表失败")
          }
        })
      },
      handleSubmit () {
        this.$emit('callback', this.value)
        this.dialogVisible = false
      }
    }
  }
</script>

<style scoped>

</style>
