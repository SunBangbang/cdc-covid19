import request from "@/utils/request";
import { getResult } from "@/utils";

/**
 *分页查询主题任务
 * @param page 页码
 * @param limit 页面大小
 * @param params 查询参数
 */
export const getList = (page, limit, params) => {
  if (!params.includes) {
    params.includes =
      "name,relDeptId,surveyForms,status,start,end,updateBy,createAt,groupLeader,createBy";
  }
  return request({
    url: "/topic/task/page",
    method: "get",
    params: {
      page: page,
      limit: limit,
      ...params,
    },
  });
};

/**
 * 查询主题任务NameId
 * @param page 页码
 * @param limit 页面大小
 * @param params 查询参数
 */
export const pageNameId = (page, limit, params) => {
  return request({
    url: "/topic/task/pageNameId",
    method: "get",
    params: {
      page: page,
      limit: limit,
      ...params,
    },
  });
};

/**
 * 获取任务详情
 * @param id 任务ID
 */
export const getDetail = (id) => {
  return request({
    url: "/topic/task",
    method: "get",
    params: {
      id,
    },
  });
};

/**
 * 关联调查对象
 * @param id
 * @param respondentIds
 */
export const relatedRespondent = (id, respondentIds) => {
  return request({
    url: "/topic/task/relatedRespondent",
    method: "post",
    id: id,
    respondentIds: respondentIds,
  });
};

/**
 * 保存任务
 * @param data 任务请求body
 */
export const save = (data) => {
  return request({
    url: "/topic/task",
    method: "post",
    data: data,
  });
};

/**
 * 更新任务
 * @param data 任务请求body
 */
export const update = (id, data) => {
  return request({
    url: "/topic/task",
    method: "put",
    data: data,
    params: {
      id,
    },
  });
};

/**
 * 删除任务
 * @param id 任务ID
 */
export const remove = (id) => {
  return request({
    url: "/topic/task",
    method: "delete",
    params: {
      id,
    },
  });
};

/**
 * 获取任务关联的调查表
 * @param id 任务ID
 */
export const getRelatedForm = (id) => {
  return request({
    url: "/topic/task/findRelatedForm",
    method: "get",
    params: {
      id,
    },
  });
};

/**
 * 获取我的任务列表
 * @param page 页码
 * @param limit 页面大小
 * @param params 查询参数
 */
export const getMyTaskList = (page, limit, params) => {
  if (!params.includes) {
    params.includes =
      "name,relDeptId,surveyForms,status,start,end,createBy,createAt,groupLeader";
  }
  // params.isMyDept = false
  return request({
    url: "/topic/task/findMyTask",
    method: "get",
    params: {
      page,
      limit,
      ...params,
    },
  });
};

/**
 * 获取我的最近一个任务
 * @param page 页码
 * @param limit 页面大小
 * @param params 查询参数
 */
export const getMyLatestTaskList = (params) => {
  if (!params.includes) {
    params.includes = "name,relDeptId,status,start,end,createAt,groupLeader";
  }
  // params.isMyDept = false
  return request({
    url: "/topic/task/findMyTask",
    method: "get",
    params: {
      page: 1,
      limit: 1,
      ...params,
    },
  });
};

/**
 * 获取调查表分类树
 */
export const getSurveyFormTreeList = () => {
  return request({
    url: "/survey/form/category/tree-list",
    // url: '/survey/form/parentDept/tree-list',
    method: "get",
  });
};

//获取部分树
// export const getDeptTreeList = () => {
//   return request({
//     url: '/sys/dept/tree/named',
//     method: 'get'
//   })
// }

/**
 * 获取部门调查员
 * @param deptId
 */
export const getInvestigatorsByDeptId = (deptId) => {
  return request({
    url: `/sys/user/getInvestigators?deptId=${deptId}`,
    method: "get",
  });
};

/**
 * 缓存中获取部门信息
 * @param deptId
 * @returns {Promise<unknown>}
 */
export const getRedisDeptList = async (deptId) => {
  let key = "dept:" + deptId;
  let data = localStorage.getItem(key);
  if (data === undefined || data === null) {
    console.log("read dept.........", deptId, data);
    //缓存没有，重新获取
    let res = await getDeptName(deptId);
    if (res.data.code === 0) {
      let deptName = res.data.data;
      localStorage.setItem(key, deptName);
    }
    return res;
  } else {
    console.log("load cache.........", deptId, data);
    return new Promise((resolve, reject) => {
      resolve(getResult(data));
    });
  }
};

/**
 * 获取部门名称
 * @param deptId 机构ID
 * @returns {Promise<void>}
 */
async function getDeptName(deptId) {
  return await request({
    url: `/redis/dept/${deptId}`,
    method: "get",
  });
}

export const switchTaskRelease = (id) => {
  return request({
    url: "/topic/task/switchTaskRelease",
    method: "get",
    params: {
      id: id,
    },
  });
};

export const closeTask = (id) => {
  return request({
    url: "/topic/task/finish",
    method: "get",
    params: {
      id: id,
    },
  });
};

export const getMyTaskCount = () => {
  return request({
    url: "/topic/task/getMyTaskCount",
    method: "get",
  });
};

/**
 * 查找表单关联的任务
 * @param surveyFormId
 * @returns {AxiosPromise}
 */
export const findRelatedTask = (surveyFormId) => {
  return request({
    url: "/topic/task/findRelatedTask",
    method: "get",
    params: {
      surveyFormId: surveyFormId,
    },
  });
};

/**
 * 分页查询任务草稿
 */
export const getPageTaskDraftData = (page, limit, params) => {
  return request({
    url: "/topic/task/draft/page",
    method: "get",
    params: {
      page,
      limit,
      ...params,
    },
  });
};

export const saveTaskDraft = (data) => {
  return request({
    url: "/topic/task/draft/save",
    method: "post",
    data: data,
  });
};

export const removeTaskDraft = (id) => {
  return request({
    url: "/topic/task/draft/delete",
    method: "delete",
    params: {
      id,
    },
  });
};

export const getTaskDraftById = (id) => {
  return request({
    url: `/topic/task/draft/${id}`,
    method: "get",
  });
};

/**
 *分页病例待审核样本
 * @param page 页码
 * @param limit 页面大小
 * @param params 查询参数
 */
export const pagePatientAuditSample = (page, limit, params) => {
  return request({
    url: "/topic/task/pagePatientAuditSample",
    method: "get",
    params: {
      page,
      limit,
      ...params,
    },
  });
};

/**
 * 根据调查员查找任务
 * @param page 页码
 * @param limit 页面大小
 * @param params 查询参数
 */
export const taskListByInvetigator = (page, limit, params) => {
  return request({
    url: "/topic/task/findUsersHistTasks",
    method: "get",
    params: {
      page,
      limit,
      ...params,
    },
  });
};

export const batchDelete = (ids) => {
  return request({
    url: "/topic/task/batchDelete",
    method: "delete",
    data: ids,
  });
};

export const sendSMS = (id) => {
  return request({
    url: "/topic/task/sendSms",
    method: "get",
    params: {
      id,
    },
  });
};

export const batchDeleteSample = (ids, surveyFormId, taskId) => {
  return request({
    url: "/survey/sample/batchDelete/sample",
    method: "delete",
    data: ids,
    params: {
      surveyFormId,
      taskId
    },
  });
};
