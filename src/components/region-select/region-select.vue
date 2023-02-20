<template>
  <div>
    <el-row>
      <el-col :span="10">
          <el-input :disabled="disabled" placeholder="请选择地址" v-model="value.name" readonly @focus="handleSelectAddress" clearable class="fixed-clearable-icon">
          <div slot="suffix">
            <el-button v-if="value.name && !disabled" type="text" icon="el-icon-circle-close" class="deleteButton"
                       @click.stop="handleSelectClear">
            </el-button>
          </div>
            <template slot="append" v-if="showAppend">
              <el-popover
                placement="right"
                width="530"
                @show="getFastAddress"
                trigger="hover">
                <el-table :data="fastAddressArray" max-height="400">
                  <el-table-column width="450" property="fullAddress" label="地址"></el-table-column>
                  <el-table-column width="50" label="操作">
                    <template slot-scope="scope">
                      <el-button type="text" @click.stop="setData(scope.row)">选择</el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <el-button icon="el-icon-document-copy" slot="reference"></el-button>
              </el-popover>
            </template>
          </el-input>
      </el-col>
      <el-col :span="10" :offset="1">
        <el-input v-if="showDetailedAddress" placeholder="详细地址" v-model="value.detailedAddress" clearable
                  :maxlength="100" show-word-limit :disabled="disabled">
          <template slot="append">
            <el-button v-if="!audioStart && !disabled" @click="showAsrChange(true, true)" icon="el-icon-microphone"></el-button>
          </template>
        </el-input>
      </el-col>
    </el-row>
    <el-dialog :visible.sync="dialogVisible"
               title="选择地址"
               width="470px"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               append-to-body>
      <div class="content">
        <ul class="area-select">
          <li v-for="(item, index) in areaMain" :key="index" :class="{'hasSelect':index === hasSelectIndex}"
              @click="changeArea(index)"> {{ item }}
          </li>
        </ul>
        <ul class="address-select">
          <div v-show="hasSelectIndex === 0">
            <li v-for="(item, index) in province" :key="index" :class="{'select-li-provice': index === pSelectLiIndex}"
                @click="selectProvince(index)"> {{ item.name }}
            </li>
          </div>
          <div v-show="hasSelectIndex === 1">
            <li v-for="(item, index) in city" :key="index" :class="{'select-li-provice': index === cSelectLiIndex}"
                @click="selectCity(index)"> {{ item.name }}
            </li>
          </div>
          <div v-show="hasSelectIndex === 2">
            <li v-for="(item, index) in area" :key="index" :class="{'select-li-provice': index === aSelectLiIndex}"
                @click="selectArea(index)"> {{ item.name }}
            </li>
          </div>
          <div v-show="hasSelectIndex === 3">
            <li v-for="(item, index) in street" :key="index" :class="{'select-li-provice': index === sSelectLiIndex}"
                @click="selectStreet(index)"> {{ item.name }}
            </li>
          </div>
        </ul>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="commitHandle()" size="mini">确 定</el-button>
        <el-button @click="cancelHandle()" size="mini">取 消</el-button>
      </span>
    </el-dialog>
    <asr-start
      @close="showAsrChange(false, false)"
      v-if="showAsr"
      @onlyClose="showAsrChange(false, true)"
      @start="showAsrChange(true, false)">
    </asr-start>
  </div>
</template>

<script>
import {getProvince, getCity} from '@/api/sys/region'
import RecordRTC from "recordrtc"
import {uploadFile} from "@/api/oss"
import FileTypeConstant from "@/utils/FileTypeConstant"
import moment from "moment";
import {getSpeechText} from "@/api/survey-form/speech"
import AsrStart from "@/components/asr/AsrStart"
import { mapGetters } from 'vuex'

export default {
  name: 'AddressSelect',
  components: {
    AsrStart
  },
  props: {
    value: {
      type: Object,
      default: ()=> {return {}}
    },
    showDetailedAddress:{
      type: Boolean,
      default: false
    },
    requireCity: {
      //可以不选择市，默认要求选择
      type: Boolean,
      default: true
    },
    requireArea: {
      //可以不选择区，默认要求选择
      type: Boolean,
      default: true
    },
    requireStreet: {
      type: Boolean,
      default: true
    },
    showAppend: {
      type: Boolean,
      default: () => {
        return true
      }
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      areaMain: ['省', '市', '区','街道'],
      hasSelectIndex: 0, // 控制显示第几个
      province: [], // 循环的省份的值
      city: [], // 循环的城市的值
      area: [], // 循环的地区的值
      street: [], //循环的街道的值
      pid: '', // 省份id
      cid: '', // 城市id
      aid: '', // 地区id
      sid: '', // 街道id
      pSelectLiIndex: '', // 选中的省的下标
      cSelectLiIndex: '', // 选中的城市的下标
      aSelectLiIndex: '', // 选中的地区的下标
      sSelectLiIndex: '', // 选中的街道的下标
      addressDetail: [], // 传给父组件的地址名称
      addressId: [], // 传给父组件的地址id
      address: '',  // 选择结果显示内容
      dialogVisible: false,
      audioStart: false,
      audioEnd: true,
      showAsr: false,
      recorder: null,
      audioUploadResult: {
        surveyFormId: '',
        taskId: '',
        audioNum: 0,
        mediaInfos: [],
        data: {},
      },
      fastAddressArray: []
    }
  },
  watch: {
    value: function() {
        if(!this.validatenull(this.value)){
          if (this.value.name) {
            this.address = this.value.name;
            this.addressDetail = this.address.split("/");
          }
          if (!this.validatenull(this.value.ids)) {
            let name = ''
            this.addressId = this.value.ids;
            let length = this.value.ids.length
            //一定有省
            this.pid = this.value.ids[0];
            this.pSelectLiIndex = this.province.findIndex(item => {
              return item.id === this.pid;
            });
            name+=this.province[this.pSelectLiIndex].name
            switch(length){
              case 2:
                this.cid = this.value.ids[1];
                getCity(this.pid).then((res) => {
                  this.city = res.data.data;
                  this.cSelectLiIndex = this.city.findIndex(item =>{
                    return item.id === this.cid;
                  })
                  name+='/' + this.city[this.cSelectLiIndex].name
                  return getCity(this.cid);
                });
                break;
              case 3:
                this.cid = this.value.ids[1];
                this.aid = this.value.ids[2];
                getCity(this.pid).then((res) => {
                  this.city = res.data.data;
                  this.cSelectLiIndex = this.city.findIndex(item =>{
                    return item.id === this.cid;
                  })
                  name+='/' + this.city[this.cSelectLiIndex].name
                  return getCity(this.cid);
                }).then((res)=>{
                  this.area = res.data.data;
                  this.aSelectLiIndex = this.area.findIndex(item =>{
                    return item.id === this.aid;
                  })
                  name+='/' + this.area[this.aSelectLiIndex].name
                  return getCity(this.aid);
                });
                break;
              case 4:
                this.cid = this.value.ids[1];
                this.aid = this.value.ids[2];
                this.sid = this.value.ids[3];
                getCity(this.pid).then((res) => {
                  this.city = res.data.data;
                  this.cSelectLiIndex = this.city.findIndex(item =>{
                    return item.id === this.cid;
                  })
                  name+='/' + this.city[this.cSelectLiIndex].name
                  return getCity(this.cid);
                }).then((res)=>{
                  this.area = res.data.data;
                  this.aSelectLiIndex = this.area.findIndex(item =>{
                    return item.id === this.aid;
                  })
                  name+='/' + this.area[this.aSelectLiIndex].name
                  return getCity(this.aid);
                }).then((res)=>{
                  this.street = res.data.data;
                  this.sSelectLiIndex = this.street.findIndex(item =>{
                    return item.id === this.sid;
                  })
                  name+='/' + this.street[this.sSelectLiIndex].name
                  return getCity(this.sid);
                });
                break;
            }
            this.hasSelectIndex = 0;
            if(this.validatenull(this.value.name)){
              this.value.name = name
            }
          }
      }
    },
    'value.name': {
      handler (val, oldVal) {
        if(this.validatenull(val)){
          this.value.ids = null
          this.value.detailedAddress = null
          this.address = ''
          this.addressDetail = []
          this.addressId = []
        }
      }
    }
  },
  computed: {
    ...mapGetters(['getRegionSelectMap'])
  },
  mounted() {
    this.getAllProvince()
  },
  methods: {
    setData(row) {
      let data = Object.assign({}, row)
      this.$delete(data, 'fullAddress')
      this.$emit('changeValue', data)
    },
    getFastAddress() {
      let map = this.getRegionSelectMap
      let set = new Set()
      this.fastAddressArray = []
      map.forEach((item)=>{
        let obj = JSON.parse(item)
        if(!set.has(obj.fullAddress)){
          set.add(obj.fullAddress)
          this.fastAddressArray.push(obj)
        }
      })
      console.log(this.fastAddressArray)
    },
    validate() {
      if (this.pid === '') {
        this.$message.error("省级还未选择！");
        return false;
      } else if (this.requireCity && this.cid === '') {
        this.$message.error("市级还未选择！");
        return false;
      } else if (this.requireArea && this.aid === '') {
        this.$message.error("区级还未选择！");
        return false;
      }
      return true;
    },
    changeArea(index) {
      if (this.validate()) {
        this.hasSelectIndex = index;
      }
    },
    getAllProvince() {
      const key = 'province'
      let data = sessionStorage.getItem(key);
      if(data){
        this.province = JSON.parse(data)
      }else{
        // 获取省份列表
        getProvince().then((res) => {
          this.province = res.data.data
          sessionStorage.setItem(key, JSON.stringify(this.province))
        }).catch(() => {
        })
      }
    },
    // 选择省份执行的事件
    selectProvince(index) {
      this.addressDetail = []
      this.addressId = []
      this.pid = this.province[index].id
      this.pSelectLiIndex = index
      this.cSelectLiIndex = ''
      this.aSelectLiIndex = ''
      this.addressId[0] = this.province[index].id
      this.addressDetail[0] = this.province[index].name
      this.pSearchC();

      this.cid = ''
      this.aid = ''
      this.sid = ''
    },
    // 省份查找城市
    pSearchC() {
      getCity(this.pid).then((res) => {
        // 获取省份下城市的列表
        this.city = res.data.data
        this.hasSelectIndex = 1
        if (this.city.length === 1) {
          // 如果只有一条数据，则默认选中并执行下一次查找,其他位置同理
          this.hasSelectIndex = 2
          this.cSelectLiIndex = 0
          this.cid = this.city[0].id
          this.addressId.splice(1, this.addressId.length - 1)
          this.addressDetail.splice(1, this.addressId.length - 1)
          this.addressId[1] = this.city[0].id
          this.addressDetail[1] = this.city[0].name
          this.cSearchA()
        }
      }).catch(() => {
      })
    },
    // 选择市执行的事件
    selectCity(index) {
      this.cid = this.city[index].id
      this.cSelectLiIndex = index
      this.aSelectLiIndex = ''
      this.sSelectLiIndex = ''
      this.addressId.splice(index, this.addressId.length - 1)
      this.addressId[1] = this.city[index].id
      this.addressDetail.splice(1, this.addressDetail.length - 1)
      this.addressDetail[1] = this.city[index].name
      this.cSearchA()
    },
    // 市查找区
    cSearchA() {
      getCity(this.cid).then((res) => {
        // 获取城市下地区的列表
        this.area = res.data.data
        this.hasSelectIndex = 2
        if (this.area.length === 1) {
          this.hasSelectIndex = 3
          this.aSelectLiIndex = 0
          this.aid = this.area[0].id
          this.addressId.splice(2, this.addressId.length - 1)
          this.addressDetail.splice(2, this.addressId.length - 1)
          this.addressId[2] = this.area[0].id
          this.addressDetail[2] = this.area[0].name
        }
      }).catch(() => {
      })
    },
    // 选择区执行的事件
    selectArea(index) {
      this.aid = this.area[index].id
      this.aSelectLiIndex = index
      this.sSelectLiIndex = ''
      this.addressId.splice(2, this.addressId.length - 1)
      this.addressId[2] = this.area[index].id
      this.addressDetail.splice(2, this.addressId.length - 1)
      this.addressDetail[2] = this.area[index].name
      this.aSearchS()

    },
    // 区查找街道、县查找镇
    aSearchS() {
      getCity(this.aid).then((res) => {
        // 获取区县下街道镇的列表
        this.street = res.data.data
        this.hasSelectIndex = 3
        if (this.street.length === 1) {
          this.hasSelectIndex = 4
          this.sSelectLiIndex = 0
          this.sid = this.street[0].id
          this.addressId.splice(3, this.addressId.length - 1)
          this.addressDetail.splice(3, this.addressId.length - 1)
          this.addressId[3] = this.street[0].id
          this.addressDetail[3] = this.street[0].name
        }
      }).catch(() => {
      })
    },
    // 选择街道执行的事件
    selectStreet(index) {
      this.sid = this.street[index].id
      this.sSelectLiIndex = index
      this.addressId.splice(3, this.addressId.length - 1)
      this.addressId[3] = this.street[index].id
      this.addressDetail.splice(3, this.addressId.length - 1)
      this.addressDetail[3] = this.street[index].name
    },
    handleSelectAddress() {
      this.dialogVisible = true
    },
    clearAddress() {
        console.log('clear addresss...........')
    },
    // 点击取消
    cancelHandle() {
      this.hasSelectIndex = 0;
      this.dialogVisible = false;
    },
    // 点击确定
    commitHandle() {
      this.address = this.addressDetail.join('/')
      if(this.address.indexOf('//') !== -1){
        this.$message.error("请选择省市区地址！")
        return
      }
      if(this.requireArea){
        if(this.addressDetail.length < 3){
          this.$message.error("请选择省市区地址！");
          return false;
        }
      }else{
        //区可以不填写
        if(this.requireCity){
          if(this.addressDetail.length < 2){
            this.$message.error("请选择省市地址！");
            return false;
          }
        }else{
          if(this.addressDetail.length < 1){
            this.$message.error("请选择省地址！");
            return false;
          }
        }
      }
      this.$emit('callback', this.addressId, this.addressDetail)
      this.value.name = this.address
      this.value.ids = this.addressId
      this.hasSelectIndex = 0;
      this.dialogVisible = false
    },
    handleSelectClear() {
      this.hasSelectIndex = 0, // 控制显示第几个
          this.pid = '', // 省份id
          this.cid = '', // 城市id
          this.aid = '', // 地区id
          this.sid = '', // 街道id
          this.pSelectLiIndex = '', // 选中的省的下标
          this.cSelectLiIndex = '', // 选中的城市的下标
          this.aSelectLiIndex = '', // 选中的地区的下标
          this.sSelectLiIndex = '', // 选中的街道的下标
          this.addressDetail = [], // 传给父组件的地址名称
          this.addressId = [], // 传给父组件的地址id
          this.address = '' // 选择结果显示内容

      this.value.name = ''
      this.value.addressIds = []
    },
    // true ->  open,  false -> close.
    showAsrChange(openOrClose,onlyOpenOrClose) {
      // if (itemIndex) {
      //   this.currFormIndex = itemIndex
      // }
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
      navigator.mediaDevices.getUserMedia({audio: true, video: false}).then(function (camera) {
        callback(camera);
      }).catch((error) => {
        if(this.openMediaDevice) {
          this.$message.warning('请开启浏览器摄像头麦克风权限！')
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

      let fileName = 'speech'+ new Date().getTime() + '.webm'
      let file = new File([this.recorder.getBlob()], fileName, {
        type: 'video/webm;codecs=h264'
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
                // that.form[that.currFormIndex] += res.data.data
                let speechText = res.data.data ? res.data.data : ''
                that.value.detailedAddress = speechText
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
<style scoped rel="stylesheet/scss" lang="scss">
.deleteButton {
  color: #C0C4CC;
}

.content {
  /*position: absolute;*/
  z-index: 10;
  background: white;

  .area-select {
    width: 425px;
    height: 30px;
    margin: 0;
    padding: 0;
    border: 1px solid #CCCCCC;

    li {
      list-style: none;
      float: left;
      height: 28px;
      line-height: 28px;
      text-align: center;
      background: #f0f0f0;
      width: 25%;
      cursor: pointer;
    }

    .hasSelect {
      background: #FFFFFF;
    }
  }

  .address-select {
    width: 425px;
    margin: 0;
    padding: 5px 10px;
    overflow-y: scroll;
    overflow-x: scroll;
    height: 320px;
    border: 1px solid #CCCCCC;
    border-top: 0;

    li {
      height: 40px;
      padding: 10px 5px;
      line-height: 20px;
      cursor: pointer;
    }

    .select-li-provice {
      color: #1470cc;
      cursor: default;
      font-weight: bold;
      font-size: 17px;
    }

    li:hover {
      color: #968CFF;
    }
  }
}
</style>
