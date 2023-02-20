<template>
  <div>
    <avue-crud ref="crud"
               :option="investigatorOption"
               :data="investigator"
               @selection-change="selectionChange">
      <template slot="menuLeft">
        <el-button size="mini" type="primary" icon="el-icon-search" @click="dialogTableVisible = !dialogTableVisible">选择调查员</el-button>
        <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeSelected">移除所选</el-button>
      </template>
      <template slot="menu" slot-scope="{row,index}">
        <el-button type="text" size="mini" @click="removeRow(row, index)">移除</el-button>
      </template>
    </avue-crud>
    <el-row class="submit">
      <el-button @click="saveInvestigators" type="primary" size="mini">确认</el-button>
      <el-button @click="onLoad" size="mini">重置</el-button>
    </el-row>
    <el-dialog title="选择调查员" :visible.sync="dialogTableVisible" width="70%">
      <investigator :menu="false" ref="investigator" v-if="dialogTableVisible"
                    :task-id="this.taskId"
                    :investigator="investigator">
      </investigator>
      <template slot="footer">
        <el-button type="primary" size="mini" @click="getInvestigatorData">确定</el-button>
        <el-button size="mini" @click="dialogTableVisible = !dialogTableVisible">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {investigatorOption} from "@/views/modules/collaborative-investigation-task/js/options";
import Investigator from "@/views/modules/collaborative-investigation-task/components/investigator";
import {assignInvestigator} from "@/api/assistant/assistant";

export default {
  name: "investigatorCreator",
  components: {Investigator},
  props:{
    taskId: {
      type: String,
      required: true,
    },
    appId: {
      type: String,
    },
    invList: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      investigatorIdentity: [],
      selectionList: [],
      dialogTableVisible: false,
      dialogHistoryTableVisible: false,
      investigatorOption: {},
      investigator: [],
      selectedData: [],
    }
  },
  activated() {
    this.investigatorOption = investigatorOption()
    this.onLoad()
  },

  methods: {
    onLoad() {
      this.investigator = Object.assign([], this.invList)
    },
    //移除单行数据
    removeRow(row, index) {
      this.investigator.splice(index, 1)
    },
    // 添加有数据行
    addRowWidthData(data) {
      data.forEach(item => {
        item.$cellEdit = false
        this.$refs.crud.rowCellAdd(item);
      })
    },
    //选择调查对象时获取选择到的数据
    getInvestigatorData() {
      const data = Object.assign([], this.$refs.investigator.selectionList)
      this.addRowWidthData(data)
      this.dialogTableVisible = !this.dialogTableVisible
    },
    //当所选项发生变化的时候
    selectionChange(list){
      this.selectionList = list
    },
    //主表格移除所选
    removeSelected() {
      function f(a,b) {  //排序函数
        return (a.$index - b.$index);  //返回比较参数
      }
      let data = Object.assign([], this.investigator)
      let selectedData = Object.assign([], this.selectionList)
      selectedData.sort(f)
      selectedData.reverse()
      selectedData.forEach(item => {
        data.splice(item.$index, 1)
      })
      this.investigator = Object.assign([], data)
    },

    saveInvestigators() {
      if(this.investigator.length === 0){
        this.$message.warning('请选择调查员！')
        return
      }
      let selectEmployees = this.investigator.map(item=>
        { return {userId: item.id, realName: item.realName}}
      )
      let delEmployees = []
      let employees = []
      let ids1 = []
      let ids2  = []
      // 获取 原始调查员数据与用户选择的新调查员数据差异
      this.invList.forEach(item => {ids1.push(item.id)})
      selectEmployees.forEach(item => {ids2.push(item.userId)})
      let different = [
        ...ids1.filter(value=>ids2.indexOf(value)===-1),
        ...ids2.filter(value=>ids1.indexOf(value)===-1)
      ]
      let delRealName = ''
      let addRealName = ''
      // 如果这个差异仅包含在原始调查员数据中，证明该数据在新的调查员数据里是不存在的，属于删除
      this.invList.forEach(item => {
        if (different.includes(item.id)) {
          delEmployees.push(item)
          delRealName += item.realName + '，'
        }
      })
      // 如果这个差异仅包含在新调查员数据中，证明该数据在原始调查员数据里是不存在的属于新增
      selectEmployees.forEach(item => {
        if (different.includes(item.userId)) {
          employees.push(item)
          addRealName += item.realName + '，'
        }
      })
      // 删除不必要的属性
      delEmployees.forEach(item => {
        item.userId = item.id
        delete item.$index
        delete item.id
      })
      let addMessage = addRealName ? '将新增调查员：' + addRealName : ''
      let delMessage = delRealName ? '将删除调查员：' + delRealName + '删除后，该调查员账户下的协查任务也将删除，' : ''
      let message = '请注意此操作所带来的影响，' + addMessage + delMessage + '是否继续？'
      if (!addRealName && !delRealName) {
        message = '您并没有变更任何调查员，确认后将直接返回上一页且不会执行任何操作！'
      }
      this.$confirm(message, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        cancelButtonClass: "btn-custom-cancel",
        type: 'warning'
      }).then(() => {
        let obj = {
          taskId: this.taskId,
          appId: this.appId,
          employees: employees,
          delEmployees: delEmployees
        }
        console.log("新增",employees, "删除",delEmployees)
        if (employees.length > 0 ||  delEmployees.length > 0) {
          assignInvestigator(obj).then(res=>{
            let d = res.data
            if(d.code === 0){
              this.$router.go(-1)
              this.$message.success('操作成功')
            }else{
              this.$message.error('操作失败')
            }
          })
        } else {
          this.$router.go(-1)
        }
      }).catch(() => {});
    },

  }
}
</script>

<style scoped>
:deep(.avue-crud__menu) {
  height: fit-content;
  min-height: 0;
  /*display: none;*/
}
.submit {
  text-align: center;
  margin-top: 30px;
}
</style>
