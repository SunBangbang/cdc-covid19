import request from '@/utils/request'

/**
 * 感染源传播分页
 * @param params
 */
export const pageTransmitter = (page, limit, params) => {
  //已感染者
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
    url: '/infectionSpread/pageKnown',
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
    url: '/infectionSpread/getChainOfTransmission',
    method: 'get',
    params: {...params}
  })
}


