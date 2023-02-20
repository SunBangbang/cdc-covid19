<template>
  <el-card class="aui-card--fill">
    <avue-crud
        ref="crud"
        :data="data"
        :option="option"
        :table-loading="loading"
        :page.sync="page"
        :before-close="beforeClose"
        @on-load="onLoad"
        @row-save="rowSave"
        @row-update="rowUpdate"
        @refresh-change="refreshChange"
        class="hide-search-label-container">
      <template slot-scope="scope" slot="menu">
        <el-button type="text" icon="el-icon-view" @click="handleView(scope.row)" size="mini">查看年级</el-button>
        <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.row)" size="mini">编辑</el-button>
        <el-button type="text" icon="el-icon-delete" @click="handleDel(scope.row)" size="mini">删除</el-button>
      </template>

      <template slot-scope="scope" slot="conditionOfFoodSupplyForm">
        <el-select v-model="selectValue"
                   @change="handleSelectChange($event,scope.row)"
                   placeholder="请选择">
          <el-option
              v-for="item in conditionOfFoodSupplyOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
          </el-option>
        </el-select>
        <template v-if="selectValue === '其他'">
          <el-input v-model="input"
                    @input="handleInput($event,scope.row)"
                    placeholder="请输入内容">
          </el-input>
        </template>
      </template>
    </avue-crud>
  </el-card>
</template>

<script>
import {options} from "./options/scene-management-option";
import {getPageList,saveOrUpdate,remove} from "@/api/scene/school";

export default {
  name: "scene-management",
  data() {
    return {
      data: [],
      option:options,
      loading:false,
      page: {//分页数据
        pageSize: 10,
        currentPage: 1,
        total: 0,
        pageSizes: [10, 20, 50, 100]
      },
      conditionOfFoodSupplyOptions:[
        {
          label:"早餐",
          value:"早餐"
        },
        {
          label:"早餐+午餐",
          value:"早餐+午餐"
        },
        {
          label:"早餐+午餐+晚餐",
          value:"早餐+午餐+晚餐"
        },
        {
          label:"其他",
          value:"其他"
        },
      ],
      selectValue:"",
      input:"",
    }
  },
  methods: {
    onLoad(page = {pageSize: 10, currentPage: 1}, params={}){
      this.loading = true;
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
      saveOrUpdate(form).then(res => {
        if(res.data.code === 0){
          this.$message.success('修改成功')
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
            this.$message.success('删除成功')
            this.onLoad(this.page)
          }else{
            this.$message.error(res.data.msg);
          }
        })
      }).catch(() => {});
    },
    handleSelectChange(value,row){
      this.input = '';
      row.conditionOfFoodSupply = value;
    },
    handleInput(value,row){
      row.conditionOfFoodSupply = value;
    },
    //关闭编辑 新增 回调
    beforeClose(done,type){
      this.selectValue = '';
      done();
    },
    handleEdit(row){
      if(row.conditionOfFoodSupply && row.conditionOfFoodSupply.length > 0){
        let flag = this.conditionOfFoodSupplyOptions.some(item =>{
          return item.value === row.conditionOfFoodSupply;
        });
        if(flag){
          this.selectValue = row.conditionOfFoodSupply;
        }else{
          this.selectValue = '其他';
          this.input = row.conditionOfFoodSupply;
        }
      }
      this.$refs.crud.rowEdit(row);
    },
    handleView(row){
      this.$router.push({name: 'scene-grades-management', params: {schoolId: row.id}});
    }
  }
}
</script>

<style scoped>

</style>
