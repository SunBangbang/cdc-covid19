<template>
  <div>
  <!--  单选-->
  <div class="wrap-option" v-if="item.type === 'radio'">
    <el-radio-group v-model="form[item.prop]"
                    @change="handleChangeDisplay()"
                    @click.native="clickRadio"
                    :fill="item.fill"
                    :text-color="item.textColor"
                    :size="item.size">
      <el-radio v-for="(radio, index) in item.dicData"
                :key="'radio-' + index"
                :label="radio.value"
                :border="item.border"
                :size="item.size"
                class="mb8">
       {{ radio.label }}
      </el-radio>
    </el-radio-group>

  </div>

  <!--  多选-->
  <div class="wrap-option"  v-else-if="item.type === 'checkbox'">
    <el-checkbox-group v-model="form[item.prop]"
                       @change="handleChangeDisplay()"
                       :fill="item.fill"
                       :text-color="item.textColor"
                       :max="item.max"
                       :size="item.size">
      <template v-if="item.button && item.button === true" >
        <el-checkbox-button v-for="(radio, index) in item.dicData"
                            :key="'checkbox-' + index"
                            :label="radio.value"
                            :size="item.size">
          {{ radio.label }}
        </el-checkbox-button>
      </template>
      <template v-else>
        <el-checkbox v-for="(radio, index) in item.dicData"
                     :key="'checkbox-' + index"
                     :label="radio.value"
                     :border="item.border"
                     :size="item.size"
                     class="mb8">
          {{ radio.label }}
        </el-checkbox>
      </template>
    </el-checkbox-group>
  </div>

  <!--  输入框-->
  <div class="width-100" v-else-if="item.type === 'input'">
    <el-row :gutter="10">
      <el-col :span="22">
        <el-input v-model="form[item.prop]"
                  placeholder="请在此输入..."
                  :maxlength="item.maxlength? item.maxlength : 200"
                  :title="item.placeholder"
                  :show-word-limit="item.showWordLimit? item.showWordLimit : true"
                  @change="handleInputChange(form[item.prop])"
                  clearable>
          <template v-if="item.append" slot="append">{{ item.append }}</template>
          <template v-if="item.prepend" slot="prepend">{{ item.prepend }}</template>
          <template v-if="!item.append" slot="append">
            <el-button v-if="!audioStart" @click="showAsrChange(true, true, item.prop)" icon="el-icon-microphone"></el-button>
          </template>
        </el-input>
      </el-col>

      <el-col :span="2">
<!--        <el-button v-if="audioStart" @click="stopAudio" type="success" icon="el-icon-microphone"  size="mini">停止</el-button>-->
      </el-col>
    </el-row>
  </div>

  <!--  密码框 -->
  <div class="width-100" v-else-if="item.type === 'password'">
    <el-input v-model="form[item.prop]"
              :placeholder="item.placeholder"
              :maxlength="item.maxlength? item.maxlength : 30"
              :show-word-limit="item.showWordLimit? item.showWordLimit : true"
              clearable
              show-password>
    </el-input>
  </div>

  <!--  多行文本框-->
  <div class="width-100" v-else-if="item.type === 'textarea'">
    <el-row :gutter="10">
      <el-col :span="22">
        <el-input type="textarea"
              placeholder="请在此输入..."
              v-model="form[item.prop]"
              :title="item.placeholder"
              :maxlength="item.maxlength? item.maxlength : 500"
              :autosize="{ minRows: item.minRows, maxRows: item.maxRows}"
              :show-word-limit="item.showWordLimit? item.showWordLimit : true">
        </el-input>
      </el-col>
      <el-col :span="2">
        <el-button @click="showAsrChange(true, true, item.prop)" icon="el-icon-microphone"></el-button>
<!--        <el-button v-if="audioStart" @click="stopAudio" type="success" icon="el-icon-microphone">停止</el-button>-->
      </el-col>
    </el-row>
  </div>

  <!--  ASR 转多行文本框-->
  <div class="width-100" v-else-if="item.type === 'ASR'">
    <el-input type="textarea"
              :placeholder="item.placeholder"
              v-model="form[item.prop]">
    </el-input>
  </div>

  <!--  测温 转多行文本框-->
  <div class="width-100" v-else-if="item.type === 'measureTemperature'">
    <el-input-number style="width: 100%"
                     v-model="form[item.prop]"
                     :controls-position="item.controlsPosition"
                     :min="item.minRows"
                     :max="item.maxRows"
                     :step="item.step"
                     :precision="item.precision">
    </el-input-number>
  </div>

  <!--  数值-->
  <div class="width-100" v-else-if="item.type === 'number' ">
    <el-input-number style="width: 100%"
                     v-model="form[item.prop]"
                     :min="item.minRows"
                     :max="item.maxRows"
                     :step="item.step"
                     :precision="item.precision">
    </el-input-number>
  </div>

  <!--  下拉选择-->
  <div class="width-100" v-else-if="item.type === 'select' ">
    <!--   select-->
      <el-select style="width: 100%" v-if="item.dicType === 'static'"
                 v-model="form[item.prop]"
                 :size="item.size"
                 :placeholder="item.placeholder"
                 :clearable="item.clearable"
                 :filterable="item.filterable"
                 :multiple="item.multiple"
                 :multiple-limit="item.limit"
                 @change="handleChangeDisplay()">
        <el-option v-for="(dic, dicIndex) in item.dicData"
                   :key="'select-' + dicIndex"
                   :title="dic.label"
                   :label="dic.label"
                   :value="dic.value">
        </el-option>
      </el-select>
      <el-select v-else-if="item.dicType === 'remote'" style="width: 100%"
                 v-model="form[item.prop]"
                 :size="item.size"
                 :placeholder="item.placeholder"
                 :clearable="item.clearable"
                 @focus="getRemoteOptions(item.dicUrl)"
                 :multiple="item.multiple"
                 :multiple-limit="item.limit"
                 :filterable="item.filterable">
        <el-option v-for="(dic, dicIndex) in remoteSelectOptions"
                   :key="'select-' + dicIndex"
                   :title="dic.label"
                   :label="dic.dictLabel"
                   :value="dic.dictValue">
        </el-option>
      </el-select>
  </div>

  <!--  日期-->
  <div class="width-100" v-else-if="item.type === 'date' ">
    <el-date-picker style="width: 100%"
                    v-model="form[item.prop]"
                    type="date"
                    :picker-options="pickerOptions"
                    :placeholder="item.placeholder"
                    :format="item.format"
                    :value-format="item.valueFormat">
    </el-date-picker>
  </div>

  <!--  时间-->
  <div class="width-100" v-else-if="item.type === 'time' ">
    <el-time-picker style="width: 100%"
                    v-model="form[item.prop]"
                    :placeholder="item.placeholder"
                    :format="item.format"
                    :value-format="item.valueFormat">
    </el-time-picker>
  </div>

  <!--  日期 + 时间-->
  <div class="width-100" v-else-if="item.type === 'datetime' ">
    <el-date-picker style="width: 100%"
                    v-model="form[item.prop]"
                    type="datetime"
                    :placeholder="item.placeholder"
                    default-time="12:00:00"
                    :format="item.format"
                    :value-format="item.valueFormat">
    </el-date-picker>
  </div>

  <!--  日期范围-->
  <div class="width-100" v-else-if="item.type === 'daterange' ">
    <el-date-picker style="width: 100%"
                    v-model="form[item.prop]"
                    type="daterange"
                    range-separator="-"
                    :start-placeholder="item.startPlaceholder"
                    :end-placeholder="item.endPlaceholder"
                    :format="item.format"
                    :unlink-panels="item.unlinkPanels"
                    :value-format="item.valueFormat">
    </el-date-picker>
  </div>

  <!--  时间范围-->
  <div class="width-100" v-else-if="item.type === 'timerange' ">
    <el-time-picker style="width: 100%"
                    is-range
                    v-model="form[item.prop]"
                    range-separator="-"
                    :start-placeholder="item.startPlaceholder"
                    :end-placeholder="item.endPlaceholder"
                    :format="item.format"
                    :value-format="item.valueFormat">
    </el-time-picker>
  </div>

  <!--  日期 + 时间 范围-->
  <div class="width-100" v-else-if="item.type === 'datetimerange' ">
    <el-date-picker style="width: 100%"
                    v-model="form[item.prop]"
                    type="datetimerange"
                    range-separator="-"
                    :start-placeholder="item.startPlaceholder"
                    :end-placeholder="item.endPlaceholder"
                    :format="item.format"
                    :unlink-panels="item.unlinkPanels"
                    :value-format="item.valueFormat">
    </el-date-picker>
  </div>

  <!--  级联选择器 "-->
  <div class="width-100" v-else-if="item.type === 'cascader'">
    <el-cascader style="width: 100%"
                 v-model="form[item.prop]"
                 :options="item.dicData"
                 :separator="item.separator"
                 :placeholder="item.placeholder"
                 :clearable="item.clearable"
                 :filterable="item.filterable"
                 :show-all-levels="item.showAllLevels">
    </el-cascader>
  </div>

  <!--  地区选择器：自定义地图-->
  <div class="width-100" v-else-if="item.type === 'map' ">
    <map-select v-model="form[item.prop]"></map-select>
  </div>

  <!--  文件上传：自定义文件上传-->
  <div class="width-100" v-else-if="item.type === 'upload' ">
    <multi-upload v-model="form[item.prop]"
                  list-type="text"
                  :file-type="item.fileType"
                  :max-count="item.maxCount"
                  :modal="ptype !== 'form'"
                  tip=""
    ></multi-upload>
  </div>

  <!--  地址选择  -->
  <div class="width-100" v-else-if="item.type === 'regionSelect'">
    <region-select v-model="form[item.prop]"
                   @changeValue="changeSelectedRegion"
                   :show-detailed-address="item.showDetailedAddress">
    </region-select>
  </div>

  <!--  智能填写  -->
  <div class="width-100" v-else-if="item.type === 'autoFill'">
    <auto-fill @handleClick="handleClick">
    </auto-fill>
  </div>
    <asr-start
      @close="showAsrChange(false, false)"
      v-if="showAsr"
      @onlyClose="showAsrChange(false, true)"
      @start="showAsrChange(true, false)">
    </asr-start>
  </div>
</template>
<script>
  import MapSelect from '@/components/map/map-select'
  import MultiUpload from '@/components/upload/multiUpload'
  import regionSelect from '@/components/region-select/region-select'
  import AutoFill from "@/components/auto-fill"
  import {getDictDataList} from "@/utils"
  import createComponent from "./createComponent"
  import codeTableApis from "@/api/sys/CodeTable"
  import RecordRTC from "recordrtc"
  import {uploadFile} from "@/api/oss"
  import FileTypeConstant from "@/utils/FileTypeConstant"
  import moment from "moment"
  import {getSpeechText} from "@/api/survey-form/speech"
  import AsrStart from "@/components/asr/AsrStart"
  import {getAgeFromIdCard, getBirthdayFromIdCard, getSexFromIdCard} from '../utils'
  import {mapGetters} from 'vuex'

  export default {
  name: 'BaseFormItem',
  components: {
    AsrStart,
    AutoFill,
    MapSelect,
    MultiUpload,
    regionSelect,
  },
  props: {
    //本组件配置信息
    rangeDate:{
      type: Object,
      default: () => {
        return null
      }
    },
    item: {
      type: Object,
      default: () => {
        return {}
      }
    },
    //全局表单值
    form: {
      type: Object,
      default: () => {
        return {}
      }
    },
    //全局配置信息
    columns: {
      type: Array,
      default: () => {
        return []
      }
    },
    //是否是新增
    add: {
      type: Boolean,
      default: true
    },
    //父节点类型
    ptype: {
      type: String,
      default: 'normal'
    },
    //父节点属性
    pprop: {
      type: String,
      default: null
    },
    did: {
      type: String,
      default: null
    },
    relatedTable: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      remoteSelectOptions:[],//remoteSelect字典列表
      component:null,
      formData: this.form,

      //语音录制
      showAsr: false,
      audioStart: false,
      audioEnd: true,
      startTime: null,
      recorder: null,
      openMediaDevice: false, //浏览器是否开启摄像头麦克风权限
      userMedia: {audio: true, video: false},
      videoFormat: {
        mimeType: 'video/webm;codecs=h264',
        fileExtension: 'webm'
      },
      audioUploadResult: {
        surveyFormId: '',
        taskId: '',
        audioNum: 0,
        mediaInfos: [],
        data: {},
      },
      currFormIndex: ''
    }
  },
  created() {
    this.init()
    this.checkMediaDevice()
  },
  computed: {
    ...mapGetters(['getRegionSelectMap']),
    fieldVal() {
      return this.formData[this.item.prop]
    },
    pickerOptions() {
      return {
        disabledDate: (v) => {
          // 疫苗接种时间 固定字段, 新冠疫苗接种间隔最少是21天，但是moment的两个比较方法只比较之前或之后，+1天排除相同的日期，所以是22
          if (this.rangeDate && this.rangeDate.tag === 'vacTimes') {
            let start = this.rangeDate.start ? this.rangeDate.start[this.item.prop] : '2020-3-1'
            let end = this.rangeDate.end ? this.rangeDate.end[this.item.prop] : '9999-9-9'
            const mStart = start === '2020-3-1' ? start : moment(start).add(22,"days").format("YYYY-MM-DD")
            if (start === end) {
              return moment(v).isBefore(mStart, 'day')
            } else {
              const mEnd = end === '9999-9-9' ? end : moment(end).subtract(22, 'days').format("YYYY-MM-DD")
              // console.log('2020-3-1' < '9999-9-9', start, end, "ss")
              return (moment(v).isAfter(mEnd, 'day')) || (moment(v).isBefore(mStart, 'day'))
            }

          } else {
            return false
          }
        }
      }
    },
  },
  watch: {
    fieldVal: {
      //监控每个组件值的变化
      handler(val){
        // console.log('watch fieldVal:', this.item.prop, this.item.label, val)
        if(this.did && !this.validatenull(this.relatedTable)){
          //关联表格有relatedTable调用回调
          this.$emit('changeCallback', this.did, this.item.prop)
        }
        //监听证件类型
        if(this.item.type==='radio' || this.item.type==='select'){
          if(this.item.idCard && eval(this.item.idCard) && val){
            if(this.validatenull(this.did)){
              //由于显隐会触发刷新页面组件导致验证失效
              setTimeout(()=>{
                this.$emit("revalidateField", this.item.idNoProp)
              }, 500)
            }else{
              setTimeout(()=>{
                this.$emit("revalidateField", {prop: this.item.idNoProp, did: this.did})
              }, 500)
            }
          }
        }

        if(this.item.type==='radio'){
          if(this.item.sourceTag && this.item.sourceTag === true){
            // console.log('watch sourceTag:', this.item, this.component.label)
            this.$store.commit('saveDataSource', {label: this.component.label, item: this.item})
          }
        } else if (this.item.type === 'regionSelect') {
          // console.log('watch regionSelect :', val)
          this.setFastAddress(val)
        }
      },
      deep: true
    }
  },
  methods: {
    changeSelectedRegion(data) {
      this.form[this.item.prop] = data
    },
    init(){
      this.component = createComponent(this.item,this.form)
      if(!this.add){
        this.handleCascader()
      }
      let val = this.form[this.item.prop]
      if(this.validatenull(val)){
        // console.log('set default value.......')
        this.setDefaultValue()
      }
      this.getRemoteOptions(this.item.dicUrl)
      // 更新显隐状态
      this.handleChangeDisplay()
      //处理关系
      // this.handleRelation()
    },
    setFastAddress(val) {
      let str = ''
      if (val && (val.detailedAddress ||val.name)) {
        str += val.name ? val.name + (val.detailedAddress ? '，' : '。') : ''
        str += val.detailedAddress ? val.detailedAddress + '。' : ''
      }
      if (str) {
        let obj = Object.assign({}, val)
        obj.fullAddress = str
        this.$store.commit('regionSelectMap', {key: this.did? this.did : this.item.prop, value: JSON.stringify(obj)})
        this.$emit('newAddress', str)
      } else {
        this.getRegionSelectMap.delete(this.did? this.did : this.item.prop)
      }
    },
    handleCascader(){
      if (this.item.type === 'cascader') {
        let obj = this.form[this.item.prop]
        if (obj && obj instanceof Array) {
          this.form[this.item.prop] = obj.map(itm => {
            return itm instanceof Number ? itm : parseInt(itm)
          })
        }
      }
    },
    handleChangeDisplay(){
      // console.log('handleChangeDisplay.......', this.item)
      this.component.handleDisplay(this.columns)
    },
    /**
     * 点击单选框取消选中状态的处理
     * @param e 原生e
     * @param index
     */
    clickRadio(e, index) {
      // 因为原生click事件会执行两次，第一次在label标签上，第二次在input标签上，故此处理
      if (e.target.tagName === 'INPUT') {
        if(this.component.hasValue()){
          this.component.setDefaultValue(null)
          this.handleChangeDisplay()
        }
      }
    },
    /**
     * 智能填写 点击识别
     * 将智能填写组件填写的值解析后塞入业务属性中
     * @param data 解析后的数据
     */
    handleClick(data) {
      const _this = this;
      if (!data) {
        return;
      }
      //业务属性字典
      let tag = getDictDataList('form-tag-option');
      this.columns.forEach(column => {
        if (column.tag) {
          let t = tag.filter(item => {
            return item.dictValue === column.tag;
          });

          if (t && t.length === 1) {
            setForm(t[0].dictLabel, column.prop, data);
          }
        }
      })

      function setForm(type, prop, data){
        switch (type) {
          case '姓名':
            _this.form[prop] = data.name === undefined ? _this.form[prop] : data.name;
            break;
          case '年龄':
            _this.form[prop] = data.age === undefined ? _this.form[prop] : data.age;
            break;
          case '住址':
            _this.form[prop] = data.location === undefined ? _this.form[prop] : data.location;
            break;
          case '证件号':
            _this.form[prop] = data.IDNumber === undefined ? _this.form[prop] : data.IDNumber;
            break;
          case '性别':
            _this.form[prop] = data.sex === undefined ? _this.form[prop] : data.sex;
            break;
          case '联系电话':
            _this.form[prop] = data.mobile === undefined ? _this.form[prop] : data.mobile;
            break;
        }
      }
    },
    /**
     * 输入框值改变后的智能填写，针对一些字段的特殊处理
     * 例如输入身份证后自动填充生日、年龄、性别等
     */
    handleInputChange (v) {
      //先识别出身份证号
      let reg = /[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]/g;
      let match = v.match(reg);
      if(match && match.length === 1){
        let age = getAgeFromIdCard(v)
        this.form.age = age
        this.form.birthday= getBirthdayFromIdCard(v)
        this.form.sex = getSexFromIdCard(v) === '男'?'0':'1'
      }
    },
    //设置默认值
    setDefaultValue(){
      this.component.setDefaultValue(this)
    },
    // 获取remote select数据
    getRemoteOptions(url){
      if(this.remoteSelectOptions.length > 0 || url === undefined){
        return;
      }

      // 先拿缓存
      let data = sessionStorage.getItem(`remoteData-${url}`);
      if(data){
        this.remoteSelectOptions = JSON.parse(data);
        return;
      }
      codeTableApis.getByType(url).then(res =>{
        if(res.data.code === 0){
          this.remoteSelectOptions = res.data.data;
          sessionStorage.setItem(`remoteData-${url}`,JSON.stringify(this.remoteSelectOptions));
        }else{
          this.$message.error("下拉框获取远程数据失败")
        }
      })
    },
    checkMediaDevice(){
      navigator.mediaDevices.getUserMedia = navigator.mediaDevices.getUserMedia ||
          navigator.mediaDevices.webkitGetUserMedia ||
          navigator.mediaDevices.mozGetUserMedia ||
          navigator.mediaDevices.msGetUserMedia;

      if(navigator.mediaDevices.getUserMedia){
        //支持调取摄像头麦克风
        this.openMediaDevice = true
      } else {
        //不支持调取摄像头麦克风
        console.log('不支持调取摄像头麦克风')
      }
    },

    // true ->  open,  false -> close.
    showAsrChange(openOrClose,onlyOpenOrClose, itemIndex) {
      if (itemIndex) {
        this.currFormIndex = itemIndex
      }
      if (onlyOpenOrClose) {
        this.showAsr = openOrClose
      } else {
        if (openOrClose) {
          this.startAudio()
        } else {
          this.stopAudio()
        }
      }
    },
    // 音频开始
    startAudio() {
      this.audioStart = true
      this.audioEnd = false
      this.userMedia = {audio: true, video: false}
      this.videoFormat.fileExtension = 'webm'
      this.recorder = null
      this.$nextTick(() => {
        this.startRecording()
      })
    },
    // 音频停止
    stopAudio() {
      this.audioStart = false
      this.audioEnd = true
      this.recorder.stopRecording(this.stopRecordingCallback)
    },

    // 开始录制音频
    startRecording() {
      this.captureCamera((camera) => {
        this.recorder = RecordRTC(camera, {
          type: 'video',
          mimeType: 'video/webm;codecs=h264',
          sampleRate: 16000
        })
        this.startTime = new Date()
        this.recorder.startRecording()
        // release camera on stopRecording
        this.recorder.camera = camera
      })
    },
    // 录制
    captureCamera(callback) {
      navigator.mediaDevices.getUserMedia(this.userMedia).then(function (camera) {
        callback(camera);
      }).catch((error) => {
        if(this.openMediaDevice) {
          this.$message.warning('请开启浏览器摄像头麦克风权限！')
          // window.open('chrome://settings/content')
        }else{
          this.$message.warning("浏览器不支持摄像头麦克风设备！")
        }
      });
    },
    // 停止录制视频/音频回调
    stopRecordingCallback() {
      // 上传服务器
      this.upload()

      this.recorder.camera.stop()
      this.recorder.destroy()
      this.recorder = null
    },
    // 上传服务器
    upload() {
      let endTime = new Date()
      let duration = (endTime.getTime() - this.startTime.getTime()) /1000
      let createAt = this.startTime

      let fileName = 'speech'+ new Date().getTime() + '.' + this.videoFormat.fileExtension;
      let file = new File([this.recorder.getBlob()], fileName, {
        type: this.videoFormat.mimeType
      })
      let that = this
      uploadFile(file, FileTypeConstant.QUESTIONNAIRE_AUDIO).then(res => {
        if(res.data.code === 0){
          if (null != res.data.data && res.data.data.length > 0) {
            res.data.data.forEach(v => {
              let mediaInfo = {}
              mediaInfo.mediaUrl = v.url
              mediaInfo.fid = v.fid ? v.fid : null
              mediaInfo.duration = Math.floor(duration)
              mediaInfo.createAt = moment(createAt).format('YYYY-MM-DD HH:mm:ss')
              mediaInfo.name = v.name
              mediaInfo.type = 0
              this.audioUploadResult.mediaInfos.push(mediaInfo)
            })
            console.log(this.audioUploadResult.mediaInfos)
            let mediaUrl = this.audioUploadResult.mediaInfos[this.audioUploadResult.mediaInfos.length -1].mediaUrl
            let idx = mediaUrl.substring(0, mediaUrl.lastIndexOf('/')).lastIndexOf('/')
            let voiceFile = mediaUrl.substring(idx+1)
            //希望是如此，如： 19e0219c-1872-4b99-84e6-fe1b4be27d3a/speech1653529797573.wav
            getSpeechText(voiceFile, this.$store.state.languageSelected).then(res => {
              if(res.data.code === 0){
                if(that.form[that.currFormIndex] === null) {
                  that.form[that.currFormIndex] = res.data.data ? res.data.data : ''
                }else {
                  that.form[that.currFormIndex] += res.data.data ? res.data.data : ''
                }
                that.showAsrChange(false, true)
              }else{
                console.error('err:', res.data.msg)
              }
            })
          }
        }else{
          console.error('err:', res.data.msg)
        }
      })
    },
  }
}
</script>
<style scoped>
.width-100 {
  width: 90%;
}
.wrap-option {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  width: 100%;
}

.el-checkbox {
  color: #606266;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
  margin-right: 15px;
}

</style>
