<template>
  <el-card class="aui-card--fill">
    <avue-crud
        ref="crud"
        :data="data"
        :option="option"
        v-model="formData"
        :table-loading="loading"
        :page.sync="page"
        :upload-before="uploadBefore"
        :upload-after="uploadAfter"
        :upload-error="uploadError"
        :upload-exceed="uploadExceed"
        @on-load="onLoad"
        @row-save="rowSave"
        @row-update="rowUpdate"
        @refresh-change="refreshChange"
        :search.sync="search"
        @search-change="searchChange"
        @search-reset="searchReset"
        class="hide-search-label-container">
      <template slot-scope="scope" slot="menu">
        <el-button type="text" icon="el-icon-document" @click="toSee(scope.row)" size="mini">预览</el-button>
        <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.row)" size="mini">编辑</el-button>
        <el-button type="text" icon="el-icon-delete" @click.stop="rowDel(scope.row)" size="mini" class="dangerBtn">删除
        </el-button>
      </template>
      <template slot="status" slot-scope="scope">
        <el-tag size="small"
                :type="scope.row.status === 'WORKING' ? 'success' : scope.row.status === 'STOP' ? 'info' : scope.row.status === 'OFFLINE' ? 'info' : '' ">
          {{ scope.row.status | formatStatus }}
        </el-tag>
      </template>
      <template slot-scope="scope" slot="menuForm">
        <div class="text-right">
          <el-button size="mini" @click="$refs.crud.closeDialog()">取消</el-button>
          <el-button type="primary" size="mini" @click="$refs.crud.rowSave()">确定</el-button>
        </div>
      </template>
    </avue-crud>
  </el-card>
</template>

<script>
import {getPageList, remove, saveOrUpdate} from '@/api/sys/rotation-chart'
import {getDictLabel} from '@/utils'
import {getUserList} from '@/api/user/user'
import Cookies from "js-cookie"

const MAX_UPLOAD_FILE_SIZE = 2*1024*1024  //2MB
const MAX_UPLOAD_NUMBER = 6 //最大上传文件数量
export default {
  data() {
    var validateTime = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请选择结束日期！'));
      } else if (value < this.formData.startTime) {
        callback(new Error('结束日期不能早于开始日期！'));
        I
      } else {
        callback();
      }
    };
    return {
      loading: true,
      data: [],
      formData: {},
      search: {},
      attachment: [],
      page: {
        currentPage: 1,
        pageSize: 10,
        total: 0,
        pageSizes: [10, 20, 50, 100]
      },
      option: {
        dialogDrag: true,
        title: '表格的标题',
        menuWidth: 200,
        size: 'mini',
        border: true,
        index: true,
        indexLabel: '序号',
        emptyBtnText: "重置",
        editBtn: false,
        delBtn: false,
        saveBtn: false,
        updateBtn: false,
        cancelBtn: false,
        searchMenuSpan: 4,
        align: 'center',
        menuAlign: 'center',
        menuPosition: 'left',
        column: [
          {
            label: '名称',
            prop: 'name',
            rules: [{
              required: true,
              message: "请输入名称",
              trigger: "blur"
            }],
            search: true,
            searchSpan: 4
          }, {
            label: '图片上传',
            prop: 'tempImg',
            rules: [{
              required: true,
              message: "请上传图片",
              trigger: "blur"
            }],
            type: 'upload',
            listType: 'picture-card',
            action: window.SITE_CONFIG['singleUploadURL'],
            data:{
              type:"other",
            },
            headers: {Authorization: Cookies.get('access_token')},
            propsHttp:{
              res:"data",
              url:"url",
              name:"name",
            },
            loadText: '附件上传中，请稍等',
            span: 24,
            fileSize: 2*1024*1024,  //2MB
            tip: '支持图片格式：jpeg png，长720，宽255, 单个文件不能超过2MB，最大上传数' + MAX_UPLOAD_NUMBER,
            hide: true,
            limit: MAX_UPLOAD_NUMBER
          },
          {
            label: '开始时间',
            prop: 'startTime',
            rules: [{
              required: true,
              message: "请选择开始时间",
              trigger: "blur"
            }],
            type: 'date',
            format: 'yyyy-MM-dd',
            valueFormat: 'yyyy-MM-dd'
          },
          {
            label: '结束时间',
            prop: 'endTime',
            rules: [{
              validator: validateTime,
              trigger: 'blur',
            }],
            type: 'date',
            format: 'yyyy-MM-dd',
            valueFormat: 'yyyy-MM-dd'

          },
          {
            label: '最近修改',
            prop: 'updateName',
            addDisplay: false,
            editDisplay: false,
            props: {
              label: 'realName',
              value: 'username'
            },
            dicData: getUserList()
          },
          {
            label: '创建时间/修改时间',
            prop: 'updateDate',
            type: 'date',
            format: 'yyyy-MM-dd HH:mm:ss',
            valueFormat: 'yyyy-MM-dd hh:mm:ss',
            addDisplay: false,
            editDisplay: false
          },
          {
            label: '链接地址',
            prop: 'url',
            hide: true
          },
          {
            label: '展示状态',
            prop: 'status',
            slot: true,
            addDisplay: false,
            editDisplay: false
          },
          {
            label: '下线',
            prop: 'offline',
            hide: true,
            type: 'switch',
            addDisplay: false
          },
        ]
      }
    }
  },
  filters: {
    formatStatus(value) {
      return getDictLabel('rotation_status', value)
    },
    formatDate(value) {
      return moment(value).format('YYYY-MM-DD');
    }
  },
  methods: {
    onLoad(page = {currentPage: 1, pageSize: 10}, params = {}) {
      getPageList(page.currentPage, page.pageSize, params).then(res => {
        this.data = res.data.data.list
        this.page.total = res.data.data.total
      })
      this.loading = false
    },
    rowDel(row) {
      this.$confirm("确定将选择数据删除?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "btn-custom-cancel",
        type: "warning"
      }).then(() => {
        remove(row.id).then(() => {
          this.onLoad(this.page)
          this.$message.success('操作成功')
        })
      }).catch(() => {})
    },
    rowSave(form, done) {
      form.tempImg = form.tempImg ? form.tempImg.map(img => img.value).join(',') : null
      // console.log('save:', form)
      done(form);
      saveOrUpdate(form).then((res) => {
        if(res.data.code==0){
          this.onLoad(this.page)
          this.$message.success('操作成功')
        }else{
          this.$message.error(res.data.msg)
        }
      })
    },
    searchChange(params, done) {
      this.onLoad(this.page, params)
      done()
    },
    searchReset() {
      this.search = {}
    },
    refreshChange() {
      this.onLoad(this.search)
    },
    handleEdit(row) {
      this.$refs.crud.rowEdit(row);
    },
    toSee(row) {
      let img = row.tempImg
      let datas = img.split(',').map(img => { return {url: img}})
      this.$ImagePreview(datas);
    },
    rowUpdate(form, index, done, loading) {
      // form.tempImg = form.tempImg ? form.tempImg.map(img => img.value).join(',') : null
      console.log('update:', form)
      done(form);
      saveOrUpdate(form).then((res) => {
        if(res.data.code==0){
          this.onLoad(this.page)
          this.$message.success('操作成功')
        }else{
          this.$message.error(res.data.msg)
        }
      })
    },
    uploadBefore(file, done, loading, column) {
      console.log(file, column)
      if(file.name.endsWith('.jpg') || file.name.endsWith('.jpeg') || file.name.endsWith('.png')){
           done()
      }else{
           this.$message.error('请检查文件类型！')
           loading() //中断
        }
    },
      uploadError(error, column) {
          this.$message.error('上传失败:' + error)
          console.log(error, column)
      },
      uploadAfter(res, done, loading,column) {
          console.log(res,column)
          done()
      },
      uploadExceed(limit, files, fileList, column){
        console.log(limit, files, fileList, column)
        if(limit >= MAX_UPLOAD_NUMBER){
          this.$message.warning('不能超过最大上传数!')
        }
     }
  }
}
</script>

<style scoped>

</style>
