import request from '@/utils/request';

/**
 * 获取已知密接列表
 * @param params
 */
export const getKnownCloseContact = (params) => {
  if(params && params.taskId){
    params.taskIds = params.taskId.join(",")
    delete params.taskId
  }
  return request({
    url: '/closeContact/getKnownList',
    method: 'get',
    params: {...params}
  })
}

/**
 * 分页已知密接统计
 * @param params
 */
export const pageKnown = (page, limit, params) => {
  return request({
    url: '/closeContact/pageKnown',
    method: 'get',
    params: {
      page: page,
      limit: limit,
      ...params
    }
  })
}

/**
 * 分页传播者列表
 * @param params
 */
export const pageTransmitter = (page, limit, params) => {
  //已感染者
  //params.hasSymptom = 1
  if(params){
    if(params.taskIds){
      params.taskIds = params.taskIds.join(",")
    }
    let timeRange = params.timeRange
    if(timeRange && timeRange.length > 1){
      params.startTime = timeRange[0]
      params.endTime = timeRange[1]
      delete params.timeRange
    }
  }
  return request({
    url: '/closeContact/pageKnown',
    method: 'get',
    params: {
      page: page,
      limit: limit,
      ...params
    }
  })
}

/**
 * 获取传播感染者列表
 * @param params
 */
export const getChainOfTransmission = (params) => {
  if(params){
    if(params.taskIds){
      params.taskIds = params.taskIds.join(",")
    }
    let timeRange = params.timeRange
    if(timeRange && timeRange.length > 1){
      params.startTime = timeRange[0]
      params.endTime = timeRange[1]
      delete params.timeRange
    }
  }
  return request({
    url: '/closeContact/getChainOfTransmission',
    method: 'get',
    params: {...params}
  })
}


