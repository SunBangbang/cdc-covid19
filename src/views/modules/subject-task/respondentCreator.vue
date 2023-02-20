<template>

  <el-card class="aui-card--fill">

    <avue-crud
      ref="crud"
      v-model="formData"
      :option="respondentOption"
      @row-save="rowSave"
      @row-update="rowUpdate"
      @selection-change="selectionChange"
      :before-open="beforeOpen"
      :data="respondent"
    >

      <template slot="menuLeft" v-if="edit">

        <el-button
          size="mini"
          type="primary"
          icon="el-icon-search"
          @click="dialogTableVisible = !dialogTableVisible"
        >
          选择调查对象
        </el-button>

        <el-button
          size="mini"
          type="primary"
          icon="el-icon-plus"
          @click="addRow"
        >
          新增调查对象
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

      <template slot="menu" slot-scope="{ row, index }">

        <el-button
          type="text"
          size="mini"
          v-if="row.newAdd !== undefined"
          @click="addUpdate(row, index)"
        >
          编辑
        </el-button>

        <el-divider
          direction="vertical"
          v-if="row.newAdd !== undefined"
        ></el-divider>

        <el-button type="text" size="mini" @click="removeRow(row, index)">
          移除
        </el-button>

      </template>

      <template slot="identityForm">

        <el-input
          @change="calcAge(formData)"
          v-model="formData.identity"
          clearable
          maxlength="18"
          placeholder="请输入证件号"
          show-word-limit
          label="证件号"
        ></el-input>

      </template>

      <template slot="address" slot-scope="scope">
        {{scope.row.address | formatAddress}}
      </template>


      <template slot="addressForm">
        <div class="flex">
          <region-select
            v-model="formData.address"
            :showDetailedAddress="true"
            class="flex-item"
            :show-append="false"
          ></region-select>
        </div>
      </template>

    </avue-crud>

    <el-dialog
      title="选择调查对象"
      :visible.sync="dialogTableVisible"
      width="70%"
    >

      <respondent
        :menu="false"
        ref="respondent"
        v-if="dialogTableVisible"
        :respondent="respondent"
      ></respondent>

      <template slot="footer">

        <el-button type="primary" size="mini" @click="getRespondentData">
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

  </el-card>

</template>

<script>
import {
  respondentOption,
  option
} from "@/views/modules/subject-task/option/crudOption";
import Respondent from "@/views/modules/subject-task/respondent";
import {
  respondentInfoPage,
  saveRespondentInfoList,
  saveRespondentInfo,
  updateRespondentInfo
} from "@/api/subject-task/patientInfo";
import {
  getAgeFromIdCard,
  getSexFromIdCard,
  getBirthdayFromIdCard
} from "@/components/form-design/utils/index";
import codeTableApis from "@/api/sys/CodeTable";
import AppConstant from "@/utils/AppConstant";
import RegionSelect from "@/components/region-select/region-select";

export default {
  name: "respondentCreator",
  components: { Respondent, RegionSelect },
  props: {
    edit: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      respondentIdentity: [],
      pageRespondent: [],
      page: {
        currentPage: 1,
        total: 0,
        pageSize: 9999
      },
      selectionList: [],
      dialogTableVisible: false,
      respondentOption: {},
      option: option(true),
      respondent: [],
      selectedData: [],
      user: this.$store.state.user,
      formData: {
        address: {name: '', ids: null, detailedAddress: null},
      }
    };
  },
  activated() {
    this.respondentOption = respondentOption(this.edit);
  },
  mounted() {
    codeTableApis.getByType(AppConstant.CODE_TABLE_IDCARD_TYPE).then(res => {
      if (res.data.code === 0) {
        let options = res.data.data;
        if (options && options.length > 0) {
          this.respondentOption.column[5].dicData = options;
        }
      }
    });
    codeTableApis.getByType(AppConstant.CODE_TABLE_CROWD).then(res => {
      if (res.data.code === 0) {
        let options = res.data.data;
        if (options && options.length > 0) {
          this.respondentOption.column[11].dicData = options;
        }
      }
    });
    codeTableApis.getByType(AppConstant.CODE_TABLE_CASE_TYPE).then(res => {
      if (res.data.code === 0) {
        let options = res.data.data;
        if (options && options.length > 0) {
          this.respondentOption.column[14].dicData = options;
        }
      }
    });
  },
  methods: {
    //移除单行数据
    removeRow(row, index) {
      console.log(row, this.respondent);
      this.respondent.splice(index, 1);
    },
    // 添加空数据行
    addRow() {
      this.$refs.crud.rowAdd();
    },
    rowSave(row, done, loading) {
      row.source = 1;
      row.status = 0;
      row.deptId = this.user.deptId;
      row.creator = this.user.id;
      row.updater = this.user.id;
      row.$cellEdit = false;
      row.newAdd = true;
      console.log("rowSave: ", row);

      loading();
      saveRespondentInfo(row).then(res => {
        if (res.data.code === 0) {
          row.id = res.data.data;
          this.$refs.crud.rowCellAdd(row);
          done();
        } else {
          console.error("err:", res.data.msg);
          if (res.data.code === 10002) {
            this.$message.error("调查对象已经存在");
          } else {
            this.$message.error("保存失败");
          }
        }
      });
    },
    addUpdate(row, index, done, loading) {
      console.log(row)
      this.$refs.crud.rowEdit(row, index);
    },
    rowUpdate(row, index, done, loading) {
      console.log("rowUpdate: ", row);
      loading();
      updateRespondentInfo(row).then(res => {
        if (res.data.code === 0) {
          this.respondent.some(item => {
            if (index === item.$index) {
              console.log("view:", item);
              this.respondent.splice(index, 1, row);
              return true;
            }
          });
          done();
        } else {
          console.error("err:", res.data.msg);
          if (res.data.code === 10075) {
            this.$message.error("证件号已经被使用");
          } else {
            this.$message.error("更新失败");
          }
        }
      });
    },
    // 添加有数据行
    addRowWidthData(data) {
      let h = data.concat(Object.assign([], this.respondent));
      const newArr = [];
      const arrId = [];
      for (const item of h) {
        if (arrId.indexOf(item["identity"]) === -1) {
          arrId.push(item["identity"]);
          newArr.push(item);
        }
      }
      this.respondent = newArr;
      data.forEach(item => {
        item.$cellEdit = false;
        this.$refs.crud.rowCellAdd(item);
      });
    },
    //选择调查对象时获取选择到的数据
    getRespondentData() {
      console.log(this.$refs.respondent.selectionList);
      const data = Object.assign([], this.$refs.respondent.selectionList);
      this.addRowWidthData(data);
      this.dialogTableVisible = !this.dialogTableVisible;
    },
    //当所选项发生变化的时候
    selectionChange(list) {
      this.selectionList = list;
    },
    beforeOpen(done,type) {
      if (type === 'add') {
        this.formData.address =  {name: '', ids: null, detailedAddress: null};
      }
      done();
    },
    //主表格移除所选
    removeSelected() {
      function f(a, b) {
        //排序函数
        return a.$index - b.$index; //返回比较参数
      }
      let data = Object.assign([], this.respondent);
      let selectedData = Object.assign([], this.selectionList);
      selectedData.sort(f);
      selectedData.reverse();
      selectedData.forEach(item => {
        data.splice(item.$index, 1);
      });
      this.respondent = Object.assign([], data);
    },
    //分割保存整合调查对象数据.手动添加的保存到服务器,
    // 方法执行后可以通过ref快速获取当前任务所有调查对象证件号.
    saveRespondent(type) {
      if(type !== 'draft') {
        this.$emit("loading");
      }
      let needSaveRespondent = this.respondent.filter(
        value =>
          value.$cellEdit === true &&
          value.identity &&
          value.identity !== "" &&
          value.name &&
          value.name !== ""
      );
      let respondentIdentityArray = [];
      if (needSaveRespondent.length > 0) {
        saveRespondentInfoList(needSaveRespondent).then(res => {
          if (res.data.code === 0) {
            this.$message.success("调查对象创建成功！");
            this.respondent.forEach(item => {
              if (
                item.$cellEdit === true &&
                item.identity &&
                item.identity !== "" &&
                item.name &&
                item.name !== ""
              ) {
                item.$cellEdit = false;
              }
              respondentIdentityArray.push(item.identity);
            });
            this.respondentIdentity = respondentIdentityArray;
            if(type !== 'draft') {
              this.$emit("loading");
              this.$emit("next");
            }
          } else {
            this.$message.error(res.data.msg);
            this.$emit("loading");
          }
        });
      } else {
        let needSaveRespondent = this.respondent.filter(
          value =>
            value.$cellEdit === false && value.identity && value.identity !== ""
        );
        needSaveRespondent.forEach(item => {
          respondentIdentityArray.push(item.identity);
        });
        this.respondentIdentity = respondentIdentityArray;
        if(type !== 'draft') {
          this.$emit("loading");
          this.$emit("next");
        }
      }
    },
    // 检查是否有重复的证件号 依据后台逻辑,重复的证件号会被物理删除,不可恢复,因此必须严格验证证件号是否重复!!!
    checkValue(type) {
      let respondentArray = this.respondent.filter(
        value => value.identity && value.identity !== ""
      );
      let respondentIdentitySet = new Set();
      respondentArray.forEach(item => {
        respondentIdentitySet.add(item.identity);
      });
      console.log(respondentArray);
      if (respondentIdentitySet.size !== respondentArray.length) {
        this.$message.error("存在证件号相同的调查对象,因此不可以提交!");
      } else {
        this.saveRespondent(type);
      }
    },
    loadData(ids) {
      let str = ids.toString();
      if (str === "" || !ids) {
        str = "nullId";
      }
      // console.log(ids, str)
      let param = {
        identityList: str
      };
      respondentInfoPage(
        this.page.currentPage,
        this.page.pageSize,
        "",
        param
      ).then(res => {
        if (res.data.code === 0) {
          this.respondent = res.data.data.list;
          this.respondent.forEach(item => {
            item.$cellEdit = false;
          });
          this.page.total = res.data.data.total;
        }
      });
    },
    calcAge(formData) {
      this.$nextTick(() => {
        let val = formData.identity;
        //先识别出身份证号
        let reg = /[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]/g;
        let match = val.match(reg);
        if (match && match.length === 1) {
          let age = getAgeFromIdCard(val);
          formData.age = age;
          formData.gender = getSexFromIdCard(val) === "男" ? "0" : "1";
          formData.birthDate = getBirthdayFromIdCard(val);
        } else {
          formData.age = null;
          formData.gender = null;
          formData.birthDate = null;
          delete formData.age;
          console.log("can not parse identity:", formData);
        }
      })
    },
  },
  filters: {
    formatAddress(value) {
      if (value && value.name) {
        return value.name + " " + (value.detailedAddress ? value.detailedAddress : "");
      }
      return "";
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

