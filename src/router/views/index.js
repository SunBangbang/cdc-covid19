/* eslint-disable */
export default [
  {
    path: '/',
    component: () =>
      import ('@/views/main'),
    children: [
      //     {
      //     path: "/subject-task-task-management",
      //     name: 'task-management',
      //     meta: { title: '任务管理', isTab: false },
      //     component: () =>
      //         import ('@/views/modules/subject-task/task-management')
      // },
      {
        path: "/subject-task-task-management/create",
        name: 'task-create',
        meta: {title: '新建任务', isTab: false},
        component: () =>
          import ('@/views/modules/subject-task/task-create')
      }, {
        path: "/subject-task-task-management/edit/:taskId",
        name: 'task-edit',
        meta: {title: '编辑任务', isTab: false},
        component: () =>
          import ('@/views/modules/subject-task/task-create')
      }, {
        path: "/subject-task-task-management/show/:taskId/:isShow",
        name: 'task-show',
        meta: {title: '查看任务', isTab: false},
        component: () =>
          import ('@/views/modules/subject-task/task-detail')
      }, {
        path: "/subject-task-task-management/editTaskDraft/:taskDraftId",
        name: 'task-edit-task-draft',
        meta: {title: '编辑任务', isTab: false},
        component: () =>
          import ('@/views/modules/subject-task/task-create')
      },
      {
        path: "/investigator-page",
        name: 'investigator-page',
        meta: {title: '分配协查流调员', isTab: false},
        component: () =>
          import ('@/views/modules/collaborative-investigation-task/investigator-page')
      },
      // {
      //     path: "/my-task-management",
      //     name: 'my-task-management',
      //     meta: { title: '我的任务', isTab: false },
      //     component: () =>
      //         import ('@/views/modules/subject-task/my-task-management')
      // }
    ]
  },
  {
    path: '/',
    component: () =>
      import ('@/views/main'),
    children: [
      {
        path: "fill-questionnaire/:taskId/:surveyFormId",
        name: 'fill-questionnaire',
        meta: {title: '填写表单', isTab: false},
        component: () =>
          import ('@/views/modules/survey-form/fill-questionnaire')
      },
      {
        path: "write-form",
        name: 'write-questionnaire',
        meta: {title: '填写表单', isTab: false, cancelKeepAlive: true},
        component: () =>
          import ('@/views/modules/survey-form/write-questionnaire')
      },
      {
        path: "collaborative-write-form",
        name: 'collaborative-write-questionnaire',
        meta: {title: '填写表单', isTab: false, cancelKeepAlive: true},
        component: () =>
          import ('@/views/modules/collaborative-investigation-task/collaborative-write-sample')
      },
      {
        path: "audit-questionnaire/:taskId/:surveyFormId",
        name: 'audit-questionnaire',
        meta: {title: '审核调查记录', isTab: false},
        component: () =>
          import ('@/views/modules/survey-form/audit-questionnaire')
      },
      {
        path: "audit-sample/audit",
        name: 'audit-sample',
        meta: {title: '审核调查记录V2', isTab: false, cancelKeepAlive: true},
        component: () =>
          import ('@/views/modules/survey-form/audit-sample')
      },
      {
        path: 'report-sample-detail-viewer',
        name: 'report-sample-detail-viewer',
        meta: {title: '查看审核或提交的样本', isTab: false, cancelKeepAlive: true},
        component: () =>
          import('@/views/modules/report-case-report/report-sample-detail-viewer')
      },
      {
        path: 'application-investigation-task-creator',
        name: 'application-investigation-task-creator',
        meta: {title: '创建协查任务', isTab: false, cancelKeepAlive: true},
        component: () =>
          import('@/views/modules/collaborative-investigation-task/components/investigation-creator')
      },
      {
        path: 'application-investigation-task-view',
        name: 'application-investigation-task-view',
        meta: {title: '查看协查任务', isTab: false, cancelKeepAlive: true},
        component: () =>
          import('@/views/modules/collaborative-investigation-task/components/investigation-view')
      },
      {
        path: "questionnaire/:operation/:id/:surveyFormId",
        name: 'questionnaire-detail',
        meta: {title: '样本详情', isTab: false},
        component: () =>
          import ('@/views/modules/survey-form/components/questionnaire-detail')
      },
      {
        path: "survey-form/view/:type/:id",
        name: 'survey-form',
        meta: {title: '查看表单', isTab: false, cancelKeepAlive: true},
        component: () =>
          import('@/views/modules/survey-form/view-custom-form')
      },
      {
        path: "survey-form/history/:type/:id",
        name: 'history-questionnaire',
        meta: {title: '查看历史记录', isTab: false},
        component: () =>
          import ('@/views/modules/survey-form/history-questionnaire')
      },
    ]
  },
  {
    path: '/message',
    component: () =>
      import ('@/views/main'),
    children: [{
      path: "create",
      name: 'message-create',
      meta: {title: '新建消息', isTab: false},
      component: () =>
        import ('@/views/modules/message/message-add-or-update')
    }, {
      path: "edit/:id",
      name: 'message-edit',
      meta: {title: '编辑消息', isTab: false},
      component: () =>
        import ('@/views/modules/message/message-add-or-update')
    }]
  },
  {
    path: '/survey-form',
    component: () =>
      import ('@/views/main'),
    children: [{
      path: "create",
      name: 'dform-create',
      meta: {title: '新建表单', isTab: false},
      component: () =>
        import ('@/views/modules/survey-form/dform')
    }, {
      path: "refer",
      name: 'dform-refer',
      meta: {title: '新建表单', isTab: false},
      component: () =>
        import ('@/views/modules/survey-form/dform')
    }, {
      path: "edit/:id/:type/:formType",
      name: 'dform-edit',
      meta: {title: '编辑表单', isTab: false},
      component: () =>
        import ('@/views/modules/survey-form/dform')
    }, {
      /*path: "preview/:id",
      name: 'dform-preview',
      meta: { title: '预览表单', isTab: false },
      component: () =>
          import ('@/views/modules/survey-form/preview')
  }, {*/
      path: "common-questionnaire",
      name: 'common-questionnaire',
      meta: {title: '公共表单', isTab: false},
      component: () =>
        import ('@/views/modules/survey-form/common-questionnaire')
    },
      {
        path: "custom-questionnaire",
        name: 'custom-questionnaire',
        meta: {title: '自定义表单', isTab: false},
        component: () =>
          import ('@/views/modules/survey-form/custom-questionnaire')
      },
      {
        path: "common-module",
        name: 'common-module',
        meta: {title: '公共模板', isTab: false},
        component: () =>
          import ('@/views/modules/survey-form/common-module')
      }, {
        path: "module-create",
        name: 'module-create',
        meta: {title: '新建模板', isTab: false},
        component: () =>
          import ('@/views/modules/survey-form/dform')
      }, {
        path: "module-edit/:id/:type/:tempType",
        name: 'module-edit',
        meta: {title: '编辑模板', isTab: false},
        component: () =>
          import ('@/views/modules/survey-form/dform')
      },
      {
        path: "survey-sample/:taskId/:type",
        name: 'survey-sample',
        meta: {title: '查看样本', isTab: false},
        component: () =>
          import ('@/views/modules/survey-form/survey-sample')
      },
      /*{
          path: "module-preview/:id",
          name: 'module-preview',
          meta: { title: '预览模板', isTab: false },
          component: () =>
            import ('@/components/form-design/form-json/index')
          /!*component: () =>
              import ('@/views/modules/survey-form/preview')*!/
      }*/
    ]
  },
  {
    path: '/',
    component: () =>
      import ('@/views/main'),
    children: [{
      path: "/library-library/create",
      name: 'library-create',
      meta: {title: '新建文库', isTab: false},
      component: () =>
        import ('@/views/modules/library/library-add-or-update')
    }, {
      path: "/library-library/edit/:id",
      name: 'library-edit',
      meta: {title: '编辑文库', isTab: false},
      component: () =>
        import ('@/views/modules/library/library-add-or-update')
    }, {
      path: "/library-library/show/:id",
      name: 'library-show',
      meta: {title: '查看文库', isTab: false},
      component: () =>
        import ('@/views/modules/library/components/library-detail')
    }],
  },
  {
    path: '/user',
    component: () =>
      import ('@/views/main'),
    children: [{
      path: 'user-personal-info',
      name: 'user-personal-info',
      meta: {
        title: '用户个人信息',
        isTab: false
      },
      component: () =>
        import ('@/views/modules/sys/user-personal-info')
    }]
  },
  {
    path: '/',
    component: () =>
      import ('@/views/main'),
    children: [{
      path: '/three-analysis-analysis-record/detail',
      name: 'analysisy-record-detail',
      meta: {
        title: '分析详情',
        isTab: false,
        // cancelKeepAlive:false
      },
      component: () =>
        import ('@/views/modules/three-analysis/analysis-record-edit')
    }]
  },
  {
    path: '/tencentIm',
    name: 'tencentIm',
    redirect: '/tencentIm/index',
    component: () =>
      import ('@/views/main'),
    children: [{
      path: 'index',
      name: 'tecentIm-home',
      component: () =>
        import ('@/tencentIM/index'),
      meta: {
        title: 'IM界面',
        isTab: false
      }
    }]
  },
  {
    path: '/',
    component: () =>
      import ('@/views/main'),
    children: [
      {
        path: "/scene-grades-management",
        name: 'scene-grades-management',
        meta: {title: '年级管理', isTab: false},
        component: () =>
          import ('@/views/modules/scene/scene-grades-management')
      },
      {
        path: "/scene-class-management",
        name: 'scene-class-management',
        meta: {title: '班级管理', isTab: false},
        component: () =>
          import ('@/views/modules/scene/scene-class-management')
      }
    ]
  },
  {
      path: '/research-forum',
      component: () =>
          import ('@/views/main'),
      children: [{
          path: "/research-forum/create/:appId/:sampleId",
          name: 'create-post',
          meta: { title: '新建帖子', isTab: false },
          component: () =>
              import ('@/views/modules/research-forum/add-post')
      }, {
          path: "/research-forum/edit/:id",
          name: 'edit-post',
          meta: { title: '编辑帖子', isTab: false },
          component: () =>
              import ('@/views/modules/research-forum/add-post')
      },{
          path: "/research-forum/detail/:id",
          name: 'post-detail',
          meta: { title: '帖子详情', isTab: false },
          component: () =>
              import ('@/views/modules/research-forum/post-detail')
      }]
  },
];
