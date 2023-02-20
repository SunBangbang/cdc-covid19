import Vue from "vue";
import Router from "vue-router";
import http from "@/utils/request";
import { isURL } from "@/utils/validate";
import viewsRouter from "@/router/views";

Vue.use(Router);

// 解决报错
const originalPush = Router.prototype.push;
const originalReplace = Router.prototype.replace;
// push
Router.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject)
    return originalPush.call(this, location, onResolve, onReject);
  return originalPush.call(this, location).catch(err => err);
};
// replace
Router.prototype.replace = function push(location, onResolve, onReject) {
  if (onResolve || onReject)
    return originalReplace.call(this, location, onResolve, onReject);
  return originalReplace.call(this, location).catch(err => err);
};

// 页面路由(独立页面)
export const pageRoutes = [
  {
    path: "/404",
    component: () => import("@/views/pages/404"),
    name: "404",
    meta: { title: "404未找到" },
    beforeEnter(to, from, next) {
      // 拦截处理特殊业务场景
      // 如果, 重定向路由包含__双下划线, 为临时添加路由
      if (/__.*/.test(to.redirectedFrom)) {
        return next(to.redirectedFrom.replace(/__.*/, ""));
      }
      next();
    }
  },
  {
    path: "/login",
    component: () => import("@/views/pages/login/login"),
    name: "login",
    meta: { title: "登录" }
  },
  {
    path: "/net-meeting/:username/:userId/:realName",
    name: "net-meeting-list",
    component: () => import("@/views/pages/net-meeting/net-meeting"),
    meta: {
      title: "视频会议主页",
      isTab: true
    }
  },
  {
    path: "/video-conference/call/:roomId/:username/:userId/:meetingId",
    name: "video-conference-call",
    // component:() => import ('@/views/pages/video-conference/components/video-conference'),
    component: () => import("@/views/pages/tencent-cloud/web/video-conference"),
    meta: {
      title: "视频会议",
      isTab: false
    }
  },
  {
    path: "/login-doc/:userId",
    name: "login-doc",
    component: () => import("@/views/pages/tencent-cloud/login-doc"),
    meta: {
      title: "登录腾讯文档",
      isTab: false
    }
  },
  {
    path: "/login-doc-success",
    name: "login-doc-success",
    component: () => import("@/views/pages/tencent-cloud/login-doc-success"),
    meta: {
      title: "成功登录腾讯文档",
      isTab: false
    }
  }
];

// 模块路由(基于主入口布局页面)
export const moduleRoutes = {
  path: "/",
  component: () => import("@/views/main"),
  name: "main",
  redirect: { name: "dashbord-dashbord" },
  meta: { title: "主入口布局" },
  children: [
    // {
    //   path: "/home",
    //   name: "home",
    //   redirect: { name: "dashbord-dashbord" }
    //   // component: () =>
    //   //     import ('@/views/modules/home'),
    //   // meta: { title: '首页', isTag: true }
    // },

    {
      path: "/dashbord/dashbord",
      component: () => import("@/views/modules/dashbord/index"),
      name: "dashbord-dashbord",
      meta: { title: "仪表盘", isTab: true }
    }
  ]
};

export function addDynamicRoute(routeParams, router) {
  // 组装路由名称, 并判断是否已添加, 如是: 则直接跳转
  var routeName = routeParams.routeName;
  var dynamicRoute = window.SITE_CONFIG["dynamicRoutes"].filter(
    item => item.name === routeName
  )[0];
  if (dynamicRoute) {
    return router.push({ name: routeName, params: routeParams.params });
  }
  // 否则: 添加并全局变量保存, 再跳转
  dynamicRoute = {
    path: routeName,
    component: () => import(`@/views/modules/${routeParams.path}`),
    name: routeName,
    meta: {
      ...window.SITE_CONFIG["contentTabDefault"],
      menuId: routeParams.menuId,
      title: `${routeParams.title}`
    }
  };
  router.addRoutes([
    {
      ...moduleRoutes,
      name: `main-dynamic__${dynamicRoute.name}`,
      children: [dynamicRoute]
    }
  ]);
  window.SITE_CONFIG["dynamicRoutes"].push(dynamicRoute);
  router.push({ name: dynamicRoute.name, params: routeParams.params });
}

const router = new Router({
  mode: "hash",
  scrollBehavior: () => ({ y: 0 }),
  routes: pageRoutes.concat(moduleRoutes, viewsRouter)
});

router.beforeEach((to, from, next) => {
  // 添加动态(菜单)路由
  // 已添加或者当前路由为页面路由, 可直接访问
  if (
    window.SITE_CONFIG["dynamicMenuRoutesHasAdded"] ||
    fnCurrentRouteIsPageRoute(to, pageRoutes)
  ) {
    return next();
  }

  // 获取菜单列表, 添加并全局变量保存
  //只获取当前用户所在部门用户
  http
    .get("/sys/menu/nav")
    .then(({ data: res }) => {
      if (res.code !== 0) {
        Vue.prototype.$message.error(res.msg);

        return next({ name: "login" });
      }
      window.SITE_CONFIG["menuList"] = res.data;
      fnAddDynamicMenuRoutes(window.SITE_CONFIG["menuList"]);
      next({ ...to, replace: true });
    })
    .catch(err => {
      console.log(err);
      next({ name: "login" });
    });

  // 获取用户名称, 添加并全局变量保存
  http
    .get("/sys/user/all")
    .then(({ data: res }) => {
      if (res.code !== 0) {
        return;
      }
      window.SITE_CONFIG["userList"] = res.data;
      //console.log("window.SITE_CONFIG['userList']:",window.SITE_CONFIG['userList']);
    })
    .catch(() => {});

  //获取配置参数
  http
    .get("/sys/params/page?limit=100&page=1")
    .then(({ data: res }) => {
      if (res.code !== 0) {
        return;
      }
      res.data.list.forEach(item => {
        if (item.paramCode === "upload-file-url") {
          window.SITE_CONFIG["uploadURL"] = item.paramValue;
        }
      });
    })
    .catch(() => {});
  // console.log('sys params: .........')
  // console.log(window.SITE_CONFIG['uploadURL'])
});

/**
 * 判断当前路由是否为页面路由
 * @param {route} route 当前路由
 * @param {pageRoutes} pageRoutes 页面路由
 * @return {false} false
 */
function fnCurrentRouteIsPageRoute(route, pageRoutes = []) {
  var temp = [];
  for (var i = 0; i < pageRoutes.length; i++) {
    if (route.path === pageRoutes[i].path) {
      return true;
    }
    if (pageRoutes[i].children && pageRoutes[i].children.length >= 1) {
      temp = temp.concat(pageRoutes[i].children);
    }
  }
  return temp.length >= 1 ? fnCurrentRouteIsPageRoute(route, temp) : false;
}

/**
 * 添加动态(菜单)路由
 * @param {menuList} menuList 菜单列表
 * @param {routes} routes 递归创建的动态(菜单)路由
 * @return {*}
 */
function fnAddDynamicMenuRoutes(menuList = [], routes = []) {
  var temp = [];
  for (var i = 0; i < menuList.length; i++) {
    if (menuList[i].children && menuList[i].children.length >= 1) {
      temp = temp.concat(menuList[i].children);
      continue;
    }
    // 组装路由
    var route = {
      path: "",
      component: null,
      name: "",
      meta: {
        ...window.SITE_CONFIG["contentTabDefault"],
        menuId: menuList[i].id,
        title: menuList[i].name
      }
    };
    // eslint-disable-next-line
    let URL = (menuList[i].url || "").replace(/{{([^}}]+)?}}/g, (s1, s2) =>
      eval(s2)
    ); // URL支持{{ window.xxx }}占位符变量
    if (isURL(URL)) {
      route["path"] = route["name"] = `i-${menuList[i].id}`;
      route["meta"]["iframeURL"] = URL;
    } else {
      URL = URL.replace(/^\//, "").replace(/_/g, "-");
      route["path"] = route["name"] = URL.replace(/\//g, "-");
      route["component"] = () => import(`@/views/modules/${URL}`);
    }
    routes.push(route);
  }
  if (temp.length >= 1) {
    return fnAddDynamicMenuRoutes(temp, routes);
  }
  // 添加路由
  router.addRoutes([
    {
      ...moduleRoutes,
      name: "main-dynamic-menu",
      children: routes
    },
    { path: "*", redirect: { name: "404" } }
  ]);
  window.SITE_CONFIG["dynamicMenuRoutes"] = routes;
  window.SITE_CONFIG["dynamicMenuRoutesHasAdded"] = true;
}

export default router;
