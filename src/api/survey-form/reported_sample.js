import request from "@/utils/request";

/**
 * 审核调查记录-分页
 * @param page 页码
 * @param limit 页面大小
 * @param params 查询参数
 */
export const pageAudit = (page, limit, params) => {
  return request({
    url: "/api/reported/data/audit/page",
    method: "get",
    params: {
      page,
      limit,
      ...params,
    },
  });
};

/**
 * 获取审核流程配置
 * @param params
 * @returns {*}
 */
export const getMyFlow = (params) => {
  return request({
    url: "/api/rep/audit/myFlow",
    method: "get",
    params: {
      ...params,
    },
  });
};

/**
 * 上报调查记录
 * @param data
 * @returns {*}
 */
export const recordReport = (data) => {
  return request({
    url: "/api/reported/data",
    method: "post",
    data: data,
  });
};

/**
 * 我的提交-分页
 * @param status 样本上报状态
 * @param params 查询参数
 */
export const pageMySubmit = (status = 0, page, limit, params) => {
  return request({
    url: "/api/reported/data/mySubmit/page",
    method: "get",
    params: {
      status: status,
      page,
      limit,
      ...params,
    },
  });
};

/**
 * 我的审核-分页
 * @param status 样本上报状态
 * @param params 查询参数
 */
export const pageMyAudit = (status = 0, page, limit, params) => {
  return request({
    url: "/api/reported/data/myAudit/page",
    method: "get",
    params: {
      status: status,
      page,
      limit,
      ...params,
    },
  });
};

/**
 * 获取样本审核历史记录
 * @param rpid 样本上报ID
 */
export const getAuditHistory = (rpid) => {
  return request({
    url: `/api/reported/data/history/${rpid}`,
    method: "get",
  });
};

/**
 * 生成上报请求任务
 * @param data 上报请求body
 */
export const createReportedData = (data) => {
  return request({
    url: `/api/reported/data`,
    method: "post",
    data: data,
  });
};

/**
 * 处理上报审核，批准或驳回
 * @param data 请求body
 */
export const handelAudit = (data) => {
  return request({
    url: `/api/reported/data/handelAudit`,
    method: "post",
    data: data,
  });
};

/**
 * 更新为待审核状态
 * @param rpid 样本上报ID
 */
export const submitAfterReject = (rpid) => {
  return request({
    url: `/api/reported/data/setTotoStatus/${rpid}`,
    method: "get",
  });
};

/**
 * 获取上报时的附件
 * @param attachId 样本上报附件ID
 */
export const getAttachment = (attachId) => {
  return request({
    url: `/api/reported/data/attachment/${attachId}`,
    method: "get",
  });
};

/**
 * 获取上报时的附件
 * @param params 样本上报附件ID
 */
export const getAttachments = (params) => {
  return request({
    url: `/api/reported/data/attachments`,
    method: "get",
    params: {
      ...params,
    },
  });
};

/**
 * 批量删除
 */
export const batchDelete = (ids) => {
  return request({
    url: '/api/reported/data/batchDelete',
    method: 'delete',
    data: ids
  })
}
