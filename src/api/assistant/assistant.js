import request from "@/utils/request";

/**
 * 获取单个协查申请详情
 * @appId 协查申请ID
 */
export const getOneAssistApply = (appId) => {
  return request({
    url: `/api/assist/apply/${appId}`,
    method: 'get',
  })
}

/**
 * 获取部门收到的单个协查申请详情
 * @appId 协查申请ID
 */
export const getReceivedApply = (appId) => {
  return request({
    url: `/api/assist/receivedApply/${appId}`,
    method: 'get',
  })
}

/**
 * 获取子部门收到的单个协查申请详情,上级查看子部门收到协查任务
 * @appId 协查申请ID
 */
export const getDeptReceivedApply = (appId, deptId) => {
  return request({
    url: `/api/assist/deptReceivedApply/${appId}/${deptId}`,
    method: 'get',
  })
}

/**
 * 获取指定协查申请的共享模块
 * @appId 协查申请ID
 */
export const getAssistShareModule = (appId) => {
  return request({
    url: `/api/assist/getShareModule/${appId}`,
    method: 'get',
  })
}

/**
 * 分页协查申请
 * @params
 */
export const  pageAssistReq = (page, limit, params) => {
  return request({
    url: '/api/assist/page',
    method: 'get',
    params: {
      page,
      limit,
      ...params
    }
  })
}

/**
 * 分页协查任务
 * @param params
 */
export const pageAssistTask = (page, limit, params) => {
  return request({
    url: '/api/assist/pageTask',
    method: 'get',
    params: {
      page,
      limit,
      ...params
    }
  })
}

/**
 * 分页部门收到的协查任务
 * @params
 */
export const pageOrgReceiveTask = (page, limit, params) => {
  return request({
    url: '/api/assist/pageOrgReceiveTask',
    method: 'get',
    params: {
      page,
      limit,
      ...params
    }
  })
}

/**
 * 分页我的协查任务
 * @param params
 */
export const pageMyTask = (page, limit, params) => {
  return request({
    url: '/api/assist/pageMyTask',
    method: 'get',
    params: {
      page,
      limit,
      ...params
    }
  })
}

/**
 * 为生成协查任务准备
 * @params
 */
export const  assistTaskPrepare = (params) => {
  return request({
    url: '/api/assist/task/prepare',
    method: 'get',
    params: {
      ...params
    }
  })
}

/**
 * 创建或更新协查任务
 * @data 请求body
 */
export const  assistTaskCreate = (data) => {
  return request({
    url: '/api/assist/task/create',
    method: 'post',
    data: data
  })
}

/**
 * 创建更新协查任务草稿
 * @param id 协查草稿ID
 * @param data
 */
export const  saveOrUpdateAssistTaskDraft = (id, data) => {
  return request({
    url: '/api/assist/task/draft',
    method: 'post',
    data: data,
    params: {
      id: id
    }
  })
}

/**
 * 接受协查任务
 * @taskId 协查任务ID
 */
export const acceptAssist = (taskId) => {
  return request({
    url: '/api/assist/task/accept/' + taskId,
    method: 'get'
  })
}

/**
 * 拒绝协查任务
 * @taskId 协查任务ID
 */
export const rejectAssist = (taskId) => {
  return request({
    url: '/api/assist/task/reject/' + taskId,
    method: 'get'
  })
}

/**
 * 删除协查申请任务
 * @appId 协查申请ID
 */
export const deleteAssist = (appId) => {
  return request({
    url: '/api/assist/task/' + appId,
    method: 'delete',
  })
}

/**
 * 删除协查部门任务
 * @taskId 协查任务ID
 */
export const deleteDeptTask = (taskId) => {
  return request({
    url: '/api/assist/deptTask/' + taskId,
    method: 'delete',
  })
}

/**
 * 分配协查流调员
 * @data 请求body
 */
export const assignInvestigator = (data) => {
  return request({
    url: '/api/assist/assignInvestigator',
    method: 'post',
    data: data
  })
}

/**
 * 查询单个审核合并样本
 * @formId 表单ID
 * @sampleId 协查审核合并记录ID
 * @aTaskId 协查任务ID
 */
export const getAuditSample = (formId, sampleId, aTaskId) => {
  return request({
    url: `/api/assist/sample/getAuditSample/${formId}/${sampleId}?aTaskId=${aTaskId}`,
    method: 'get'
  })
}

/**
 * 查询单个协查样本
 * @formId 表单ID
 * @sampleId 协查协查记录ID
 */
export const getAssistSample = (formId, sampleId) => {
  return request({
    url: `/api/assist/sample/getAssistSample/${formId}/${sampleId}`,
    method: 'get'
  })
}

/**
 * 保存样本草稿
 * @data 请求body
 */
export const saveDraftAssistSample = (data) => {
  return request({
    url: '/api/assist/sample/saveAsDraft',
    method: 'post',
    data: data,
    params: {_t: Date.now()}
  })
}

/**
 * 提交样本
 * @data 请求body
 */
export const submitAssistSample = (data) => {
  return request({
    url: '/api/assist/sample/submit',
    method: 'post',
    data: data,
    params: {_t: Date.now()}
  })
}

/**
 * 分页协查填写样本
 * @page 页码
 * @limit 页面大小
 * @params 查询参数
 */
export const  pageAssistSample = (page, limit, params) => {
  return request({
    url: '/api/assist/sample/pageForTask',
    method: 'get',
    params: {
      page,
      limit,
      ...params
    }
  })
}

/**
 * 查询协查流调员
 * @data 请求body
 */
export const pageInvestigator = (taskId, page, limit, params) => {
  return request({
    url: `/api/assist/pageInvestigator/${taskId}`,
    method: 'get',
    params: {
      page: page,
      limit: limit,
      ...params
    }
  })
}

/**
 * 批量删除协查任务
 * @ids 协查任务ID
 */
 export const batchDelete = (ids) => {
  return request({
    url: '/api/assist/batchDelete',
    method: 'delete',
    data: ids
  })
}
