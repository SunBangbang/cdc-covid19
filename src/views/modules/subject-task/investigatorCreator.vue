<template>

  <el-card class="aui-card--fill">

    <avue-crud
      ref="crud"
      :option="investigatorOption"
      :data="investigator"
      @selection-change="selectionChange"
    >

      <template slot="menuLeft" v-if="edit">

        <el-button
          size="mini"
          type="primary"
          icon="el-icon-search"
          @click="dialogTableVisible = !dialogTableVisible"
        >
          选择调查员
        </el-button>

        <el-button
          size="mini"
          type="primary"
          icon="el-icon-search"
          @click="dialogHistoryTableVisible = !dialogHistoryTableVisible"
        >
          根据历史任务选择调查员
        </el-button>

        <el-button
          size="mini"
          type="danger"
          icon="el-icon-delete"
          @click="removeSelected"
        >
          移除所选
        </el-button>

      </template>

      <template slot="menu" slot-scope="{ row, index }" v-if="edit">

        <el-button
          type="text"
          size="mini"
          @click="setGroupLeader(row, index)"
          v-if="row.id !== groupLeader"
        >
          设为质控员
        </el-button>

        <el-divider
          direction="vertical"
          v-if="row.id !== groupLeader"
        ></el-divider>

        <el-button type="text" size="mini" @click="removeRow(row, index)">
          移除
        </el-button>

      </template>

      <template slot="realName" slot-scope="scope">
         {{scope.row.realName}}
        <span
          v-if="scope.row.id === groupLeader"
          style="font-size: 12px; color: white;
              border: #17B3A3 1px solid;
              background-color: #17B3A3;
              transform: scale(0.7);
              border-radius: 2px; padding:  0 5px"
        >
           {{scope.row.id === groupLeader ? '质控员' : ''}}
        </span>

      </template>

      <template slot="mobile" slot-scope="scope">

        <span v-if="edit">
          {{scope.row.mobile.replace(/^(\d{3})\d{4}(\d+)/, "$1****$2")}}
        </span>

        <span v-else>{{scope.row.mobile}}</span>

      </template>

    </avue-crud>

    <el-dialog
      title="选择调查员"
      :visible.sync="dialogTableVisible"
      width="70%"
    >

      <investigator
        :menu="false"
        ref="investigator"
        v-if="dialogTableVisible"
        :investigator="investigator"
      ></investigator>

      <template slot="footer">

        <el-button type="primary" size="mini" @click="getinvestigatorData">
          确定
        </el-button>

        <el-button
          size="mini"
          @click="dialogTableVisible = !dialogTableVisible"
        >
          取消
        </el-button>

      </template>

    </el-dialog>

    <el-dialog
      title="根据历史任务选择调查员"
      :visible.sync="dialogHistoryTableVisible"
      width="70%"
    >

      <investigator-hist-group
        ref="investigatorGroup"
      ></investigator-hist-group>

      <template slot="footer">

        <el-button
          type="primary"
          size="mini"
          @click="getinvestigatorDataFromHistory"
        >
          确定
        </el-button>

        <el-button
          size="mini"
          @click="dialogHistoryTableVisible = !dialogHistoryTableVisible"
        >
          取消
        </el-button>

      </template>

    </el-dialog>

  </el-card>

</template>

<script>
import { investigatorOption } from "@/views/modules/subject-task/option/crudOption";
import Investigator from "@/views/modules/subject-task/investigator";
import InvestigatorHistGroup from "@/views/modules/subject-task/investigatorHistGroup";
import { getRedisDeptList } from "@/api/subject-task/task-management";
export default {
  name: "investigatorCreator",
  components: { Investigator, InvestigatorHistGroup },
  props: {
    edit: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      groupLeader: "",
      investigatorIdentity: [],
      page: {
        currentPage: 1,
        total: 0,
        pageSize: 10
      },
      selectionList: [],
      dialogTableVisible: false,
      dialogHistoryTableVisible: false,
      investigatorOption: {},
      investigator: [],
      selectedData: [],
      user: this.$store.state.user
    };
  },
  activated() {
    this.investigatorOption = investigatorOption(this.edit);
  },
  methods: {
    //移除单行数据
    removeRow(row, index) {
      if (this.groupLeader === row.id) {
        this.groupLeader = null;
      }
      console.log(row, this.investigator);
      this.investigator.splice(index, 1);
    },
    setGroupLeader(row, index) {
      this.groupLeader = row.id;
      let data = Object.assign({}, row);
      this.investigator.splice(index, 1);
      this.investigator.unshift(data);
      this.$message.success("已将" + row.realName + "设置质控员");
    },
    // 添加有数据行
    addRowWidthData(data) {
      let h = data.concat(Object.assign([], this.investigator));
      const newArr = [];
      const arrId = [];
      for (const item of h) {
        if (arrId.indexOf(item["id"]) === -1) {
          arrId.push(item["id"]);
          newArr.push(item);
        }
      }
      this.investigator = newArr;
      data.forEach(item => {
        item.$cellEdit = false;
        this.formatDeptId(item.deptId);
        this.$refs.crud.rowCellAdd(item);
      });
    },
    //选择调查对象时获取选择到的数据
    getinvestigatorData() {
      console.log(this.$refs.investigator.selectionList);
      const data = Object.assign([], this.$refs.investigator.selectionList);
      this.addRowWidthData(data);
      this.dialogTableVisible = !this.dialogTableVisible;
    },
    getinvestigatorDataFromHistory() {
      const data = Object.assign(
        [],
        this.$refs.investigatorGroup.selectionList
      );
      this.addRowWidthData(data);
      this.dialogHistoryTableVisible = !this.dialogHistoryTableVisible;
    },
    //当所选项发生变化的时候
    selectionChange(list) {
      this.selectionList = list;
    },
    //主表格移除所选
    removeSelected() {
      function f(a, b) {
        //排序函数
        return a.$index - b.$index; //返回比较参数
      }
      let data = Object.assign([], this.investigator);
      let selectedData = Object.assign([], this.selectionList);
      selectedData.sort(f);
      selectedData.reverse();
      selectedData.forEach(item => {
        if (this.groupLeader === item.id) {
          this.groupLeader = null;
        }
        data.splice(item.$index, 1);
      });
      this.investigator = Object.assign([], data);
    },
    //分割保存整合调查对象数据.手动添加的保存到服务器,
    // 方法执行后可以通过ref快速获取当前任务所有调查对象证件号.
    saveInvestigator() {
      this.$emit("loading");
      let investigatorIdentityArray = [];
      this.investigator.forEach(item => {
        console.log(this.investigator);
        investigatorIdentityArray.push(item.identity);
      });
      this.investigatorIdentity = investigatorIdentityArray;
      this.$emit("loading");
      this.$emit("next");
    },
    // 检查是否有重复的证件号 依据后台逻辑,重复的证件号会被物理删除,不可恢复,因此必须严格验证证件号是否重复!!!
    checkValue() {
      let investigatorArray = this.investigator.filter(
        value => value.identity && value.identity !== ""
      );
      let investigatorIdentitySet = new Set();
      investigatorArray.forEach(item => {
        investigatorIdentitySet.add(item.identity);
      });
      if (investigatorIdentitySet.size !== investigatorArray.length) {
        this.$message.error("存在证件号相同的调查对象,因此不可以提交!");
      } else {
        this.saveInvestigator();
      }
    },
    loadData(investigators, groupLeader) {
      this.investigator = investigators;
      this.investigator.forEach(item => {
        this.formatDeptId(item.deptId);
      });
      this.groupLeader = groupLeader;
    },
    formatDeptId(value) {
      getRedisDeptList(value).then(res => {
        this.investigatorOption.column[3].dicData.push({
          label: res.data.data,
          value: value
        });
      });
    }
  }
};
</script>

<style scoped>
:deep(.avue-crud__menu) {
  height: fit-content;
  min-height: 0;
  /*display: none;*/
}
</style>

