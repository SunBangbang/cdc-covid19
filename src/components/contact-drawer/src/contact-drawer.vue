<template>

  <div class="drawer-container">

    <div class="drawer-body">

      <avue-tabs :option="tabsOption" @change="handleClickTab"></avue-tabs>

      <span v-if="tabsType.prop === 'conversation'">

        <div class="bar-right">

          <conversation-list @updateStatus="updateStatus" />

        </div>

      </span>

      <span v-else-if="tabsType.prop === 'contact'">

        <div class="tree-container">

          <!--                  <el-input v-model="username" size="mini" placeholder="输入用户名并按下回车发起快捷会话" clearable @keyup.enter.native="onSubmit"></el-input>-->

          <avue-tree
            class="avue-connector-tree"
            :option="treeOption"
            :data="contactList"
            :filter-node-method="filterNodeMethod"
          >

            <div class="el-tree-node__label" slot-scope="{ node, data }">

              <div v-if="data.leaf === false" class="tree-node__plain_content">
                 {{node.label}}
              </div>

              <div
                v-else
                class="tree-node__rich_content"
                @dblclick="tencentIM(node.label)"
              >

                <div style="width: 50px; float: left">

                  <avue-avatar size="large" :src="data.avart"></avue-avatar>

                </div>

                <div style="width: calc(100% - 50px);">

                  <div style="margin-bottom: 10px; font-weight: bold">
                     {{data.realName}}
                  </div>

                  <div class="tree-node__subtext">
                     {{data.phone.replace(/^(\d{3})\d{4}(\d+)/, "$1****$2")}}
                  </div>

                </div>

              </div>

            </div>

          </avue-tree>

        </div>

      </span>

      <span v-else-if="tabsType.prop === 'team'">

        <div class="bar-right">

          <group-list @updateStatus="updateStatus" />

        </div>

      </span>

    </div>

    <el-dialog
      class="IMDialog chat-box"
      width="45%"
      ref="imDialog"
      :before-close="handleClose"
      :visible.sync="chatDialogVisible"
      v-if="chatDialogVisible"
      v-dialogdrag
      :close-on-click-modal="false"
      top="10vh"
      append-to-body
    >

      <TencentIM />

    </el-dialog>

  </div>

</template>

<script>
import ConversationList from "../../conversation/conversation-list";
import GroupList from "../../group/group-list";
import TencentIM from "../../../tencentIM/index";
import { getContactList } from "@/api/contact/contact";

export default {
  name: "ContactDrawer",
  components: {
    TencentIM,
    ConversationList,
    GroupList
  },
  data() {
    return {
      username: "",
      defaultExpandAll: true,
      chatDialogVisible: false,
      contactList: [],
      expandedKeys: null,
      activeTab: "first",
      form: {},
      treeOption: {
        title: "通讯录",
        filter: true,
        menu: false,
        filterText: "输入姓名过滤",
        props: {
          labelText: "phone",
          label: "name",
          value: "id",
          children: "children",
          leaf: "leaf"
        },
        lazy: true,
        treeLoad: function(node, resolve) {
          // console.log('treeload:', node.level, ' ', node.data.id)
          if (node.level === 0) {
            getContactList(0).then(res => {
              return resolve(res.data.data);
            });
          } else {
            getContactList(node.data.id).then(res => {
              return resolve(res.data.data[0].children);
            });
          }
        }
      },
      tabsType: {},
      tabsOption: {
        column: [
          {
            icon: "el-icon-chat-dot-square",
            label: "消息",
            prop: "conversation"
          },
          {
            icon: "el-icon-s-custom",
            label: "通讯录",
            prop: "contact"
          },
          {
            icon: "el-icon-coin",
            label: "TOP500工作群组",
            prop: "team"
          }
        ]
      }
    };
  },
  computed: {
    dlgVisible: {
      get() {
        return this.$store.state.chatDialogVisible;
      },
      set(val) {}
    }
  },
  watch: {
    dlgVisible: {
      handler: function(val, oldVal) {
        this.chatDialogVisible = val;
      },
      immediate: true
    }
  },
  created() {
    this.tabsType = this.tabsOption.column[0];
    // this.getContactList()
  },
  methods: {
    updateStatus() {
      this.chatDialogVisible = true;
      this.$store.commit("updateChatDialog", true);
      this.$emit("updateStatus3", this.chatDialogVisible);
    },
    handleRefresh() {
      switch (this.tabsType) {
        case this.tabsOption.column[0]:
          this.tim.getConversationList().catch(error => {
            this.$store.commit("showMessage", {
              type: "error",
              message: error.message
            });
          });
          break;
        case this.tabsOption.column[2]:
          this.getGroupList();
          break;
      }
    },
    getGroupList() {
      this.tim
        .getGroupList()
        .then(({ data: groupList }) => {
          this.$store.dispatch("updateGroupList", groupList.groupList);
        })
        .catch(error => {
          this.$store.commit("showMessage", {
            type: "error",
            message: error.message
          });
        });
    },
    handleClose(done) {
      this.$store.commit("resetCurrentConversation");
      done();
    },
    onSubmit() {
      this.tencentIM(this.username);
      this.username = "";
    },
    tencentIM(username) {
      this.chatDialogVisible = true;
      this.$store.commit("updateChatDialog", true);
      this.$emit("updateStatus3", this.chatDialogVisible);
      if (username !== "@TIM#SYSTEM") {
        this.$store
          .dispatch("checkoutConversation", `C2C${username}`)
          .catch(() => {
            this.$store.commit("showMessage", {
              message: "没有找到该用户或该用户从未登录过",
              type: "warning"
            });
          });
      } else {
        this.$store.commit("showMessage", {
          message: "没有找到该用户",
          type: "warning"
        });
      }
    },
    handleClickTab(column) {
      this.tabsType = column;
      if (column == this.tabsOption.column[2]) {
        this.getGroupList();
      }
    },
    filterNodeMethod(value, data) {
      // console.log('filter :', value, '  ', data.name, ' ', data.realName)

      if (!value) return true;
      if (data.realName) {
        return data.realName.indexOf(value) !== -1;
      }
      if (data.name) {
        return data.name.indexOf(value) !== -1;
      }
      return false;
    }
  }
};
</script>

<style scoped lang="css">
:deep(.el-tree-node__label) {
  height: 0 !important;
}
:deep(.tree-node__plain_content) {
  line-height: 2px !important;
}

:deep(.el-tree-node__content) {
  padding-right: 15px;
}
:deep(.avue-connector-tree .el-scrollbar__wrap) {
  overflow: hidden;
}
</style>

<style scoped>
.drawer-container {
  background-color: #eeeeee;
}
.drawer-body {
  background: white;
  padding: 1px 1px 1px 5px;
}
.tree-container {
  height: calc(100vh - 240px);
  overflow-x: auto;
  overflow-y: auto;
}

.tree-container::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 5px;
  height: 5px;
}

.tree-container::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 5px;
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
  background: #cccccc;
}

.tree-container::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  background: #ededed;
}
.el-tree-node__content {
  height: 30px;
}
.tree-node__plain_content {
  font-size: small;
  color: #111111;
  height: 30px;
}
.tree-node__rich_content {
  width: 2.2rem;
  position: relative;
  top: -20px;
}
.tree-node__rich_content .tree-node__subtext {
  width: 200%;
  font-size: small;
  color: #a6a9ad;
}
.bar-right {
  height: calc(100vh - 240px);
  flex: 1 1 auto;
  width: 100%;
  min-width: 0;
  position: relative;
  background-color: #ffffff;
  overflow: auto;
}
.avue-tabs {
  padding: 5px 10px 0 10px !important;
}

.avue-connector-tree {
  display: inline-block;
  min-width: 98%;
}
</style>

