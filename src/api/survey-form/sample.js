import request from '@/utils/request'

/**
 * 获取问卷样本
 * @param id 问卷样本OID
 * @param surveyFormId 调查表OID
 */
export const getSample = (id, surveyFormId) => {
  return request({
    url: '/survey/sample',
    method: 'get',
    params: {
      id: id,
      surveyFormId: surveyFormId
    }
  })
}

/**
 * 获取问卷样本被调查人轨迹
 * @param id 问卷样本OID
 * @param surveyFormId 调查表OID
 */
export const getTrack = (id, surveyFormId) => {
  return request({
    url: '/survey/sample/getTrack',
    method: 'get',
    params: {
      id: id,
      surveyFormId: surveyFormId
    }
  })
}

/**
 * 获取多人问卷样本被调查人轨迹
 * @param ids 问卷样本OID列表
 * @param surveyFormId 调查表OID
 */
export const getTracks = (ids, surveyFormId) => {
  return request({
    url: '/survey/sample/getTracks',
    method: 'get',
    params: {
      ids: ids,
      surveyFormId: surveyFormId
    }
  })
}

/**
 * 获取调查表问题列表
 * @param id 问卷样本OID
 * @param surveyFormId 调查表OID
 */
export const getQuestions = (id, surveyFormId) => {
  return request({
    url: '/survey/sample/getQuestions',
    method: 'get',
    params: {
      id: id,
      surveyFormId: surveyFormId
    }
  })
}

export const apiToken = () => {
  return request({
    url: '/token',
    method: 'get',
  })
}

/**
 * 保存问卷未草稿
 * @param data 问卷样本数据
 * @param uuid 随机数
 */
export const saveAsDraft = (data, uuid) => {
  return request({
    url: '/survey/sample/saveAsDraft',
    method: 'post',
    data: data,
    headers: {
      'uuid': uuid
    }
  })
}

/**
 * 提交问卷
 * @param data 问卷样本数据
 * @param uuid 随机数
 */
export const submit = (data, uuid) => {
  return request({
    url: '/survey/sample/submit',
    method: 'post',
    data: data,
    headers: {
      'uuid': uuid
    }
  })
}

/**
 * 分页显示有效问卷样本， 有效样本即是审核后的样本
 * @param page 页号
 * @param limit 一页记录数
 * @param params 查询参数
 */
export const pageValidForTask = (page, limit, params) => {
  return request({
    url: '/survey/sample/pageForTask',
    method: 'get',
    params: {
      page: page,
      limit: limit,
      status: 1,
      ...params
    }
  })
}

/**
 * 分页显示问卷样本
 * @param page 页号
 * @param limit 一页记录数
 * @param params 查询参数
 */
export const pageForTask = (page, limit, params) => {
  return request({
    url: '/survey/sample/pageForTask',
    method: 'get',
    params: {
      page: page,
      limit: limit,
      ...params
    }
  })
}

/**
 * 分页显示参与任务的被调查人列表
 * @param page 页号
 * @param limit 一页记录数
 * @param params 查询参数
 */
export const pageForTaskParticipant = (page, limit, params) => {
  return request({
    url: '/survey/sample/pageForTaskParticipant',
    method: 'get',
    params: {
      page: page,
      limit: limit,
      ...params
    }
  })
}

/**
 * 删除问卷样本
 * @param id 问卷样本OID
 */
export const del = (id) => {
  return request({
    url: '/survey/sample',
    method: 'delete',
    params: {
      id: id
    }
  })
}

/**
 * 获取样本列表
 * @param page
 * @param limit
 * @param surveyName
 * @param params
 */
export const getList = (page, limit, surveyName, params) => {
  return request({
    url: '/survey/sample/page',
    method: 'get',
    params: {
      page,
      limit,
      surveyName,
      ...params
    }
  })
}

/**
 * 更新样本状态
 * @param id
 * @param surveyFormId
 * @param status
 */
export const updateStatus = (id, surveyFormId, status) => {
  return request({
    url: '/survey/sample/updateStatus',
    method: 'post',
    params: {
      id: id,
      surveyFormId: surveyFormId,
      status: status
    }
  })
}

/**
 * 上传问卷样本文档word
 * @param id
 * @param surveyFormId
 * @param tencentWordUrl
 * @param fileID
 */
export const updateWordUrl = (id, surveyFormId, tencentWordUrl, fileID,progressQueryID) => {
  return request({
    url: '/survey/sample/updateWordUrl',
    method: 'post',
    params: {
      id: id,
      surveyFormId: surveyFormId,
      tencentWordUrl: tencentWordUrl,
      fileID: fileID,
      progressQueryID:progressQueryID
    }
  })
}

/**
 * 更新问卷样本提交状态
 * @param id
 * @param surveyFormId
 * @param status
 */
export const updateSubmitStatus = (id, surveyFormId, status) => {
  return request({
    url: '/survey/sample/updateSubmitStatus',
    method: 'post',
    params: {
      id: id,
      surveyFormId: surveyFormId,
      status: status
    }
  })
}

/**
 * 下载样本报告
 * @param surveyFormId
 */
export const downloadSampleReport = (surveyFormId) => {
  return request({
    url: '/survey/sample/download/doc',
    method: 'get',
    params: {
      id: id,
      surveyFormId: surveyFormId
    }
  })
}

/**
 * 删除样本
 * @param params
 */
export const deleteSample = (params) => {
  return request({
    url: '/survey/sample/delete/sample',
    method: 'delete',
    params: {
      ...params
    }
  })
}

/**
 * 获得样本数
 * @param taskId
 * @param surveyFormId
 * @returns {AxiosPromise}
 */
export const count = (taskId,surveyFormId) => {
  return request({
    url: '/survey/sample/count',
    method: 'get',
    params: {
      taskId: taskId,
      surveyFormId: surveyFormId
    }
  })
}

/**
 * 获取地址统计
 * @param surveyFormId
 * @param params
 */
export const getAddressStatistics = (surveyFormId, params) => {
  return request({
    url: '/survey/sample/getAdressStatistics',
    method: 'get',
    params: {
      surveyFormId: surveyFormId,
      ...params
    }
  })
}

/**
 *
 * @param surveyFormId
 * @param params
 */
export const getClinicalManifestationStatistics = (surveyFormId, params) => {
  return request({
    url: '/survey/sample/getClinicalManifestationStatistics',
    method: 'get',
    params: {
      surveyFormId: surveyFormId,
      ...params
    }
  })
}

/**
 *
 * @param surveyFormId
 * @param params
 */
export const getEpidemicCurveStatistics = (surveyFormId, params) => {
  return request({
    url: '/survey/sample/getEpidemicCurveStatistics',
    method: 'get',
    params: {
      surveyFormId: surveyFormId,
      ...params
    }
  })
}

/**
 * 为问卷样本审核做准备
 * @data 请求 body
 */
export const prepareForAudit = (data) => {
  return request({
    url: '/survey/sample/v2/prepareForAudit',
    method: 'post',
    data: data
  })
}

/**
 * 审核提交样本
 * @param data 审核后的样本数据
 */
export const auditSubmit = (data) => {
  return request({
    url: '/survey/sample/audit',
    method: 'post',
    data: data
  })
}

/**
 * 审核拒绝
 * @data 请求body: {formId, surveyIds, assistIds}
 */
export const reject = (data) => {
  return request({
    url: '/survey/sample/reject',
    method: 'post',
    data: data
  })
}


/**
 * 驳回协查填写样本
 * @id 协查样本ID
 * @remark 驳回意见
 */
export const rejectOneAssist = (id, remark) => {
  return request({
    url: '/survey/sample/rejectOneAssist',
    method: 'post',
    params: {
      id: id,
      remark: remark
    }
  })
}

/**
 * 删除音/视频
 * @formId 调查表oid
 * @sampleId 样本oid
 * @mediaNo 音视频编号
 */
export const deleteMedia = (formId, sampleId, mediaNo) => {
  return request({
    url: '/survey/sample/deleteMedia',
    method: 'delete',
    params: {
      surveyFormId: formId,
      sampleId: sampleId,
      mediaNo: mediaNo
    }
  })
}
