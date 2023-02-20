<template>
  <main :class="['aui-content', { 'aui-content--tabs': $route.meta.isTab }]">
    <!-- tab展示内容 -->
    <template v-if="$route.meta.isTab">
      <!--<el-dropdown class="aui-content&#45;&#45;tabs-tools">
        <i class="el-icon-arrow-down"></i>
        <el-dropdown-menu slot="dropdown" :show-timeout="0">
          <el-dropdown-item @click.native="tabRemoveHandle($store.state.contentTabsActiveName)">{{ $t('contentTabs.closeCurrent') }}</el-dropdown-item>
          <el-dropdown-item @click.native="tabsCloseOtherHandle()">{{ $t('contentTabs.closeOther') }}</el-dropdown-item>
          <el-dropdown-item @click.native="tabsCloseAllHandle()">{{ $t('contentTabs.closeAll') }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>-->

      <el-tabs
        type="card"
        v-model="$store.state.contentTabsActiveName"
        @tab-click="tabSelectedHandle"
        @tab-remove="tabRemoveHandle"
      >
        <!--关闭 右边X       :closable="item.name !== 'dashbord-dashbord'" -->
        <el-tab-pane
          v-for="item in $store.state.contentTabs"
          :key="item.name"
          :name="item.name"
          :label="item.title"
          :class="{ 'is-iframe': tabIsIframe(item.iframeURL) }"
        >
          <template v-if="item.name === 'dashbord-dashbord'">
            <svg
              slot="label"
              class="icon-svg aui-content--tabs-icon-nav"
              aria-hidden="true"
            >
              <use xlink:href="#icon-home"></use>
            </svg>
          </template>
          <iframe
            v-if="tabIsIframe(item.iframeURL)"
            :src="item.iframeURL"
            width="100%"
            height="100%"
            frameborder="0"
            scrolling="yes"
          ></iframe>
          <keep-alive v-else>
            <router-view
              v-if="item.name === $store.state.contentTabsActiveName"
            />
          </keep-alive>
        </el-tab-pane>
      </el-tabs>
      <span
        v-if="$store.state.contentTabsActiveName === 'dashbord-dashbord'"
        class="timer-view"
        >当前时间：{{ nowDate }}</span
      >
    </template>
    <!-- 其他方式, 展示内容 -->
    <template v-else>
      <keep-alive>
        <router-view v-if="!$route.meta.cancelKeepAlive" />
      </keep-alive>
      <router-view v-if="$route.meta.cancelKeepAlive" />
    </template>
  </main>
</template>

<script>
import { isURL } from "@/utils/validate";
import moment from "moment";

export default {
  data() {
    return {
      nowDate: null,
      nowtimer: "",
    };
  },
  mounted() {
    this.nowtimer = setInterval(this.gettime, 1000);
  },
  methods: {
    // tabs, 是否通过iframe展示
    tabIsIframe(url) {
      return isURL(url);
    },
    // tabs, 选中tab
    tabSelectedHandle(tabObj) {
      let tab = this.$store.state.contentTabs.find(
        (item) => item.name === tabObj.name
      );
      if (tab) {
        if (tab.menuId === "" && tab.name === "dashbord-dashbord") {
          let idxs = window.SITE_CONFIG["menuList"].filter(
            (d) => d.url === "dashbord/dashbord"
          );
          if (!this.validatenull(idxs)) {
            this.$store.state.sidebarMenuActiveName = idxs[0].id;
            tab.menuId = idxs[0].id;
          }
        }

        if (tab.name !== this.$router.currentRoute.name) {
          this.$router.push({
            name: tab.name,
            params: { ...tab.params },
            query: { ...tab.query },
          });
        }
      }
    },

    // tabs, 删除tab
    tabRemoveHandle(tabName) {
      if (tabName === "home") {
        return false;
      }
      this.$store.state.contentTabs = this.$store.state.contentTabs.filter(
        (item) => item.name !== tabName
      );
      if (this.$store.state.contentTabs.length <= 0) {
        this.$store.state.sidebarMenuActiveName =
          this.$store.state.contentTabsActiveName = "home";
        return false;
      }
      // 当前选中tab被删除
      if (tabName === this.$store.state.contentTabsActiveName) {
        let tab =
          this.$store.state.contentTabs[
            this.$store.state.contentTabs.length - 1
          ];
        this.$router.push({
          name: tab.name,
          params: { ...tab.params },
          query: { ...tab.query },
        });
      }
    },
    // tabs, 关闭其它
    tabsCloseOtherHandle() {
      this.$store.state.contentTabs = this.$store.state.contentTabs.filter(
        (item) => {
          return (
            item.name === "dashbord-dashbord" ||
            item.name === this.$store.state.contentTabsActiveName
          );
        }
      );
    },
    // tabs, 关闭全部
    tabsCloseAllHandle() {
      this.$store.state.contentTabs = this.$store.state.contentTabs.filter(
        (item) => item.name === "dashbord-dashbord"
      );
      this.$router.push({ name: "dashbord-dashbord" });
    },
    gettime() {
      this.nowDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    },
  },
};
</script>

<style scoped lang="scss">
.timer-view {
  position: absolute;
  right: 20px;
  z-index: 1500;
  top: 20px;
  font-size: 16px;
}
</style>
