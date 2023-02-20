<template>
  <el-card class="aui-card--fill">
    <el-row>
      <el-col>
        <div>
          <i class="el-icon-arrow-left back-button" @click="goBack">返回</i>
        </div>
      </el-col>
    </el-row>
    <avue-crud
        ref="crud"
        :data="data"
        :option="option"
        :table-loading="loading"
        :page.sync="page"
        @on-load="onLoad"
        @row-save="rowSave"
        @row-update="rowUpdate"
        @refresh-change="refreshChange"
        class="hide-search-label-container">
      <template slot-scope="scope" slot="menu" v-if="scope.row.id && scope.row.id.length > 0">
        <el-button type="text" icon="el-icon-delete" @click="handleDel(scope.row)" size="mini">删除</el-button>
      </template>

      <template slot="menuLeft">
        <el-button @click="addRow" type="primary" icon="el-icon-plus" size="mini">新增</el-button>
      </template>

    </avue-crud>
  </el-card>
</template>

<script>
import {options} from "@/views/modules/scene/options/scene-class-management-option";
import {getPageList,saveOrUpdate,remove} from "@/api/scene/school-class";
export default {
  name: "scene-class-management",
  data() {
    return {
      data: [],
      option: options,
      loading: false,
      page: {//分页数据
        pageSize: 10,
        currentPage: 1,
        total: 0,
        pageSizes: [10, 20, 50, 100]
      },
      schoolId:'',
      gradeId:'',
    }
  },
  created(){
    this.init();
  },
  activated() {
    this.init();
    this.onLoad();
  },
  methods: {
    init(){
      this.schoolId = this.$route.params.schoolId;
      this.gradeId = this.$route.params.gradeId;
    },
    goBack() {
      this.$router.go(-1);
    },
    onLoad(page = {pageSize: 10, currentPage: 1}, params={}){
      this.loading = true;
      params.gradeId = this.gradeId;
      getPageList(page.currentPage,page.pageSize,params).then(res =>{
        if(res.data.code === 0){
          this.data = res.data.data.list;
          this.page.total = res.data.data.total;
        }else{
          this.$message.error(res.data.msg);
        }
      })
      this.loading = false;
    },
    rowSave(form, done) {
      done(form);
      form.schoolId = this.schoolId;
      form.gradeId = this.gradeId;
      saveOrUpdate(form).then(res => {
        if(res.data.code === 0){
          this.onLoad(this.page);
        }else{
          this.$message.error(res.data.msg);
        }
      })
    },
    rowUpdate(form, index, done, loading) {
      done(form);
      form.schoolId = this.schoolId;
      form.gradeId = this.gradeId;
      saveOrUpdate(form).then(res => {
        if(res.data.code === 0){
          this.onLoad(this.page);
        }else{
          this.$message.error(res.data.msg);
        }
      })
    },
    refreshChange() {
      this.onLoad(this.page);
    },
    handleDel(row){
      this.$confirm("确定将选择数据删除?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "btn-custom-cancel",
        type: "warning"
      }).then(() => {
        remove(row.id).then(res =>{
          if(res.data.code === 0){
            this.onLoad(this.page)
          }else{
            this.$message.error(res.data.msg);
          }
        })
      }).catch(() => {});
    },
    addRow(){
      this.$refs.crud.rowCellAdd({
        name: '',
        numOfDayStudents:0,
        numOfResidentStudent:0,
        totalNum:0
      });
    }
  }
}
</script>

<style scoped>
.back-button {
  padding: 10px;
  color: #00bfbf;
  cursor: pointer;
}
</style>
