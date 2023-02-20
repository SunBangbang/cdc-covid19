import request from '@/utils/request';

/**
 * 删除浏览器缓存
 * @param id
 */
export const delFormCache = (id) =>{
  sessionStorage.removeItem("fm:rel:ver:" + id)
  sessionStorage.removeItem("fm:rel:json:" + id)
}

/**
 * 获取表单json内容
 * @param id 调查表oid
 * @param version 调查表版本
 * @param formType 调查表类型： 0->国家表单，1->省市区表单
 */
export const getFormJson = (id, version, formType) => {
  return request({
    url: '/survey/form/getFormJson',
    method: 'get',
    params: {
      id: id,
      version: version,
      type: formType
    }
  })
}

/**
 * 获取最新已发布表单json内容，首先从缓存中读取，不存在则调用接口
 * @param id 调查表oid
 */
export const getReleaseFormJson = async (id) => {
  let key = "fm:rel:ver:" + id
  let change = false
  let resp = await getReleaseFormVersion(id)
  if (resp.data.code === 0) {
    const newVersion = resp.data.data
    let oldVersion = sessionStorage.getItem(key)
    change = newVersion !== oldVersion
    sessionStorage.setItem(key, newVersion)
    console.log('survey form compare version old:', oldVersion, 'new:', newVersion, 'change:', change)
  } else {
    return resp
  }
  let data, res
  if (change) {
    //版本变化，重新获取
    return readFormJson(id)
  } else {
    console.log('load from json cache....')
    //版本未变，读取缓存
    data = sessionStorage.getItem("fm:rel:json:" + id)
    if (data) {
      return new Promise((resolve, reject) => {
        resolve(getResult(JSON.parse(data)))
      })
    } else {
      //缓存没有，重新获取
      return readFormJson(id)
    }
  }
}

async function readFormJson(id){
  let key = "fm:rel:json:" + id
  let res = await getReleaseForm(id)
  if (res.data.code === 0) {
    let data = res.data.data
    if ((typeof data.json) === 'string') {
      data.json = JSON.parse(data.json)
    }
    sessionStorage.setItem(key, JSON.stringify(data))
  }
  return res
}

/**
 * 获取已发布表单版本
 * @param id 调查表oid
 */
async function getReleaseForm(id) {
  return await request({
    url: '/survey/form/getReleaseFormJson',
    method: 'get',
    params: {
      id: id
    }
  })
}

/**
 * 获取已发布表单版本
 * @param id 调查表oid
 */
async function getReleaseFormVersion(id) {
  return await request({
    url: '/survey/form/getReleaseFormVersion',
    method: 'get',
    params: {
      id: id
    }
  })
}

function getResult(data) {
  let result = {};
  result.data = {};
  result.data.code = 0;
  if (data) {
    result.data.data = data;
  }
  return result;
}

/**
 * 获取调查表问题列表
 * @param id 调查表oid
 */
export const getQuestions = (id) => {
  return request({
    url: '/survey/form/getQuestions',
    method: 'get',
    params: {
      id: id
    }
  })
}

/**
 * 获取调查表问题列表描述信息，分层次显示
 * @param id 调查表oid
 */
export const getQuestionsTitle = (id) => {
  return request({
    url: '/survey/form/getQuestionsTitle',
    method: 'get',
    params: {
      id: id
    }
  })
}

/**
 * 保存调查表
 * @param data
 */
export const save = (data) => {
  return request({
    url: '/survey/form',
    method: 'post',
    data: data
  })
}

/**
 * 更新调查表
 * @param data 调查表requestBody
 * @param id 调查表oid
 */
export const update = (data, id) => {
  return request({
    url: '/survey/form',
    method: 'put',
    data: data,
    params: {
      id: id
    }
  })
}

/**
 * 分页显示调查表
 * @param page
 * @param limit
 * @param params
 */
export const getPageList = (page, limit, params) => {
  return request({
    url: '/survey/form/page',
    method: 'get',
    params: {
      page: page,
      limit: limit,
      ...params
    }
  })
}

/**
 * 分页显示调查表历史记录
 * @param page
 * @param limit
 * @param params
 */
export const getPageHistoryList = (page, limit, params) => {
  return request({
    url: '/survey/form/history/page',
    method: 'get',
    params: {
      page: page,
      limit: limit,
      ...params
    }
  })
}

/**
 * 获取已经添加调查表的部门ID列表, 部门ID为用户所在部门及子部门, admin返回空列表
 */
export const getFormDeptIdList = () => {
  return request({
    url: '/survey/form/history/getFormDeptIdList',
    method: 'get'
  })
}

/**
 * 获取已经下发的国家表单
 */
export const getNationalForms = () => {
  return request({
    url: '/survey/form/getNationalForms',
    method: 'get'
  })
}

/**
 * 删除调查表
 * @param id 调查表oid
 */
export const del = (id) => {
  return request({
    url: '/survey/form',
    method: 'delete',
    params: {
      id: id
    }
  })
}

/**
 * 复制调查表
 * @param id 调查表oid
 */
export const clone = (id) => {
  return request({
    url: '/survey/form/clone',
    method: 'get',
    params: {
      id: id
    }
  })
}

/**
 * 下发调查表
 * @param id 调查表oid
 * @param version 调查表版本
 */
export const release = (id, version) => {
  return request({
    url: '/survey/form/release',
    method: 'get',
    params: {
      id: id,
      version: version
    }
  })
}
/**
 * 引用国家级表单创建省市区表单
 */
export const createNonNationalForm = () => {
  return request({
    url: '/survey/form/createNonNationalForm',
    method: 'get',
    params: {
    }
  })
}

/**
 * 引用国家级表单创建省市区表单
 */
export const createNonNationalForms = (data) => {
  return request({
    url: '/survey/form/createNonNationalForms',
    method: 'post',
    data: data,
    params: {
    }
  })
}

/**
 * 分页显示公共调查表
 * @param page
 * @param limit
 * @param params
 */
export const pageCommonForm = (page, limit, params) => {
  return request({
    url: '/survey/form/pageCommonForm',
    method: 'get',
    params: {
      page: page,
      limit: limit,
      ...params
    }
  })
}

/**
 * 发布调查表
 * @param id 调查表oid
 */
export const switchRelease = (id) =>{
  return request({
    url: '/survey/form/switchRelease',
    method: 'get',
    params: {
      id: id
    }
  })
}

/**
 * 更新调查表附件
 * @param data
 * @param id
 */
export const updateAttachment = (data, id, version) => {
  return request({
    url: '/survey/form/updateAttachment',
    method: 'post',
    data: data,
    params: {
      id: id,
      version: version
    }
  })
}

/**
 * 删除调查表附件
 * @param id
 */
export const deleteAttachment = (id, version) => {
  return request({
    url: '/survey/form/deleteAttachment',
    method: 'delete',
    params: {
      id: id,
      version: version
    }
  })
}

/**
 * 根据场景类型获得表单字典
 * @param id
 * @returns {AxiosPromise}
 */
export const getSurveyFormDicBySceneType = (sceneType) =>{
  return request({
    url: '/survey/form/getSurveyFormDicBySceneType',
    method: 'get',
    params: {
      sceneType: sceneType
    }
  })
}

/**
 * 检查调查表是否已上传FTL模板
 * @param id
 */
export const checkFormReportFtl = (id) =>{
  return request({
    url: '/survey/form/checkFtl',
    method: 'get',
    params: {
      id: id
    }
  })
}

/**
 * 获取上传FTL模板和定义业务属性
 * @param id
 */
export const getFormCfg = (id) =>{
  return request({
    url: '/survey/form/getFieldTempCtg',
    method: 'get',
    params: {
      id: id
    }
  })
}


/**
 * 删除调查表报告模板
 * @param id
 */
export const deleteFtl = (id) => {
  return request({
    url: '/survey/form/v2/deleteFtl',
    method: 'delete',
    params: {
      id: id
    }
  })
}

/**
 * 获取当前用户上级部门表单树
 */
export const getParentDeptFormTree = () => {
  return request({
    url: '/survey/form/parentDept/tree-list',
    method: 'get',
  })
}

/**
 * 获取当前部门创建任务时调查表树
 */
export const getTaskSurveyFormTree = (page, limit, params) => {
  return request({
    url: '/survey/form/task/create/tree-list',
    method: 'get',
    params: {
      page: page,
      limit: limit,
      ...params
    }
  })
}

/**
 * 获取当前部门任务分析时调查表树
 */
export const getTaskAnalysisSurveyFormTree = (page, limit, params) => {
  return request({
    url: '/survey/form/task/analysis/tree-list',
    method: 'get',
    params: {
      page: page,
      limit: limit,
      ...params
    }
  })
}


/**
 * 获取字典问题(select, radio, checkbox)选项值
 */
export const getQuestionDicOptions= (surveyFormId, bizField) => {
  return request({
    url: '/survey/form/getQuestionDicOptions/' + surveyFormId + '/' + bizField,
    method: 'get',
  })
}
