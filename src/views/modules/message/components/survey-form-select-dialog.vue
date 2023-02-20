<template>
  <el-dialog title="选择表" :visible.sync="dialogVisible" width="50%" :before-close="handleClose">
    <tree-transfer
      class="tree-transfer"
      ref="treeTransferSurveyPerson"
      :title="['待选列表', '已选列表']"
      :from_data='fromSurveyFormData'
      :to_data='toSurveyFormData'
      :defaultProps="{label:'name', key: 'id'}"
      placeholder="搜索"
      mode='transfer'
      width='100%'
      height='540px'
      filter
      @addBtn='addSurveyForm'
      @removeBtn='removeSurveyForm'
      openAll>
      <el-button class="tree-transfer-footer" slot="left-footer" size="mini" @click="clearChecked('treeTransferSurveyPerson','left')">恢复</el-button>
      <el-button class="tree-transfer-footer" slot="right-footer" size="mini" @click="clearChecked('treeTransferSurveyPerson','right')">恢复</el-button>
    </tree-transfer>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" size="mini" @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" size="mini" @click="handleClose">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import TreeTransfer from '@/components/tree-transfer/transfer';
  import { getSurveyFormTreeList } from "@/api/message/message";
  export default {
    components: {
      TreeTransfer
    },
    data() {
      return {
        dialogVisible: false,
        toSurveyFormData: [],
        fromSurveyFormData:[],
        handleData: [],
        receiverData: [],
        data: [],
        tempData: []
      }
    },
    methods: {
      handleClose() {
        this.data = []
        this.toSurveyFormData.forEach(item => {
          if (!item.isCategory) {
            this.data.push(item.id)
            this.tempData.push({id: item.id,name: item.name})
          }
          if (item.children.length>0) {
            this.setData(item.children)
          }
        })
        this.$emit('callback', this.data, this.tempData)
        this.dialogVisible = false
      },
      //关联调查表：增加调查表
      addSurveyForm(fromData, toData, obj) {
        this.fromSurveyFormData = fromData;
        this.toSurveyFormData = toData;
      },
      //关联调查表：移除已选择的调查表
      removeSurveyForm(fromData, toData, obj) {
        this.fromSurveyFormData = fromData;
        this.toSurveyFormData = toData;
      },
      // 关联调查表 tree-transfer组件添加
      clearChecked(formName,type) {
        this.$refs[formName].clearChecked(type)
      },
      // 获取关联调查表
      getSurveyFormTreeList() {
        getSurveyFormTreeList().then(res => {
          this.fromSurveyFormData = res.data.data
          this.handleData = JSON.parse(JSON.stringify(this.fromSurveyFormData))
          this.handleToSurveyFormData(this.handleData)
          this.toSurveyFormData = this.handleData
        })
        this.dialogVisible = true
      },
      setData(val) {
        val.forEach(item =>{
          if (!item.isCategory) {
            this.data.push(item.id)
            this.tempData.push({id: item.id,name: item.name})
          }
          if (item.children.length>0) {
            this.setData(item.children)
          }
        })
      },
      handleToSurveyFormData(val) {
        if (val) {
          for (let i=0;i<val.length;i++) {
            if (this.receiverData.length === 0) {
              this.handleData = []
              return;
            }
            if (val[i].children.length>0) {
              this.handleToSurveyFormData(val[i].children)
            }
            if (val[i].isCategory && val[i].children.length === 0) {
              val.splice(i,1)
              i--
              continue;
            }
            for (let j=0;j<this.receiverData.length;j++) {
              if (!val[i].isCategory) {
                if (val[i].id === this.receiverData[j]) {
                  break;
                }
                if (val[i].id !== this.receiverData[j] && this.receiverData.length - j === 1) {
                  val.splice(i,1)
                  i--;
                }
              }
            }
          }
        }
      }
    }
  }
</script>
