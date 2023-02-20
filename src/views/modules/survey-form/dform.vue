<template>
  <div>
  <el-row>
    <el-col>
      <div>
        <i class="el-icon-arrow-left back-button" @click="goBack">返回</i>
      </div>
    </el-col>
  </el-row>
  <div id="form-design">
    <avue-form-design
                      class="form-design"
                      :options="options"
                      :toolbar="toolbar"
                      :customFields="customFields"
                      :showClearBtn="showClearBtn"
                      ref="form"
                      :loading="loadingForm">
        <el-button slot="toolbar-right"
                   type="text"
                   size="medium"
                   icon="el-icon-search"
                   @click="fieldTempDialogFormVisible = true">
            定义属性
        </el-button>
        <el-button slot="toolbar-right"
                 v-if="!showFormBtn"
                 type="text"
                 size="medium"
                 icon="el-icon-check"
                 @click="dialogFormVisible = true">
        保存模板
      </el-button>
      <el-button slot="toolbar-right"
                 v-if="showFormBtn"
                 type="text"
                 size="medium"
                 icon="el-icon-check"
                 @click="dialogFormVisible = true">
        保存表单
      </el-button>
    </avue-form-design>

    <el-dialog title="保存"  :visible.sync="dialogFormVisible" :before-close="resetdialogForm">
      <el-form :model="ruleForm" ref="dialogForm" :rules="rules" label-width="80px">
        <!--<el-form-item label="调查表类别" prop="category" v-if="showFormBtn">
          <avue-input-tree placeholder="全部分类" type="tree" :dic="categoryDict"
                           v-model="ruleForm.category" @change="changeCategory">
          </avue-input-tree>
        </el-form-item>-->

        <el-form-item label="名称" prop="name">
          <el-input v-model="ruleForm.name" placeholder="名称"  maxlength="50" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="ruleForm.remark" placeholder="备注"  maxlength="300" show-word-limit></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogFormSubmit" :loading="loading">确 定</el-button>
        <el-button @click="dialogFormVisible = false">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog title="定义属性" :visible.sync="fieldTempDialogFormVisible" :before-close="resetTempDialogForm">
      <el-form :model="formFieldTemplate" ref="formFieldTempDialogForm" :rules="tempRules">
        <el-form-item label="表单属性模板" prop="category">
            <avue-input-tree size="mini"
                             v-model="formFieldTemplate.category"
                             placeholder="请选择属性模板"
                             type="tree"
                             style="width:70%;"
                             :dic="formFieldTempBizDict"
                             :clearable="false"
                             :nodeClick="changeBizFormTemp">
            </avue-input-tree>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="selectFormFieldTemp" :loading="loading">确 定</el-button>
        <el-button @click="fieldTempDialogFormVisible = false">取 消</el-button>
      </div>
    </el-dialog>

  </div>
  </div>
</template>

<script>
import {save, update, getFormJson, pageCommonForm, getFormCfg, getReleaseFormJson} from "@/api/survey-form/questionnaire"
import {save as saveTemp, update as updateTemp, getFormJson as getTempFormJson,getAllModelForm, getAllPrepareModule} from "@/api/survey-form/commonModule"
// import {getCategoryDictDataByName} from '@/api/questionnaire-category/questionnaire-category'
import {getBizDictType} from '@/api/dict/dict'
import AppConstant from "@/utils/AppConstant"
import {isEmpty} from "@antv/util"

  export default {
    name: "dform-create",
    data () {
      return {
        showClearBtn: true, //是否显示清空按钮
        formType: 1,//表单类型
        category: null,//表单分类类型
        tempType: 0, //模板类型
        pid: '0', //父表单OID,
        oid: null,
        options: {},
        showFormBtn: true,//模板为false 表单为true
        // categoryDict: [],
        toolbar: {//顶部工具栏
          type: Array
        },
        ruleForm:{
          name: this.$store.state.user.currentDeptName + '调查表',//调查表单名称
          remark: '', //修改说明
        },
        rules: {
          // category:{required: true, message: '请输入调查表单类型', trigger: 'blur' },
          name:{required: true, message: '请输入名称', trigger: 'blur' }
        },
        dialogFormVisible:false,//弹出框
        fieldTempDialogFormVisible:false,//弹出框
        loading:false,
        customFields:[],//自定义组件,
        loadingForm: false,
        formFieldTemplate: {
          category: ''//调查表字段模板类型
        },
        tempRules: {
          category:{required: true, message: '请选择表单属性模板类型', trigger: 'blur' },
        },
        formFieldTempBizDict: [],
      }
    },
    methods: {
      goBack() {
        // this.$router.go(-1);
        let tabName = this.$store.state.contentTabsActiveName
        let tab= this.$store.state.contentTabs.find(item => item.name === tabName)
        if (tab) {
          this.$router.push({
            'name': tab.name,
            'params': { ...tab.params },
            'query': { ...tab.query }
          })
        }
      },
      dialogFormSubmit(){
        this.$refs.dialogForm.validate((valid) => {
          if (!valid) {//未通过验证
            return false
          }
          else{//验证通过
            this.loading=true
            this.$refs.form.getData().then(json =>{
              if(this.showFormBtn){//表单
                json.relation = this.$refs.form.parseRelations()
                let data = {
                  'form': json,
                  'category': this.category,//调查表类型: 新冠肺炎类型
                  'type': this.formType,
                  'surveyName':this.ruleForm.name.trim(),
                  'remark':this.ruleForm.remark.trim(),
                  'fieldTempCtg': this.formFieldTemplate.category,
                  'ftlFile': this.formFieldTemplate.ftlFile,
                  'pid': this.pid //父表单OID
                }
                if(this.oid === null){//保存
                  save(data).then(res=> {
                    if(res.data.code == 0){
                      this.$message.success('新增成功')
                      this.loading=false
                      this.dialogFormVisible=false
                      // 关闭编辑标签页
                      this.$store.state.contentTabs = this.$store.state.contentTabs
                              .filter(item => item.name !== 'dform-create'
                                      && item.name !== 'dform-edit'
                                      && item.name !== 'module-create'
                                      && item.name !== 'module-edit');
                      if(this.formType === 0){
                        this.$router.push({path: '/survey-form-common-questionnaire'})
                      }else if(this.formType === 1){
                        this.$router.push({path: '/survey-form-custom-questionnaire'})
                      }
                    }else{
                      this.loading=false
                      this.$message.error(res.data.msg)
                    }
                  })
                }
                else {//更新
                  update(data, this.oid).then(res=> {
                    if(res.data.code == 0){
                      this.$message.success('更新成功')
                      this.loading=false
                      this.dialogFormVisible=false
                      // 关闭编辑标签页
                      this.$store.state.contentTabs = this.$store.state.contentTabs
                              .filter(item => item.name !== 'dform-create'
                                      && item.name !== 'dform-edit'
                                      && item.name !== 'module-create'
                                      && item.name !== 'module-edit');
                      if(this.formType === 0){
                        this.$router.push({path: '/survey-form-common-questionnaire'})
                      }else if(this.formType === 1){
                        this.$router.push({path: '/survey-form-custom-questionnaire'})
                      }
                    }else{
                      this.loading=false
                      this.$message.error(res.data.msg)
                    }
                  })
                }
              }
              else{//模板
                let data = {
                  'form': json,
                  'name': this.ruleForm.name.trim(),
                  'fieldTempCtg': this.formFieldTemplate.category,
                  'type': this.tempType
                }
                if(this.oid === null){
                  saveTemp(data).then(res=> {
                    console.log(res.data.code)
                    if(res.data.code == 0){
                      this.loading=false
                      this.dialogFormVisible=false
                      this.$message.success('新增成功')
                      // 关闭编辑标签页
                      this.$store.state.contentTabs = this.$store.state.contentTabs
                              .filter(item => item.name !== 'dform-create'
                                      && item.name !== 'dform-edit'
                                      && item.name !== 'module-create'
                                      && item.name !== 'module-edit');
                      if(this.tempType === 0){
                        this.$router.push({path: '/survey-form-common-module'});
                      }else if(this.tempType === 1){
                        this.$router.push({path: '/survey-form-preinstall-module'});
                      }
                    }else{
                      this.loading=false
                      this.$message.error(res.data.msg)
                    }
                  })
                }
                else{
                  updateTemp(data, this.oid).then(res=> {
                    console.log(res.data.code)
                    if(res.data.code == 0){
                      this.loading=false
                      this.dialogFormVisible=false
                      // 关闭编辑标签页
                      this.$store.state.contentTabs = this.$store.state.contentTabs
                              .filter(item => item.name !== 'dform-create'
                                      && item.name !== 'dform-edit'
                                      && item.name !== 'module-create'
                                      && item.name !== 'module-edit');
                      this.$message.success('更新成功')
                      if(this.tempType === 0){
                        this.$router.push({path: '/survey-form-common-module'});
                      }else if(this.tempType === 1){
                        this.$router.push({path: '/survey-form-preinstall-module'});
                      }
                    }else{
                      this.loading=false
                      this.$message.error(res.data.msg)
                    }
                  })
                }
              }
            })
          }
        });
      },
      //配置项转自定义组件配置项
      transOptionsToCustomField(data) {
        let _this = this
        let form = _this.$refs.form
        return new Promise((resolve, reject) => {
          let result = [];
          if(form){
            data.forEach(item => {
              let i = {
                type: 'model',
                icon: 'icon-group',
                label: item.surveyName || item.name,
                id: item.oid || item.id
              };
              form.transOptionsToFormDesigner(item.form).then(c => {
                i.column = c.column;
              });
              result.push(i);
            })
          }
          resolve(result);
        });
      },
      loadPreInstallModule() {
        let result = {
          title: '国家定制模块',
          list: []
        }
        this.asyncLoadCustomFields(1, result, 10, getAllPrepareModule)
      },
      loadCustomModule() {
        let result = {
          title: '个人模块',
          list: []
        }
        this.asyncLoadCustomFields(1, result, 10, getAllModelForm)
      },
      loadCommonForm() {
         let result = {
           title: '国家定制模块',
           list: []
         }
        this.asyncLoadCustomFields(1, result, 5, pageCommonForm)
       },
      /** 单个组件json过大，故分批加载组件
       */
      async asyncLoadCustomFields(page, result, limit, callback) {
        try{
            let res = await callback(page, limit)
            if (res.data.code === 0) {
                let dataList = res.data.data.list
                if(dataList.length > 0){
                    result.list = result.list.concat(dataList)
                    if(dataList.length < limit){
                        //最后一页
                        this.transOptionsToCustomField(result.list).then(item=>{
                            result.list = item
                        })
                        this.customFields.push(result)
                    }else{
                        let pagee = page + 1
                        await this.asyncLoadCustomFields(pagee, result, limit, callback)
                    }
                }else{
                    this.transOptionsToCustomField(result.list).then(item=>{
                        result.list = item
                    })
                    this.customFields.push(result)
                }
            } else {
                this.$message.error(res.data.msg)
            }
        }catch (err) {
           console.error(err)
        }
      },
      loadCustomFields(title,callback){
          let result = {
              title: title,
              list: []
          };
              try {
                  callback().then(res => {
                      if (res.data.code === 0) {
                          this.transOptionsToCustomField(res.data.data).then(item =>{
                              result.list=item;
                          });
                          this.customFields.push(result);
                      } else {
                          this.$message.error(res.data.msg)
                      }
                  });
              } catch (e) {
                  this.$message.error(`生成${title}时发生错误，错误原因${e}`)
              }
      },
      changeCategory(val) {
        console.log('change category ', val)
        this.ruleForm.category = val
      },
      resetdialogForm(done){
        this.$refs.dialogForm.resetFields()
        done()
      },
      changeBizFormTemp(val) {
         // console.log('changeBizFormTemp:', val)
      },
      selectFormFieldTemp() {
        this.$refs.formFieldTempDialogForm.validate((valid) => {
          if (!valid) {//未通过验证
            return false
          } else {//验证通过
            this.$refs.form.tempDict = this.formFieldTemplate.category
            this.loading = false
            this.fieldTempDialogFormVisible = false
          }
        })
      },
      resetTempDialogForm(done){
        this.$refs.formFieldTempDialogForm.resetFields()
        done()
      },
      async getBizDictType() {
        //获取表单属性模板
        let res = await getBizDictType({page: 1, limit: 1000})
        if (res.data.code === 0) {
          this.formFieldTempBizDict = res.data.data.list.map(ele => {
            return {label: ele.dictName, value: ele.dictType}
          })
          // console.log('templates:', this.formFieldTempBizDict)
        } else {
          this.$message.error(res.data.msg)
        }
      }
    },
    created () {
      //
      /**
       * type:  template=模块, 其他为表单
       * formType: 0=公共表单， 1=自定义表单
       * tempType: 0=自定义模板，1=公共组件模板
       * pid: 父表单OID，引用其他表单时有值
       */
      const { id, type, formType, tempType, version, pid, formCtg} = this.$route.params

      if(formType !== undefined && tempType !== ''){
        this.formType = formType
      }
      if(formCtg !== undefined && formCtg !== '' && formCtg === AppConstant.FORM_CATEGORY_OTHER){
        this.showClearBtn = false //引用表单类型不显示清空按钮
      }
      if(pid !== undefined && pid !== ''){
        this.pid = pid
      }
      //固定： 1338780677165748226->自定义表单，1338780403902648322->国家表单
      this.category = formType === 0 ? '1338780403902648322' : '1338780677165748226'
      if(tempType !== undefined && tempType !== ''){
        this.tempType = tempType
      }
      this.toolbar=['import', 'generate', 'preview', 'clear'];

      this.loadPreInstallModule();
      // this.loadCommonForm();
      this.loadCustomModule();

      this.$store.state.sidebarFold=true;

      if(type === 'template'){//模板
        this.showFormBtn = false;
      }else if(this.formType === 0){
        // this.loadCategoryDict('公共表单');
        this.showFormBtn = true
      }else{
        // this.loadCategoryDict('自定义表单');
        this.showFormBtn = true
      }

      //获取表单属性模板
      this.getBizDictType()

      //引用新建表单
      if(pid) {
        getReleaseFormJson(pid).then(res =>{
          this.loadingForm = true
          if(res.data.code === 0){
            this.options = res.data.data.json;
          }else{
            this.$message.error(res.data.msg)
          }
        })
        getFormCfg(pid).then(res => {
          if(res.data.code === 0){
            let d = res.data.data
            if(!isEmpty(d)){
              this.formFieldTemplate.category = d.fieldTempCtg
              this.formFieldTemplate.ftlFile = d.ftlFile
              this.$refs.form.tempDict = this.formFieldTemplate.category
            }
            console.log('formFieldTemplate:', this.formFieldTemplate)
          }else{
            console.error('err:', res.data.msg)
          }
        })
        return
      }

      if(id === undefined){
        //创建
        this.loadingForm = false
      }else{
         //编辑
        this.oid = id
        if(type === 'template'){
          getTempFormJson(id).then(res => {
            console.log('load template from json')
            this.loadingForm = true
            if(res.data.code === 0){
              let data = res.data.data
              let json
              if((typeof data.json) ==='string'){
                json = JSON.parse(data.json)
              }else{
                json = data.json
              }
              this.options = json;
              this.ruleForm.name = data.surveyName.trim();
              this.formFieldTemplate.category = data.fieldTempCtg
              if(data.fieldTempCtg) {
                this.$refs.form.tempDict = this.formFieldTemplate.category
              }
            }else{
              console.error('err:', data.msg)
              this.$message.error(data.msg)
            }
          }).then(() => {
            this.$nextTick(() => {
              this.$refs.form.closeLoading()
              this.loadingForm = false
            })
          }).catch(() => {
            this.$refs.form.closeLoading()
            this.loadingForm = false
          })
        }else{
          this.loadingForm = true
          getFormJson(id, version, formType).then(res => {
            console.log('load from json:', id, ' ', version, ' ', formType)
            if(res.data.code === 0){
              let data = res.data.data
              let json
              if((typeof data.json) ==='string'){
                json = JSON.parse(data.json)
              }else{
                json = data.json
              }
              this.options = json
              this.ruleForm.category = data.category
              this.ruleForm.name = data.surveyName.trim()
              this.formFieldTemplate.category = data.fieldTempCtg
              if(data.fieldTempCtg) {
                this.$refs.form.tempDict = this.formFieldTemplate.category
              }
            }else{
              this.$message.error(res.data.msg)
            }
          }).then(() => {
            this.$nextTick(() => {
              this.$refs.form.closeLoading()
              this.loadingForm = false
            })
          }).catch(() => {
            this.$refs.form.closeLoading()
            this.loadingForm = false
          })
        }
      }
    }
  }
</script>

<style scoped>
  .back-button {
    padding-bottom: 10px;
    color: #00bfbf;
    cursor: pointer;
  }
</style>
