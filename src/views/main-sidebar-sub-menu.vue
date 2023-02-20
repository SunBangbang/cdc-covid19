<template>
  <el-submenu v-if="menu.children && menu.children.length >= 1" :index="menu.id" :popper-append-to-body="false">
    <template slot="title">
      <svg class="icon-svg aui-sidebar__menu-icon" aria-hidden="true"><use :xlink:href="`#${menu.icon}`"></use></svg>
      <span>{{ menu.name }}</span>
    </template>
    <sub-menu v-for="item in menu.children" :key="item.id" :menu="item"></sub-menu>
  </el-submenu>
  <el-menu-item v-else :index="menu.id" @click="gotoRouteHandle(menu.id)"
                v-loading.fullscreen.lock="loadingFlag"
                element-loading-spinner="el-icon-loading"
                element-loading-text="加载中"
                element-loading-background="rgba(82,	176,	163, 0.2)">
    <svg class="icon-svg aui-sidebar__menu-icon" aria-hidden="true"><use :xlink:href="`#${menu.icon}`"></use></svg>
    <span>{{ menu.name }}</span>
  </el-menu-item>
</template>

<script>
import SubMenu from './main-sidebar-sub-menu'
export default {
  name: 'sub-menu',
  props: {
    menu: {
      type: Object,
      required: true
    }
  },
  data(){
    return{
      loadingFlag: false,
    }
  },
  components: {
    SubMenu
  },
  methods: {
    // 通过menuId与动态(菜单)路由进行匹配跳转至指定路由
    gotoRouteHandle (menuId) {
      sessionStorage.removeItem('tab')
      sessionStorage.removeItem('childrenTab')
      var route = window.SITE_CONFIG['dynamicMenuRoutes'].filter(item => item.meta.menuId === menuId)[0]
      if (route) {
        let existed = this.$store.state.contentTabs.find(item => item.name === route.name)
        if(!existed) {
          this.$router.push({ name: route.name })
        }else{
          this.$router.replace({ name: route.name })
        }
        this.$store.state.contentTabs = this.$store.state.contentTabs.filter(item => {
          return item.name === 'dashbord-dashbord' || item.name === route.name
        })
      }
    }
  }
}
</script>
