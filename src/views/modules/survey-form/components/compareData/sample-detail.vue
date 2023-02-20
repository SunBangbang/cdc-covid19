<template>
  <el-row>
    <!--    主要组件构成： 操作栏， 样本内容， 目录，其内不包含其它功能。  本组件包含各类弹窗。-->
    <button-group-bar :survey-form-id="surveyFormId"
                      ref="buttonGroup"
                      :file-id="fileId"
                      :is-merge="isMerge"
                      :word-url="wordUrl"
                      :core-url="coreUrl"
                      :base-url="baseUrl"
                      :task-id="taskId"
                      :sample-id="sampleId"
                      v-if="buttonShower"
                      :form-change-allow="formChangeAllow"
                      :media-infos="mediaInfos"
                      @changeWordData="changeWordData"
                      @refreshData="refreshData"
                      @changeMediaInfos="handleChangeMediaInfos"
                      @changeFullOrCoreForm="changeFullOrCoreForm"
                      v-on="$listeners"
                      :mode="mode"
                      :hide-button-group="hideButtonGroup">
    </button-group-bar>
    <el-row class="bar-gel"
            style="margin-top: 10px"
            v-if="!buttonShower && !hideButtonGroup"></el-row>
    <el-row :gutter="10">
      <el-col :span="18">
        <el-row :class="
            full
              ? 'right-sample-detail-full questionnaire-form'
              : 'right-sample-detail questionnaire-form'
          "
                v-loading="fullscreenLoading"
                id="tt">
          <json-to-form ref="jsonToForm"
                        v-if="jsonToFormVisible"
                        :disabled.sync="disabled"
                        :task-i-d="taskId"
                        @submit="submitForm"
                        :text="text"
                        @reject="handleReject"
                        @saveDraft="draftForm"
                        :isShowCoreForm="isShowCoreForm">
          </json-to-form>
        </el-row>
        <el-row>
          <up-bottom-slider :div-id="'tt'"
                            style="position: absolute; bottom: 5%"></up-bottom-slider>
        </el-row>
      </el-col>
      <el-col :span="6">
        <el-row :class="full ? 'right-sample-detail-full' : 'right-sample-detail'">
          <catalogue v-if="showCatalogue"
                     :catalogue="catalogue"></catalogue>
        </el-row>
      </el-col>
    </el-row>
  </el-row>
</template>

<script>
import ButtonGroupBar from '@/views/modules/survey-form/components/compareData/button-group-bar'
import Catalogue from '@/views/modules/survey-form/components/compareData/catalogue'
import {
  apiToken,
  auditSubmit,
  getSample,
  prepareForAudit,
  reject,
  saveAsDraft,
  submit
} from '@/api/survey-form/sample'
import { getFormJson } from '@/api/survey-form/questionnaire'
import AppConstant from '@/utils/AppConstant'
import JsonToForm from '@/components/form-design/form-json'
import UpBottomSlider from '@/components/slider/up-bottom-slider'
import { getLoginUserInfo } from '@/api/user/user'
import { isEmpty } from '@antv/util'
import { resolve } from 'path'
import form from '../../../../../store/modules/form'

export default {
  name: 'sample-detail',
  components: { JsonToForm, Catalogue, ButtonGroupBar, UpBottomSlider },
  props: {
    surveyFormId: {
      type: String,
      required: true
    },
    taskId: {
      type: String,
      default: () => {
        return ''
      }
    },
    sampleId: {
      type: String || null,
      default: () => {
        return null
      }
    },
    //审核样本
    auditData: {
      type: Object,
      default: () => {
        return { surveyIds: null, assistIds: null, mergeId: null }
      }
    },
    appId: {
      //协查申请ID
      type: String,
      default: () => {
        return null
      }
    },
    rpid: {
      //上报ID
      type: String,
      default: () => {
        return null
      }
    },
    type: {
      type: String,
      required: true
    },
    selectedIds: {
      type: Array,
      default: () => {
        return []
      }
    },
    full: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    formChangeAllow: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    hideButtonGroup: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    text: {
      type: String,
      default: () => {
        return null
      }
    }
  },
  data() {
    return {
      form: {},
      uuid: null,
      isMerge: false,
      wordUrl: null,
      coreUrl: null,
      baseUrl: null,
      formData: {},
      formJson: {
        //表单格式
        json: {}
      },
      fileId: null,
      data: {},
      mediaInfos: [],
      jsonToFormVisible: false,
      disabled: false,
      catalogue: {
        mainTitle: [],
        main: {
          params: ''
        }
      },
      showCatalogue: false,
      canEdit: false,
      mode: '',
      buttonShower: false,
      result: {
        surveyFormId: '',
        taskId: '',
        audioNum: 0,
        // audioUris: [],
        videoNum: 0,
        // videoUris: [],
        mediaInfos: [],
        data: {},
        investigator: '调查员',
        source: 'pc'
        /*participant: '姓名',
        sex: '性别',
        identity: '身份证',
        investigator: '调查员',
        source: '来源'*/
      },
      fullscreenLoading: false,
      loadingInstance: null,
      isShowCoreForm: true,
      nonDynaAudit: {},
      dynaAudit: {},
      sample: {}
    }
  },
  created() {
    this.initForm()
  },
  methods: {
    async initForm() {
      console.info(
        'init sample-detail, sampleId:',
        this.sampleId,
        'taskId:',
        this.taskId,
        'formId:',
        this.surveyFormId,
        'appId:',
        this.appId,
        'rpid:',
        this.rpid
      )
      // this.fullscreenLoading = true
      this.mode = this.type
      if (this.mode === 'write') this.mode = 'edit'
      this.loadApiToken()
      if (this.type === 'read') {
        this.canEdit = false
      } else if (this.type === 'audit') {
        this.canEdit = true
      } else {
        this.canEdit = true
      }
      if (this.type === 'write') {
        await this.getFormJson()
      } else if (this.type !== 'audit') {
        await this.getFormData()
      } else {
        await this.handleGetFormJson()
        await this.getUserInfo()
        await this.loadAuditData()
      }
      // this.fullscreenLoading = false
    },
    async submitForm(form) {
      console.log('submit form:', form, ' type:', this.type)
      this.fullscreenLoading = true
      if (this.type === 'audit') {
        await this.handleSubmit(form)
      } else if (this.type === 'write') {
        await this.writeSubmit(form)
      } else {
        await this.handlePreviewSubmit()
      }
      this.fullscreenLoading = false
    },
    draftForm(form) {
      console.log('draftForm', form)
      if (this.type === 'write') {
        this.writeSaveDraft(form)
      } else {
        this.saveDraft()
      }
    },
    /**
     * 普通查看 编辑 删除  start------
     */
    async getFormData(isCoreForm = true) {
      if (isEmpty(this.sampleId) || isEmpty(this.surveyFormId)) {
        console.error('sampleId is required.', this.sampleId, this.surveyFormId)
        return
      }
      this.buttonShower = false
      let res = await getSample(this.sampleId, this.surveyFormId)
      if (res.data.code === 0) {
        const data = this.prepareData(res)
        this.formData = data.sample
        if (res.data.data.tencentWordUrl) {
          this.wordUrl = res.data.data.tencentWordUrl // 在线文档
          this.baseUrl = this.wordUrl // 全量报告
        }
        console.log(res.data.data, 666666666)
        if (res.data.data.coreTencentWordUrl)
          this.coreUrl = res.data.data.coreTencentWordUrl // 核心报告
        if (res.data.data.fileID) this.fileId = res.data.data.fileID
        else if (res.data.data.coreFileID)
          this.fileId = res.data.data.coreFileID
        let me = data.sample.mediaInfos ? data.sample.mediaInfos : []
        this.mediaInfos = Object.assign([], me)
        this.data = data.data
        getFormJson(this.surveyFormId)
          .then((resp) => {
            if (resp.data.code === 0) {
              let data = resp.data.data
              if (typeof data.json === 'string') {
                data.json = JSON.parse(data.json)
              }
              this.formJson = data
            } else {
              this.$message.error(data.msg)
            }
          })
          .then(() => {
            this.jsonToFormVisible = true
            this.$nextTick(() => {
              this.buttonShower = true
              this.allowChange()
              this.$refs['jsonToForm'].taskId = this.taskId
              //审核合并样本，更新时只保留提交按钮
              if (this.formData.status === AppConstant.AUDIT_MERGE_STATUS) {
                this.formJson.json.emptyBtn = false
                this.formJson.json.saveDraftBtn = false
              }
              this.$refs['jsonToForm'].json = this.formJson.json
              this.$refs['jsonToForm'].form = this.data
              this.$refs['jsonToForm'].add = false
              this.$refs['jsonToForm'].visible = true
              this.$refs['jsonToForm'].init()
            })
            this.setCatalogue(isCoreForm)
          })
      } else {
        this.$message.error(res.data.msg)
      }
    },
    setCatalogue(isCoreForm = true) {
      this.catalogue = {
        mainTitle: []
      }
      let ix = 0
      this.catalogue['subTitle' + ix] = []
      if (isCoreForm) {
        this.formJson.json.column.forEach((item, index) => {
          if (index === 0) {
            this.catalogue.main = item
          } else if (
            item.type !== 'description' &&
            item.params &&
            item.coreItem
          ) {
            this.catalogue.mainTitle.push(item)
            ix += 1
            this.catalogue['subTitle' + ix] = []
          } else if (item.coreItem) {
            this.catalogue['subTitle' + ix].push(item)
          }
        })
      } else {
        this.formJson.json.column.forEach((item, index) => {
          if (index === 0) {
            this.catalogue.main = item
          } else if (item.type !== 'description' && item.params) {
            this.catalogue.mainTitle.push(item)
            ix += 1
            this.catalogue['subTitle' + ix] = []
          } else {
            this.catalogue['subTitle' + ix].push(item)
          }
        })
      }

      this.showCatalogue = true
      // this.loading = false;
    },
    async handlePreviewSubmit() {
      let videoStatus = this.$refs.buttonGroup
        ? this.$refs.buttonGroup.checkVideoStatus()
        : true
      if (videoStatus) {
        this.formData.oid = this.sampleId
        this.formData.surveyFormId = this.surveyFormId
        this.formData.data = this.data
        this.disabled = true
        this.formData.mediaInfos = this.mediaInfos
        let res = await submit(this.formData, this.uuid)
        if (res.data.code === 0) {
          this.$message.success('提交成功')
          console.log('after submit:', this.full, this.rpid)
          if (this.full) {
            this.$router.go(-1)
          }
          //关闭选项卡
          this.mode = 'read'
          this.buttonShower = false
          this.$nextTick(() => {
            this.buttonShower = true
          })
          this.$emit('reloadSampleListData')
        } else {
          this.loadApiToken()
          this.disabled = false
          console.log('error:', res.data.msg)
          this.$message.error({ message: res.data.msg, duration: 5000 })
        }
      }
    },
    saveDraft() {
      let videoStatus = this.$refs.buttonGroup
        ? this.$refs.buttonGroup.checkVideoStatus()
        : true
      if (videoStatus) {
        this.formData.oid = this.sampleId
        this.formData.mediaInfos = this.mediaInfos
        this.formData.surveyFormId = this.surveyFormId
        this.disabled = true
        this.formData.data = this.data
        console.log('this.formData:', this.formData)
        saveAsDraft(this.formData, this.uuid)
          .then((res) => {
            if (res.data.code === 0) {
              this.$message.success('保存成功')
              this.mode = 'read'
              this.$emit('reloadSampleListData')
              this.buttonShower = false
              //关闭选项卡
              // this.$store.state.contentTabs = this.$store.state.contentTabs.filter(item => item.name !== 'questionnaire-detail' && item.name !=='survey-sample');
              // this.$store.state.contentIsNeedRefresh = true
              this.$nextTick(() => {
                this.buttonShower = true
                //   this.$router.replace({name: 'survey-sample', params: {taskId: this.taskId, refresh: true}});
                //   this.$store.state.contentIsNeedRefresh = false
              })
            } else {
              this.loadApiToken()
              this.disabled = false
              this.$message.error(res.data.msg)
            }
          })
          .catch((error) => {
            this.loadApiToken()
            this.disabled = false
            this.$message.error(error)
          })
      }
    },
    changeWordData(val) {
      const { fileId, wordUrl, uploadType } = val
      if (uploadType == 1) {
        this.coreUrl = wordUrl
      } else {
        this.wordUrl = wordUrl
        this.baseUrl = this.wordUrl
      }
      this.fileId = fileId
      this.buttonShower = false
      this.$nextTick(() => {
        this.buttonShower = true
      })
    },
    async refreshData() {
      this.buttonShower = false
      await this.getFormData()
      this.$nextTick(() => {
        this.buttonShower = true
      })
    },
    handleChangeMediaInfos(medias) {
      this.mediaInfos = medias
    },
    //准备数据 将表单数据和配置数据分开
    prepareData(res) {
      delete res.data.data.createAt
      delete res.data.data.createBy
      delete res.data.data.deleted
      delete res.data.data.updateAt
      delete res.data.data.updateBy
      let data = {}
      let sample = {
        answerTime: res.data.data.answerTime,
        // "audioNum": res.data.data.audioNum,
        // "audioUris": res.data.data.audioUris,
        // "videoNum": res.data.data.videoNum,
        // "videoUris": res.data.data.videoUris,
        mediaInfos: res.data.data.mediaInfos,
        headUrl: res.data.data.headUrl,
        oid: res.data.data.oid,
        signUrl: res.data.data.signUrl,
        source: res.data.data.source,
        status: res.data.data.status,
        submitStatus: res.data.data.submitStatus,
        surveyFormId: res.data.data.surveyFormId,
        taskId: res.data.data.taskId,
        add: res.data.data.add
      }
      let sampleKeys = Object.keys(sample)
      Object.keys(res.data.data).forEach((key) => {
        if (!sampleKeys.includes(key)) {
          data[key] = res.data.data[key]
        }
      })
      //是否合并调查记录
      this.isMerge = sample.add
      return { data: data, sample: sample }
    },
    // 表单是否允许修改
    allowChange() {
      // 可编辑状态
      if (this.canEdit) {
        this.formJson.json.emptyBtn = true
        this.formJson.json.submitBtn = true
        this.formJson.json.saveDraftBtn = true
        this.disabled = false
      } else {
        this.formJson.json.emptyBtn = false
        this.formJson.json.submitBtn = false
        this.formJson.json.saveDraftBtn = false
        this.disabled = true
      }
    },
    loadApiToken() {
      apiToken().then((res) => {
        if (res.data.code === 0) {
          this.uuid = res.data.data
        }
      })
    },
    /**
     * 普通查看 编辑 删除  -------end
     */
    /**
     * 审核 start------
     */
    async getUserInfo() {
      let res = await getLoginUserInfo()
      this.result.investigator = res.data.data.realName
      this.$store.state.form.currentUser = res.data.data.realName
    },
    // 获取formJson
    async handleGetFormJson(isCoreForm = true) {
      this.buttonShower = true
      let res = await getFormJson(this.surveyFormId)
      if (res.data.code === 0) {
        let data = res.data.data
        if (typeof data.json === 'string') {
          res.data.data.json = JSON.parse(data.json)
        } else {
          res.data.data.json = data.json
        }
        this.formJson = res.data.data
        // 只有在填写样本的时候生效
        if (this.type === 'write') {
          this.formJson = data
          this.jsonToFormVisible = true
          this.$nextTick(() => {
            this.formJson.json.emptyBtn = true
            this.formJson.json.saveDraftBtn = true
            this.formJson.json.submitBtn = true
            this.formJson.json.rejectBtn = false
            this.$refs['jsonToForm'].taskId = this.result.taskId
            this.$refs['jsonToForm'].json = this.formJson.json
            this.$refs['jsonToForm'].init()
            this.$refs['jsonToForm'].visible = true
          })
        }
        this.setCatalogue(isCoreForm)
      }
      console.log('1. get form json.....')
    },
    async loadAuditData() {
      console.log('2. load audit data.....', this.appId, this.auditData)
      this.jsonToFormVisible = false
      let ids = ''
      this.selectedIds.forEach((item) => {
        ids = ids + item + ','
      })
      ids = ids.substring(0, ids.length - 1)
      if (ids.length > 0) {
        const req = {
          formId: this.surveyFormId,
          surveyIds: this.auditData.surveyIds,
          assistIds: this.auditData.assistIds
        }
        let res = await prepareForAudit(req)
        if (res.data.code === 0) {
          let result = res.data.data
          let data = result.sample
          delete data.id
          delete data.sampleNo
          delete data.no
          console.log('watch result:', result)
          // this.nonDynaAudit = result.nonDynaAudit;
          let tmpNonDynaAudit = result.nonDynaAudit
          for (let attr in tmpNonDynaAudit) {
            if (tmpNonDynaAudit[attr].change) {
              tmpNonDynaAudit[attr].isReviewedByTeamLeader = false
            }
          }
          this.nonDynaAudit = tmpNonDynaAudit
          this.dynaAudit = result.dynaAudit
          this.result.audioNum = data.audioNum
          this.result.videoNum = data.videoNum
          this.result.mediaInfos = data.mediaInfos
          this.mediaInfos = data.mediaInfos
          this.sample = data
          this.jsonToFormVisible = true
          this.$nextTick(() => {
            this.formJson.json.emptyBtn = false
            this.formJson.json.saveDraftBtn = false
            this.formJson.json.submitBtn = true
            this.formJson.json.rejectBtn = true
            this.$refs['jsonToForm'].taskId = this.taskId
            this.$refs['jsonToForm'].form = this.sample
            this.$refs['jsonToForm'].json = this.formJson.json
            this.$refs['jsonToForm'].add = false
            this.$refs['jsonToForm'].auditSample = {
              audit: true,
              nonDynaAudit: this.nonDynaAudit,
              dynaAudit: this.dynaAudit
            }
            this.$refs['jsonToForm'].init()
            this.$refs['jsonToForm'].visible = true
          })
        } else {
          console.error('err:', res.data.msg)
          this.$message.error('审核准备失败。')
        }
      }
    },
    async handleSubmit(form) {
      this.result.data = form
      this.result.taskId = this.taskId
      this.result.surveyFormId = this.surveyFormId
      this.result.source = 'pc'
      this.disabled = true
      this.result.aduit = 1
      this.result.surveyIds = this.auditData.surveyIds
      this.result.assistIds = this.auditData.assistIds
      this.result.mergeId = this.auditData.mergeId
      this.result.mediaInfos = this.mediaInfos

      let res = await auditSubmit(this.result)
      if (res.data.code === 0) {
        this.$message.success('审核成功')
        await this.$router.replace({
          name: 'survey-sample',
          params: { taskId: this.taskId, type: this.$route.params.type }
        })
        this.$emit('closeSampleDetail')
      } else {
        this.loadApiToken()
        this.disabled = false
        console.log('error:', res.data.msg)
        const errMsgList = res.data.msg.split('\n')
        this.$refs['jsonToForm'].popupError(errMsgList)
        // this.$message.error({message: res.data.msg, duration: 5000})
      }
    },
    handleReject() {
      const req = {
        formId: this.surveyFormId,
        surveyIds: this.auditData.surveyIds,
        assistIds: this.auditData.assistIds,
        mergeId: this.auditData.mergeId
      }
      if (
        isEmpty(req.formId) ||
        (isEmpty(req.surveyIds) && isEmpty(req.assistIds))
      ) {
        console.error('missing required params:', req)
        return
      }
      console.log('reject:', req)
      reject(req).then((res) => {
        if (res.data.code === 0) {
          this.$message.success('操作成功')
          this.$emit('closeSampleDetail')
        } else {
          this.loadApiToken()
          this.disabled = false
          console.log('error:', res.data.msg)
          this.$message.error({ message: res.data.msg, duration: 5000 })
        }
      })
    },
    /**
     * 审核 -------end
     */
    /**
     * 填写时
     */
    async getFormJson(isCoreForm = true) {
      this.buttonShower = true
      let res = await getFormJson(this.surveyFormId)
      if (res.data.code === 0) {
        let data = res.data.data
        if (typeof data.json === 'string') {
          res.data.data.json = JSON.parse(data.json)
        } else {
          res.data.data.json = data.json
        }
        this.formJson = res.data.data
        this.formJson = data
        this.jsonToFormVisible = true
        this.$nextTick(() => {
          this.formJson.json.emptyBtn = true
          this.formJson.json.saveDraftBtn = true
          this.formJson.json.submitBtn = true
          this.formJson.json.rejectBtn = false
          this.$refs['jsonToForm'].taskId = this.result.taskId
          this.$refs['jsonToForm'].json = this.formJson.json
          this.$refs['jsonToForm'].form = this.form
          this.$refs['jsonToForm'].init()
          this.$refs['jsonToForm'].visible = true
        })
        this.setCatalogue(isCoreForm)
      }
      console.log('1. get form json.....')
    },
    // 保存草稿
    writeSaveDraft(form) {
      let videoStatus = this.$refs.buttonGroup
        ? this.$refs.buttonGroup.checkVideoStatus()
        : true
      if (videoStatus) {
        // console.log("form:", form);
        this.result.data = form
        this.result.surveyFormId = this.surveyFormId
        this.result.taskId = this.taskId
        this.result.mediaInfos = this.mediaInfos
        this.disabled = true
        // console.log("this.result:", this.result);
        saveAsDraft(this.result, this.uuid)
          .then((res) => {
            if (res.data.code === 0) {
              this.$message.success('保存成功')
              this.$refs['jsonToForm'].clearForm()
              this.$router.replace({
                name: 'survey-sample',
                params: { taskId: this.taskId, type: this.$route.params.type }
              })
            } else {
              this.$message.error(res.data.msg)
              this.$message.error({ message: res.data.msg, duration: 5000 })
            }
          })
          .catch((error) => {
            this.loadApiToken()
            this.disabled = false
            console.log('error:', error)
          })
      }
    },
    // 提交
    async writeSubmit(form) {
      let videoStatus = this.$refs.buttonGroup
        ? this.$refs.buttonGroup.checkVideoStatus()
        : true
      if (videoStatus) {
        this.result.data = form
        this.result.source = 'pc'
        this.result.surveyFormId = this.surveyFormId
        this.result.taskId = this.taskId
        this.result.mediaInfos = this.mediaInfos
        console.log(this.result)
        // if(this.fillSignDialogVisible){
        //   this.$nextTick(() => {
        //     this.$refs['fillQuestionnaireSignDialog'].dialogVisible = true
        //     this.$refs['fillQuestionnaireSignDialog'].result = this.result
        //     this.$refs['fillQuestionnaireSignDialog'].taskId = this.$route.params.taskId
        //     if(this.video){
        //       this.$refs['fillQuestionnaireSignDialog'].audioOpen = this.audioEnd
        //       this.$refs['fillQuestionnaireSignDialog'].videoOpen = this.videoEnd
        //     }
        //   })
        // } else {

        // if(this.videoVisible && this.result.mediaInfos.length === 0){
        //     this.$message.warning('请提交音频或视频！')
        //     return
        // }
        this.disabled = true
        let res = await submit(this.result, this.uuid)
        if (res.data.code === 0) {
          this.$message.success('提交成功')
          await this.$router.replace({
            name: 'survey-sample',
            params: { taskId: this.taskId, type: this.$route.params.type }
          })
        } else {
          this.loadApiToken()
          this.disabled = false
          console.log('error:', res.data.msg)
          this.$message.error({ message: res.data.msg, duration: 5000 })
        }
      }
    },
    async changeFullOrCoreForm(val) {
      this.isShowCoreForm = val
      // console.log("$refs", this.$refs["jsonToForm"].form);
      if (this.type === 'write') {
        this.form = this.deepClone(this.$refs['jsonToForm'].form)
      } else if (this.type !== 'audit') {
        this.data = this.deepClone(this.$refs['jsonToForm'].form)
      } else {
        this.sample = this.deepClone(this.$refs['jsonToForm'].form)
        this.nonDynaAudit = this.deepClone(
          this.$refs['jsonToForm'].auditSample.nonDynaAudit
        )
      }

      this.jsonToFormVisible = false
      await this.sleep(500)
      this.jsonToFormVisible = true
      // console.log("=========", this.type);
      if (this.type === 'write') {
        // console.log("this.formJson", this.formJson);
        // console.log("changeFullOrCoreForm", this.form);
        this.buttonShower = true
        this.$nextTick(() => {
          this.formJson.json.emptyBtn = true
          this.formJson.json.saveDraftBtn = true
          this.formJson.json.submitBtn = true
          this.formJson.json.rejectBtn = false
          this.$refs['jsonToForm'].taskId = this.result.taskId
          this.$refs['jsonToForm'].json = this.formJson.json
          this.$refs['jsonToForm'].form = this.form
          this.$refs['jsonToForm'].add = false
          this.$refs['jsonToForm'].init()
          this.$refs['jsonToForm'].visible = true
        })
        this.setCatalogue(this.isShowCoreForm)
      } else if (this.type !== 'audit') {
        this.buttonShower = true
        this.$nextTick(() => {
          this.allowChange()
          this.$refs['jsonToForm'].taskId = this.taskId
          //审核合并样本，更新时只保留提交按钮
          if (this.formData.status === AppConstant.AUDIT_MERGE_STATUS) {
            this.formJson.json.emptyBtn = false
            this.formJson.json.saveDraftBtn = false
          }
          this.$refs['jsonToForm'].json = this.formJson.json
          this.$refs['jsonToForm'].form = this.data
          this.$refs['jsonToForm'].add = false
          this.$refs['jsonToForm'].init()
          this.$refs['jsonToForm'].visible = true
        })
        this.setCatalogue(this.isShowCoreForm)
      } else {
        this.$nextTick(() => {
          this.formJson.json.emptyBtn = false
          this.formJson.json.saveDraftBtn = false
          this.formJson.json.submitBtn = true
          this.formJson.json.rejectBtn = true
          this.$refs['jsonToForm'].taskId = this.taskId
          this.$refs['jsonToForm'].form = this.sample
          this.$refs['jsonToForm'].json = this.formJson.json
          this.$refs['jsonToForm'].add = false
          this.$refs['jsonToForm'].auditSample = {
            audit: true,
            nonDynaAudit: this.nonDynaAudit,
            dynaAudit: this.dynaAudit
          }
          this.$refs['jsonToForm'].init()
          this.$refs['jsonToForm'].visible = true
        })
        this.setCatalogue(this.isShowCoreForm)
      }
      this.$forceUpdate()
    },
    async sleep(timeout) {
      return new Promise((resolve) => {
        setTimeout(resolve, timeout)
      })
    }
  },
  filters: {
    truncate(str) {
      if (str && str.length > 15) {
        return str.substring(0, 15) + '...'
      } else {
        return str
      }
    }
  },
  watch: {
    languageSelected(newValue, oldValue) {
      console.log(this.$store.state.languageSelected, 'languageSelected')
      this.$store.commit('languageSelected', newValue)
    }
  },
  beforeDestroy() {
    this.$store.commit('regionSelectMap', null)
  }
}
</script>

<style scoped>
.right-sample-detail {
  height: calc(100vh - 275px);
  background: white;
  border-radius: 5px;
  margin-top: 10px;
}
.right-sample-detail-full {
  height: calc(100vh - 195px);
  background: white;
  border-radius: 5px;
  margin-top: 10px;
}
.questionnaire-form {
  width: 100%;
  overflow-y: auto;
  padding-bottom: 10%;
}
.bar-gel {
  width: 100%;
  height: 50px;
  background: white;
  padding: 10px;
  border-radius: 5px;
  line-height: 15px;
}
</style>
