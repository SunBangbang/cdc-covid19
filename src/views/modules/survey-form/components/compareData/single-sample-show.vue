<template>
  <el-row justify="center" align="middle" type="flex" v-loading="loading" v-if="shouldShow">
    <el-col :span="2" v-if="!onlyRead">
      <el-checkbox v-model="isChecked" :disabled="sampleData.submitStatus === DRAFT_NAME || (sampleData.add !== MERGE_NAME && sampleData.auditStatus === AUDIT_NAME)" @change="checked"></el-checkbox>
    </el-col>
    <el-col :span="onlyRead ? 22 : 24">
      <el-row :class="clickedIndex === index ? 'copy-card-style-clicked': 'copy-card-style'" @click.native="selectedSample" v-points="1000">
        <el-row>
          <el-col :span="6">
            <el-avatar :src="src"></el-avatar>
            <slot name="header-tag"></slot>
          </el-col>
          <el-col :span="18">
            <el-row class="big-font">
              {{ sampleData.investigator | getUserRealName }}
            </el-row>
          </el-col>
        </el-row>
        <el-row style="float: right; position: relative; top: -0.15rem; margin-right:-12px;">
          <el-tag size="mini" v-if="sampleData.add !== MERGE_NAME" style="margin-right: 2px;"
                  :type="sampleData.auditStatus === '待审核' ? 'dark' : 'success'" effect="dark">
            {{ sampleData.auditStatus }}
          </el-tag>
          <el-tag  v-if="onlyRead" size="mini" :type="sampleData.submitStatus === DRAFT_NAME ? 'danger' : 'dark'" style="margin-right: 2px">
            {{ sampleData.submitStatus }}
          </el-tag>
          <el-tag size="mini" :type="sampleData.add === MERGE_NAME ? 'dark' : (fromAssist ? 'warning' : 'success')" effect="dark">
            {{ sampleData.add }}
          </el-tag>
        </el-row>
        <el-row class="left-audit-col-g" v-if="sampleData.add !== ASSIST_NAME">
          <el-col :span="12">音频数量：
            <span :style="{'color' : sampleData.audioNum === 0 ? 'gray' : '#01BFBF'}">{{ sampleData.audioNum }}</span>
          </el-col>
          <el-col :span="12">视频数量：
            <span :style="{'color' : sampleData.videoNum === 0 ? 'gray' : '#01bfbf'}">{{ sampleData.videoNum }}</span>
          </el-col>
          <el-col :span="12" >来源：{{ sampleData.source | getSource }}</el-col>
        </el-row>
        <el-row class="left-audit-col-g">
          <el-col>采集时间：{{ sampleData.add === MERGE_NAME ? sampleData.updateAt : sampleData.createAt}}</el-col>
        </el-row>
        <el-row>
        </el-row>
      </el-row>
      <el-row :class="clickedIndex === index ? 'left-audit-button-big-clicked' : 'left-audit-button-big'">
        <el-col :span="8">
          <el-button v-if="!fromAssist" type="text" :disabled="!canEdit"
                     v-points
                     :class="canEdit? '' :'text-color-disabled '"
                     icon="el-icon-edit"
                     class="left-audit-button-g" @click="edit">
              编辑
          </el-button>
          <el-button v-else type ="text" :disabled="true"
                     icon="el-icon-edit"
                     class="left-audit-button-g">
            编辑
          </el-button>
        </el-col>
        <el-col :span="8">
          <div :class="getLeftClass(sampleData.submitStatus === DRAFT_NAME)">
            <div :class="getRightClass(sampleData.submitStatus === DRAFT_NAME)">
              <el-button v-if="!fromAssist" type="text" style="color: #17B3A3;"
                         icon="el-icon-download"
                         :class="'left-audit-button-g'"
                         @click="downloadSample(sampleData.id)">
                  下载
              </el-button>
              <el-button v-else type ="text" :disabled="true"
                         icon="el-icon-download"
                         class="left-audit-button-g">
                下载
              </el-button>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <el-button v-if="!fromAssist && sampleData.add !== MERGE_NAME" type="text" :disabled="!canEdit" :class="canEdit? '' :'text-color-disabled '"
                     icon="el-icon-delete"
                     class="left-audit-button-g"
                     @click="deleteSample(sampleData.id)">
              删除
          </el-button>
          <el-button v-else type="text" :disabled="true"
                     icon="el-icon-delete"
                     class="left-audit-button-g">
              删除
          </el-button>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>

<script>
import {getUserList} from "@/api/user/user"
import {getDictLabel} from "@/utils"
import {deleteSample} from "@/api/survey-form/sample"
import Cookies from "js-cookie"
import {isEmpty} from "@antv/util"
import AppConstant from "@/utils/AppConstant"

export default {
  props: {
    sampleData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    surveyFormId: {
      type: String,
      required: true,
    },
    taskId: {
      type: String,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    onlyRead: {
      type: Boolean,
      required: true,
    },
    isGroupLeader: {
      type: Boolean,
      required: true,
    },
    clickedIndex: {
      required: true,
    }
  },
  name: "single-sample-show",
  data() {
    return {
      MERGE_NAME: AppConstant.MERGE_NAME,
      DRAFT_NAME: AppConstant.DRAFT_NAME,
      ASSIST_NAME: AppConstant.ASSIST_NAME,
      AUDIT_NAME: AppConstant.AUDIT_NAME,
      isChecked: false,
      disabled: !(this.sampleData.submitStatus === AppConstant.DRAFT_NAME || (this.sampleData.add !== AppConstant.MERGE_NAME && this.sampleData.auditStatus === AppConstant.AUDIT_NAME)),
      //来自协查填写样本
      fromAssist: this.sampleData.add === AppConstant.ASSIST_NAME,
      loading: false,
      src: AppConstant.DEFAULT_HEAD_IMG
    }
  },
  computed: {
    canEdit() {
      if (this.isGroupLeader) {
        return (this.sampleData.submitStatus === AppConstant.DRAFT_NAME|| this.sampleData.add === AppConstant.MERGE_NAME)
                && this.onlyRead
      } else {
        return this.sampleData.submitStatus === AppConstant.DRAFT_NAME && this.onlyRead
      }
    },
    shouldShow() {
      // 不限制合并类型则再次合并已经合并的样本
    // && this.sampleData.add !== AppConstant.MERGE_NAME
      return !this.onlyRead ? (this.sampleData.submitStatus !== AppConstant.DRAFT_NAME && (this.sampleData.add === AppConstant.MERGE_NAME || this.sampleData.auditStatus !== AppConstant.AUDIT_NAME)) : true
    }
  },
  created() {
    this.src = this.sampleData.investHeadUrl
    if(this.validatenull(this.src)){
      this.getUserHeadUrl(this.sampleData.investUserName)
    }
  },
  mounted() {
    if (this.index === 0) {
      this.selectedSample()
    }
  },
  methods: {
    selectedSample() {
      this.$emit("callBack", [this.sampleData, this.index])
    },
    checked() {
      this.$emit("checked", {isChecked: this.isChecked, sid: this.sampleData.id, fromAssist: this.fromAssist})
    },
    edit() {
      this.$emit("edit", [this.sampleData, this.index])
    },
    getLeftClass(value) {
      if (value) {
        return 'border-left'
      } else {
        return ''
      }
    },
    getRightClass(value) {
      if (value) {
        return 'border-right'
      } else {
        return 'middle-button-full '
      }
    },
    deleteSample(id) {
      this.$confirm("确定删除该样本?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "btn-custom-cancel",
        type: "warning"
      }).then(() => {
        //删除样本
        let params = {}
        params.surveyFormId = this.surveyFormId
        params.taskId = this.taskId
        params.sampleId = id
        this.loading = true
        deleteSample(params).then(res => {
          if (res.data.code === 0) {
            this.$message.success("操作成功！")
            this.$emit("remove", this.index)
            this.loading = false
          } else {
            this.loading = false
            return this.$message.error(res.data.msg)
          }
        })
      }).catch(cancel => {
        console.log(cancel)
      })
    },
    downloadSample(id) {
      console.log(id);
      this.$confirm("确定下载样本?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "btn-custom-cancel",
        type: "warning"
      }).then(() => {
        let access_token = Cookies.get('access_token')
        let json = {id: id, surveyFormId: this.surveyFormId}
        let params = Object.keys(json).map(function (key) {
          return encodeURIComponent(key) + "=" + encodeURIComponent(json[key]);
        }).join("&");
        let downloadUri = window.SITE_CONFIG['apiURL'] + '/survey/sample/download/doc' + '?' + params + `&access_token=${access_token}`
        window.location.href = downloadUri
      }).catch(() => {})
    },
    getUserHeadUrl(value) {
      console.log(value, "header")
      if (value) {
        let user = getUserList().filter(v => v.username === value)
        if (!isEmpty(user) && user[0].headUrl) {
          console.log(user, "header")
          this.src = user[0].headUrl
        } else {
          this.src = AppConstant.DEFAULT_HEAD_IMG
        }
      }
    },

  },
  filters: {
    getUserRealName(value) {
      if (!value) return ''
      else {
        let user = getUserList().filter(v => v.username === value)
        if (!isEmpty(user)) {
          return user[0].realName
        } else {
          return value
        }
      }
    },
    getSource(value) {
      if (!value) return ''
      else {
        return getDictLabel("sample-channel", value)
      }
    }
  }
}
</script>

<style scoped>
.copy-card-style {
  background: white;
  padding: 15px 15px;
  border: 1px solid #eaeaea;
  border-radius: 5px 5px 0 0;
}
.copy-card-style-clicked {
  background: rgba(23,179,163,.04);
  padding: 15px 15px;
  border: 1px solid #17B3A3;
  border-bottom: 1px solid #eaeaea;
  border-radius: 5px 5px 0 0;
}
.copy-card-style :hover {
  cursor: pointer;
}

.left-audit-button-g {
  width: 100%;
}

.left-audit-col-g {
  line-height: 20px;
}

.left-audit-button-big {
  border: 1px solid #eaeaea;
  border-radius: 0 0 5px 5px;
  border-top: unset;
  margin-bottom: 8px;
}
.left-audit-button-big-clicked {
  background: rgba(23,179,163,.04);
  border: 1px solid #17B3A3;
  border-radius: 0 0 5px 5px;
  border-top: unset;
  margin-bottom: 8px;
}
/*
样式在 method 中用到
*/
.middle-button {
  border-left: 1px solid #eaeaea;
  border-right: 1px solid #eaeaea;
}
/*
样式在 method 中用到
*/
.middle-button-full {
  border-left: unset;
  border-right: unset;
}
.big-font {
  font-size: 14px;
  width: 100%;
}
.border-right:after {
  content: '';
  position: absolute;
  top: 10px;
  height: 50%;
  width: 1px;
  background-color: #E7E7E7;
}
.border-left:after {
  content: '';
  position: absolute;
  top: 10px;
  height: 50%;
  width: 1px;
  background-color: #E7E7E7;
}
.text-color-normal {
  color: #17B3A3;
}
.text-color-disabled {
  color: #999;
}
</style>
