import request from '@/utils/request';

export const getFormJson = (id) => {
  return request({
    url: '/survey/preInstallModule/getFormJson',
    method: 'get',
    params: {
      id: id
    }
  })
}

export const save = (data) => {
  return request({
    url: '/survey/preInstallModule',
    method: 'post',
    data: data
  })
}

export const update = (data, id) => {
  return request({
    url: '/survey/preInstallModule',
    method: 'put',
    data: data,
    params: {
      id: id
    }
  })
}

export const getPageList = (page, limit, params) => {
  params.excludeJson = true
  return request({
    url: '/survey/preInstallModule/page',
    method: 'get',
    params: {
      page: page,
      limit: limit,
      ...params
    }
  })
}

export const del = (id) => {
  return request({
    url: '/survey/preInstallModule',
    method: 'delete',
    params: {
      id: id
    }
  })
}

export const clone = (id) => {
  return request({
    url: '/survey/preInstallModule/clone',
    method: 'get',
    params: {
      id: id
    }
  })
}

export const getAllPrepareModule=() => {
  return request({
    url: '/survey/preInstallModule/getAllPrepareModule',
    method: 'get'
  })
}



