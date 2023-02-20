<template>
  <div id="root">
    <!-- 登录页面 -->
    <div id="login-root">
      <!-- 登录卡片 -->
      <div id="login-card" class="card">
        <!-- 顶部三个蓝条 -->
        <div class="row-div" style="width: 100%; height: 10px">
          <div
            style="width: 190px; height: 100%; background-color: #006EFF"
          ></div>
          <div
            style="width: 160px; height: 100%; background-color: #00A4FF"
          ></div>
          <div
            style="width: 100px; height: 100%; background-color: #5AD5E0"
          ></div>
        </div>
        <!-- 腾讯云logo -->
        <div
          class="row-div"
          style="width: 100%; height: 100px; justify-content: center"
        >
          <!-- <img style="height: 23px" src="./img/logo.png" alt="">-->
          <div style="width: 9px"></div>
          <div
            style="width: 1px; height: 10px; background-color: #D8D8D8"
          ></div>
          <div style="width: 9px"></div>
          <div
            style="width: 86px; height: 23px; font-size: 18px; color: #333333"
          >
            视频通话
          </div>
        </div>
        <!-- 用户名 房间号 登录按钮-->
        <div class="col-div" style="width: 320px">
          <div
            class="form-group bmd-form-group is-filled"
            style="width: 100%; height: 80px"
          >
            <label for="userId" class="bmd-label-floating">用户名:</label>
            <input
              type="text"
              class="form-control"
              name="userId"
              id="userId"
              maxlength="18"
            />
          </div>
          <div
            class="form-group bmd-form-group is-filled"
            style="width: 100%; height: 80px"
          >
            <label for="roomId" class="bmd-label-floating">房间号:</label>
            <input
              type="text"
              class="form-control"
              name="roomId"
              id="roomId"
              maxlength="18"
            />
          </div>
          <div style="height: 24px"></div>
          <!-- 登录 -->
          <button
            id="login-btn"
            type="button"
            class="btn btn-raised btn-primary"
            style="width: 100%; height: 40px"
          >
            进入房间
            <div class="ripple-container"></div>
          </button>
          <!-- 摄像头 麦克风 -->
          <div
            class="row-div"
            style="width: 100%; height: 105px; justify-content: center"
          >
            <img
              id="camera"
              style="height: 27px"
              src="./img/camera.png"
              onClick="event.cancelBubble = true"
              data-toggle="popover"
              data-placement="top"
              title=""
              data-content=""
            />
            <!-- 选择摄像头 -->
            <div id="camera-option" style="display: none"></div>
            <div style="width: 100px"></div>
            <img
              id="microphone"
              style="height: 27px"
              src="./img/mic.png"
              onClick="event.cancelBubble = true"
              data-toggle="popover"
              data-placement="top"
              title=""
              data-content=""
            />
            <!-- 选择麦克风 -->
            <div id="mic-option" style="display: none"></div>
          </div>
        </div>
      </div>
    </div>
    <!-- 聊天室页面 -->
    <div id="room-root" class="col-div">
      <!-- header -->
      <div
        class="row-div card"
        style="width: 100%; height: 65px; justify-content: space-between"
      >
        <!-- 腾讯云logo -->
        <div
          class="row-div"
          style="height: 100%; width: 230px; justify-content: center"
        >
          <!-- <img style="height: 23px" src="./img/logo.png" alt="">
                    <div style="width: 9px"></div>
                    <div style="width: 1px; height: 10px; background-color: #D8D8D8"></div>
                    <div style="width: 9px"></div>-->
          <div
            style="width: 86px; height: 23px; font-size: 18px; color: #333333"
          >
            视频通话
          </div>
        </div>
        <!-- 分享屏幕 退出 按钮 -->
        <div class="row-div" style="height: 100%; width: auto;">
          <img
            id="screen-btn"
            style="width: 65px; height: 65px; cursor:pointer;"
            src="./img/screen-off.png"
            alt=""
            title="分享屏幕"
          />
          <div style="width: 20px"></div>
          <div @click="quitMeeting">
            <img
              id="logout-btn"
              style="width: 65px; height: 65px; cursor:pointer;"
              src="./img/logout.png"
              alt=""
              title="退出会议"
            />
          </div>
          <div style="width: 22px"></div>
          <div class="btnDiv" @click="exitEarly" v-if="isCreator">
            <span style="font-size: small;color: white">提前结束</span>
          </div>
        </div>
        <!-- 房间号 -->
        <div
          id="header-roomId"
          style="width: 230px; padding-right: 20px; font-size: 14px; color: #888888"
        >
          房间号: {{ roomId }}
        </div>
      </div>
      <!-- content -->
      <div class="row-div" style="height: 100%; width: 100%; padding: 10px">
        <div class="col-div" style="width: 340px; height: 100%; padding: 10px">
          <div class="col-div card" style="width: 100%; height: 100%">
            <!-- 成员列表 -->
            <div
              id="member-list"
              class="col-div"
              style="width: 100%; justify-content: flex-start; flex: 1"
            >
              <!-- member -->
              <div id="member-me" style="width: 100%; padding-left: 20px">
                <div
                  class="row-div member"
                  style="width: 100%; height: 50px; justify-content: space-between"
                >
                  <div class="member-id">{{ realName }}(我)</div>
                  <div
                    class="row-div"
                    style="width:100px; height: 27px; justify-content: center"
                  >
                    <img
                      class="member-video-btn"
                      style="height: 100%"
                      src="./img/camera-on.png"
                      alt=""
                    />
                    <div style="width: 18px"></div>
                    <img
                      class="member-audio-btn"
                      style="height: 100%"
                      src="./img/mic-on.png"
                      alt=""
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 视频网格 -->
        <div id="video-grid" style="height: 100%; flex: 1">
          <!-- 主视频 -->
          <div
            id="main-video"
            class="video-box col-div"
            style="justify-content: flex-end"
          >
            <!-- 主视频控制按钮 -->
            <div
              id="main-video-btns"
              class="row-div"
              style="width: 156px; position: absolute; z-index: 10; justify-content: center; align-self: flex-end"
            >
              <img
                id="video-btn"
                style="width: 68px; height: 68px; cursor:pointer"
                @click="videoSwitch"
                :src="videoIcon"
                alt=""
                :title="videoTitle"
              />
              <img
                id="mic-btn"
                style="width: 68px; height: 68px; cursor:pointer"
                @click="audioSwitch"
                :src="audioIcon"
                alt=""
                :title="audioTitle"
              />
            </div>
            <div id="mask_main" class="mask col-div">
              <!-- “摄像头未开启”遮罩 -->
              <div
                style="height: 100%; width: 100%; position: absolute; background-color: #D8D8D8"
              ></div>
              <img
                style="width: 63px; height: 69px; z-index: 10;"
                src="./img/camera-max.png"
                alt=""
              />
              <div style="height: 10px"></div>
              <div style="z-index: 10">摄像头未打开</div>
            </div>
          </div>
          <!-- 小视频 -->
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { exitRoom, getConfig } from "@/api/trtc/trtc";
import { getById, terminate } from "@/api/meeting/meeting";
import { getUserRealName } from "@/api/tencentIM/IM.js";

export default {
  name: "video-conference",
  data() {
    return {
      size: "mini",
      type: "danger",
      isCamOn: true,
      isCreator: false,
      roomId: "",
      userId: "",
      username: "",
      realName: "",
      sdkAppId: "",
      userSign: "",
      shareUserSign: "",
      isAudioOn: true,
      videoTitle: "关闭摄像头",
      audioTitle: "关闭麦克风",
      videoIcon: require("./img/big-camera-on.png"),
      audioIcon: require("./img/big-mic-on.png"),
      readDocLoginTimer: null,
    };
  },
  mounted() {
    this.roomId = this.$route.params.roomId;
    this.userId = this.$route.params.userId;
    this.username = this.$route.params.username;
    window.back = this.back;
    this.init();
    this.readDocLoginTimer = setInterval(() => {
      let val = localStorage.getItem("add-member");
      this.addMember(val)
    }, 2000);
  },
  beforeDestroy() {
    clearInterval(this.readDocLoginTimer);
  },
  methods: {
    init() {
      getById(this.$route.params.meetingId).then(res => {
        if (res.data.data.creator === this.$route.params.userId) {
          this.isCreator = true;
          this.$forceUpdate();
        }
      });
      getConfig().then(res => {
        this.sdkAppId = res.data.data.sdkAppId;
        this.userSign = res.data.data.userSign;
        this.shareUserSign = res.data.data.shareUserSign;
        this.realName = res.data.data.realName;
        let username = res.data.data.username;
        login(
          this.roomId,
          this.sdkAppId,
          username,
          this.userSign,
          this.shareUserSign
        );
      });
      //logout
      $("#logout-btn").on("click", () => {
        leave();
        this.$router.replace({
          path: `/net-meeting/${this.username}/${this.userId}/${this.realName}`
        });
      });
      //share screen or not
      $("#screen-btn").on(
        "click",
        throttle(() => {
          if (!TRTC.isScreenShareSupported()) {
            alert("当前浏览器不支持屏幕分享！");
            return;
          }
          if ($("#screen-btn").attr("src") == "./img/screen-on.png") {
            $("#screen-btn").attr("src", "./img/screen-off.png");
            stopSharing();
            isScreenOn = false;
          } else {
            $("#screen-btn").attr("src", "./img/screen-on.png");
            startSharing();
            isScreenOn = true;
          }
        }, 2000)
      );
      //switch main video
      $("#main-video").on("click", () => {
        let mainVideo = $(".video-box").first();
        if ($("#main-video").is(mainVideo)) {
          return;
        }
        //释放main-video grid-area
        mainVideo.css("grid-area", "auto/auto/auto/auto");
        exchangeView($("#main-video"), mainVideo);
        //将video-grid中第一个div设为main-video
        $(".video-box")
          .first()
          .css("grid-area", "1/1/3/4");
        //chromeM71以下会自动暂停，手动唤醒
        if (getBroswer().broswer == "Chrome" && getBroswer().version < "72") {
          rtc.resumeStreams();
        }
      });
    },
    addMember(val) {
      if(val) {
        getUserRealName(val).then(res => {
          if(res.data.code === 0) {
            let realName = res.data.data.realName
            $(`#${val}`).find('div.member-id').html(realName);
            localStorage.removeItem("add-member");
          }
        })
      }
    },
    //视频按钮开关
    videoSwitch() {
      if (this.isCamOn) {
        this.videoIcon = require("./img/big-camera-off.png");
        $("#member-me")
          .find(".member-video-btn")
          .attr("src", "./img/camera-off.png");
        this.videoTitle = "开启摄像头";
        this.isCamOn = false;
        muteVideo();
      } else {
        this.videoIcon = require("./img/big-camera-on.png");
        $("#member-me")
          .find(".member-video-btn")
          .attr("src", "./img/camera-on.png");
        this.videoTitle = "关闭摄像头";
        this.isCamOn = true;
        unmuteVideo();
      }
    },
    //音频按钮开关
    audioSwitch() {
      if (this.isAudioOn) {
        this.audioIcon = require("./img/big-mic-off.png");
        $("#member-me")
          .find(".member-audio-btn")
          .attr("src", "./img/mic-off.png");
        this.audioTitle = "开启麦克风";
        this.isAudioOn = false;
        muteAudio();
      } else {
        this.audioIcon = require("./img/big-mic-on.png");
        $("#member-me")
          .find(".member-audio-btn")
          .attr("src", "./img/mic-on.png");
        this.audioTitle = "关闭麦克风";
        this.isAudioOn = true;
        unmuteAudio();
      }
    },
    // 时间戳转换日期格式方法
    formatDate(value) {
      if (value == null) {
        return "";
      } else {
        let date = new Date(value);
        let y = date.getFullYear(); // 年
        let MM = date.getMonth() + 1; // 月
        MM = MM < 10 ? "0" + MM : MM;
        let d = date.getDate(); // 日
        d = d < 10 ? "0" + d : d;
        let h = date.getHours(); // 时
        h = h < 10 ? "0" + h : h;
        let m = date.getMinutes(); // 分
        m = m < 10 ? "0" + m : m;
        let s = date.getSeconds(); // 秒
        s = s < 10 ? "0" + s : s;
        return y + "-" + MM + "-" + d + " " + h + ":" + m + ":" + s;
      }
    },
    //退出会议，以后还可以再进入会议
    quitMeeting() {
      console.log("quit meeting........");
      this.audioSwitch();
      this.videoSwitch();
      leave();
      this.back();
    },
    //提前结束
    exitEarly() {
      this.$confirm("是否解散该会议?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "btn-custom-cancel",
        type: "warning"
      })
        .then(() => {
          let params = {
            sdkAppId: this.sdkAppId,
            roomId: this.roomId
          };
          terminate(this.$route.params.meetingId).then(response => {
            if (response.data.code !== 0) {
              return this.$message.error(response.data.msg);
            } else {
              leave();
              exitRoom(params).then(res => {
                if (res.data.code !== 0) {
                  return this.$message.error(res.data.msg);
                } else {
                  this.$message.success("操作成功！");
                }
              });
              this.$router.replace({
                path: `/net-meeting/${this.username}/${this.userId}/${this.realName}`
              });
            }
          });
        })
        .catch(() => {});
    },
    back() {
      this.$router.replace({
        path: `/net-meeting/${this.username}/${this.userId}/${this.realName}`
      });
    }
  }
};
</script>
<style src="./css/bootstrap-material-design.min.css" scoped></style>
<style src="./css/index.css" scoped></style>
<style src="./css/room.css" scoped></style>
<style scoped>
.member-id {
  font-size: large;
}
.btnDiv {
  height: 50%;
  width: 100px;
  background-color: #e50f0f;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}
</style>
