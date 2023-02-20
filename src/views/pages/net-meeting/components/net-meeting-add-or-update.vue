<template>
    <el-form :model="meeting" :rules="rules" ref="netMeetingEdit" class="createConference">
        <div style="font-size: 20px;font-width: 700;margin-bottom: 30px">{{title}}</div>
        <el-form-item label="1、主题名称:" prop="name">
            <el-input v-model="meeting.name" placeholder="请输入主题名称" clearable :disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item label="2、开始时间:" class="is-required">
            <el-col :span="20"></el-col>
            <el-col :span="11">
                <el-form-item prop="beginDate">
                    <avue-date
                            :disabled="disabled"
                        v-model="meeting.beginDate"
                        format="yyyy-MM-dd"
                        value-format="yyyy-MM-dd"
                        placeholder="会议开始日期">
                    </avue-date>
                </el-form-item>
            </el-col>
          <el-col class="line" :span="2">-</el-col>
            <el-col :span="5">
                <el-form-item prop="beginTime">
                      <avue-time
                              :disabled="disabled"
                          v-model="meeting.beginTime"
                          format="HH:mm"
                          value-format="HH:mm:ss"
                          placeholder="会议开始时间">
                      </avue-time>
                  </el-form-item>
            </el-col>
        </el-form-item>
        <el-form-item label="3、结束时间:" class="is-required">
            <el-col :span="20"></el-col>
            <el-col :span="11">
                <el-form-item prop="overDate">
                    <avue-date
                            :disabled="disabled"
                        v-model="meeting.overDate"
                        format="yyyy-MM-dd"
                        value-format="yyyy-MM-dd"
                        placeholder="会议结束日期">
                    </avue-date>
                </el-form-item>
            </el-col>
            <el-col class="line" :span="2">-</el-col>
            <el-col :span="5">
                <el-form-item prop="overTime">
                    <avue-time
                            :disabled="disabled"
                        v-model="meeting.overTime"
                        format="HH:mm"
                        value-format="HH:mm:ss"
                        placeholder="会议结束时间">
                    </avue-time>
                </el-form-item>
            </el-col>
        </el-form-item>
        <!-- 会议人员-->
        <el-form-item label="4、选择会议参与人:" class="is-required"></el-form-item>
      <div style="margin-bottom: 15px" v-loading="loading">
        <el-transfer
          :titles="transferTitle"
          filterable
          :filter-method="filterMethod"
          filter-placeholder="请输入姓名或用户名"
          key="id"
          :props="tProps"
          v-model="toUserData"
          :data="fromUserData">
        </el-transfer>
      </div>
        <el-form-item label="5.允许提前进入:">
            <el-col :span="3" style="padding-top: 7px">
                <avue-switch v-model="beforeStart"></avue-switch>
            </el-col>
            <el-col :span="5"  style="padding-top: 7px">
                <el-form-item prop="aheadTime" v-if="beforeStart">
                    <avue-select v-model="meeting.aheadTime" placeholder="请选择" size="mini" style="width: 100px"
                                 :dic="options">
                    </avue-select>
                </el-form-item>
            </el-col>
        </el-form-item>
        <el-button type="primary" class="w-percent-100" @click="submit" v-if="show" :loading="loading">提交</el-button>
        <div class="cancel" @click="cancel">
            <div>取消</div>
        </div>
    </el-form>
</template>

<script>
  import {saveOrUpdate,getUserList,getById} from "@/api/meeting/meeting"
  import {getDictDataList} from '@/utils'
  import moment from "moment"
  import AppConstant from '@/utils/AppConstant'

  export default {
    inject: ['reload'],
    data() {
      return {
        loading: false,
        tProps: {
          key: 'id',
          // label: 'username'
          label: 'label'
        },
        title: '创建/修改视频会议',
        transferTitle: ['待选列表', '已选列表'],
        mode: "transfer",
        fromUserData: [],
        beforeStart: false,
        toUserData: [],
        userList: [],
        show: true,
        disabled: false,
        meeting: {
          memberList: [],
          status: 0,
          aheadTime:'',
          beginDate: moment(new Date()).format('YYYY-MM-DD'),
          overDate: moment(new Date()).format('YYYY-MM-DD')
        },
        options: [],
        rules: {
          name: [
            { required: true, message: '请输入主题名称', trigger: 'blur' }
          ],
          beginDate: [
            { required: true, message: '请选择会议开始日期', trigger: 'blur' }
          ],
          beginTime: [
            { required: true, message: '请选择会议开始时间', trigger: 'blur' }
          ],
          overDate: [
            { required: true, message: '请选择会议结束日期', trigger: 'blur' }
          ],
          overTime: [
            { required: true, message: '请选择会议结束时间', trigger: 'blur' }
          ],
          aheadTime: [
            { required: true, message: '请选择提前时间', trigger: 'change' }
          ]
        }
      }
    },
    methods: {
      addUser(fromData, toData) {
        this.fromUserData = fromData;
        this.toUserData = toData;
      },
      filterMethod(query, item) {
        if (item.realName.indexOf(query) > -1) {
          return item.realName.indexOf(query) > -1
        } else {
          return item.username.indexOf(query) > -1
        }
      },
      removeUser(fromData, toData) {
        this.fromUserData = fromData;
        this.toUserData = toData;
      },
      //将树形toUserData中的id提取到memberList中
      searchId(val) {
        val.forEach((item) => { //利用foreach循环遍历
          // console.log(item)
          // if (!item.isDept) {
            this.meeting.memberList[this.meeting.memberList.length] = item
          // }
          // if (item.children.length > 0) //判断chlidren是否有数据
          // {
          //   this.searchId(item.children);  //递归调用
          // }
        })
      },
      // 时间戳转换日期格式方法
      formatDate(value) {
        if (value == null) {
          return '';
        } else {
          let date = new Date(value);
          let y = date.getFullYear();// 年
          let MM = date.getMonth() + 1;// 月
          MM = MM < 10 ? ('0' + MM) : MM;
          let d = date.getDate();// 日
          d = d < 10 ? ('0' + d) : d;
          let h = date.getHours();// 时
          h = h < 10 ? ('0' + h) : h;
          let m = date.getMinutes();// 分
          m = m < 10 ? ('0' + m) : m;
          let s = date.getSeconds();// 秒
          s = s < 10 ? ('0' + s) : s;
          return y + '-' + MM + '-' + d + ' ' + h + ':' + m + ':' + s;
        }
      },
      //将当前创建用户添加到已选列表中
      modelData(val) {
        for (let i = 0; i < val.length; i++) {
          if (val[i].isOwner) {
            continue;
          }
          if (!val[i].isDept && !val[i].isOwner) {
            val.splice(i, 1);
            i--;
            continue;
          }
          if (val[i].children.length > 0) {
            this.modelData(val[i].children);  //递归调用
          }
        }
        for (let i = 0; i < val.length; i++) {
          if (val[i].children.length === 0 && !val[i].isOwner) {
            val.splice(i, 1);
            i--;
          }
        }
      },
      //将当前创建用户从待选列表中删除
      delUser(value) {
        for (let i = 0; i < value.length; i++) {
          if (value[i].isOwner) {
            value.splice(i, 1);
            i--;
            continue;
          }
          if (value[i].children && value[i].children.length === 0 && value[i].isDept) {
            value.splice(i, 1);
            i--;
            continue;
          }
          if (value[i].children &&value[i].children.length > 0) {
            this.delUser(value[i].children);  //递归调用
          }
        }
      },
      //过滤用户
      userChange(val) {
        getUserList().then(res => {
          this.reorganization(res.data.data)
          this.userFilter(val, this.userList)
        })
      },
      reorganization(val) {
        val.forEach(item => {
          this.userList.push(JSON.parse(JSON.stringify(item)))
          delete this.userList[this.userList.length-1].children
          delete this.userList[this.userList.length-1].isDept
          delete this.userList[this.userList.length-1].isOwner
          delete this.userList[this.userList.length-1].name
          delete this.userList[this.userList.length-1].pid
          if (item.children.length > 0) //判断children是否有数据
          {
            this.reorganization(item.children);  //递归调用
          }
        })
      },
      userFilter(val, data) {
        for (let i=0;i<val.length;i++) {
          if (val[i].children.length > 0) {
            this.userFilter(val[i].children, data);  //递归调用
          }
          if (val[i].children.length === 0 && val[i].isDept) {
            val.splice(i, 1);
            i--;
            continue;
          }
          for (let j=0;j<data.length;j++) {
            if (val[i].id === data[j].id) {
              break;
            }
            if (data.length - j === 1) {
              val.splice(i,1)
              i--;
              continue;
            }
          }
        }
      },
      enterCreate() {
        this.title = '创建视频会议'
        this.loading = true
        getUserList().then(res =>{
          if(res.data.code === 0){
            this.fromUserData = res.data.data;
            this.fromUserData.forEach(item=> item.label = item.realName + '(' + item.username + ')')
            let userId = this.$route.params.userId
            this.toUserData.push(userId)
            // this.toUserData = JSON.parse(JSON.stringify(this.fromUserData))
            // this.modelData(this.toUserData)
            // this.delUser(this.fromUserData)
          }else{
            console.error('err:', res.data.msg)
          }
          this.loading = false
        });
        this.options = getDictDataList('is-early-entry')
        if (this.options) {
          this.options.forEach(item => {
            item.label = item.dictLabel
            item.value = item.dictValue
          })
        }

          this.show = true
        this.$forceUpdate()
      },
      enterUpdate(row) {
        this.title = '修改视频会议'
        this.options = getDictDataList('is-early-entry')
        if (this.options) {
          this.options.forEach(item => {
            item.label = item.dictLabel
            item.value = item.dictValue
          })
        }
        getById(row.id).then(res =>{
            if(res.data.code === 0){
                this.meeting = res.data.data
                // console.log('net-meeting:',this.meeting.userData)
                this.toUserData = JSON.parse(this.meeting.userData)
                // this.userChange(this.toUserData)
                getUserList().then(res =>{
                  if(res.data.code === 0){
                    this.fromUserData = res.data.data;
                    this.fromUserData.forEach(item=> item.label = item.realName + '(' + item.username + ')')
                    //将当前创建用户从待选列表中删除
                    this.delUser(this.fromUserData)
                  }else{
                    console.error('err:', res.data.msg)
                  }
                });
                if (this.meeting.startTime) {
                    this.meeting.beginDate = this.meeting.startTime.split(' ')[0]
                    this.meeting.beginTime = this.meeting.startTime.split(' ')[1]
                }
                if (this.meeting.endTime) {
                    this.meeting.overDate = this.meeting.endTime.split(' ')[0]
                    this.meeting.overTime = this.meeting.endTime.split(' ')[1]
                }
                if (this.meeting.beforeTime) {
                    this.beforeStart = true;
                }

                if(this.meeting.status === AppConstant.MEETING_STATUS_COMPLETED
                    || this.meeting.status === AppConstant.MEETING_STATUS_WORKING) {
                    //进行中的 或 已经结束的会议不能再编辑
                    this.show = false
                    this.disabled = true
                }
            }else{
                console.error('err:', res.data.msg)
                this.$message.error('操作失败')
            }
        })
      },
      submit() {
        this.loading = true
        this.$refs['netMeetingEdit'].validate((valid) => {
          if (!valid) {
            this.loading = false
            return false
          } else {
            this.meeting.startTime = this.meeting.beginDate + ' ' + this.meeting.beginTime.substring(0, this.meeting.beginTime.lastIndexOf(':')) + ':00'
            this.meeting.endTime = this.meeting.overDate + ' ' + this.meeting.overTime.substring(0, this.meeting.overTime.lastIndexOf(':')) + ':00'
            if (!this.meeting.overDate&&this.meeting.overTime) {
              this.loading = false
              return this.$message.error('会议结束日期不能为空！')
            } else if (this.meeting.overDate &&!this.meeting.overTime) {
              this.loading = false
              return this.$message.error('会议结束时间不能为空！')
            } else if (!this.meeting.overDate&&!this.meeting.overTime) {
              this.meeting.endTime = ''
            }
            let startTime = new Date(this.meeting.startTime).getTime()
            let endTime = new Date(this.meeting.endTime).getTime()
            let currentTime = new Date().getTime()
            if (startTime < currentTime) {
              this.loading = false
              return this.$message.error('会议开始时间不能早于当前时间！')
            }
            if (endTime < currentTime) {
              this.loading = false
              return this.$message.error('会议结束时间不能早于当前时间！')
            }
            if (endTime < startTime) {
              this.loading = false
              return this.$message.error('会议结束时间不能早于开始时间！')
            }
            if(this.validatenull(this.toUserData)){
              this.loading = false
              return this.$message.error('请添加会议成员！')
            }
            this.meeting.memberList = [];
            this.searchId(this.toUserData)
            this.meeting.userData = JSON.stringify(this.toUserData)
            if (this.beforeStart) {
              let time = this.meeting.aheadTime * 60 * 1000
              let beforeTime = startTime - time
              this.meeting.beforeTime = this.formatDate(beforeTime)
            } else {
              this.meeting.beforeTime = ''
            }

            this.$confirm("确定提交数据?", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              cancelButtonClass: "btn-custom-cancel",
              type: "warning"
            }).then(() => {
              saveOrUpdate(this.meeting).then(res => {
                if (res.data.code === 0) {
                  this.loading = false
                  this.$message({
                    type: "success",
                    message: "操作成功!"
                  })
                } else {
                  this.loading = false
                  return this.$message.error(res.data.msg)
                }
                this.reload()
              })
            }).catch(cancel => {
              this.loading = false
              console.log(cancel)
            })
          }
        })
      },
      cancel() {
        this.$emit('back')
      }
    }
  }
</script>

<style scoped>
    .createConference .title {
        margin-bottom: 10px;
    }
    .cancel {
        cursor:pointer;
        display: flex;
        justify-content: space-around;
        color: red;
        font-size: 12px;
        margin-top: 20px;
    }
</style>
