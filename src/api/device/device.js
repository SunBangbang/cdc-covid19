import request from '@/utils/request'

export const getPageList = (page, limit, params) => {
  return request({
    url: '/device/page',
    method: 'get',
    params: {
      page: page,
      limit: limit,
      ...params
    }
  })
}

export const saveOrUpdate = (data) => {
  return request({
    url: '/device',
    method: 'post',
    data: data
  })
}

export const remove = (ids) => {
  return request({
    url: '/device',
    method: 'delete',
    params:{
      ids: ids
    }
  })
}

export const getDeptTreeList = () => {
    return request({
        url: '/sys/dept/list',
        method: 'get'
    })
}

export function uploadFile(groupId, file) {
  let param = new FormData()
  param.append("groupId", groupId)
  param.append("file", file)
  const config = { headers: { "Content-Type": "multipart/form-data" } }
  return request.post(window.SITE_CONFIG['apiURL']+'/device/upload', param, config)
}

export const getList = (params) => {
  return request({
    url: '/device/list',
    method: 'get',
    params: {
      ...params
    }
  })
}

/**
 * 批量激活
 * @param ids
 * @returns {AxiosPromise}
 */
export const batchActive = (ids) => {
  return request({
    url: '/device/batchActive',
    method: 'get',
    params:{
      ids: ids
    }
  })
}
