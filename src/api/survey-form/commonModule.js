import request from '@/utils/request';

export const getFormJson = (id) => {
  return request({
    url: '/survey/module/getFormJson',
    method: 'get',
    params: {
      id: id
    }
  })
}

export const save = (data) => {
  return request({
    url: '/survey/module',
    method: 'post',
    data: data
  })
}

export const update = (data, id) => {
  return request({
    url: '/survey/module',
    method: 'put',
    data: data,
    params: {
      id: id
    }
  })
}

export const getPageList = (page, limit, params) => {
  return request({
    url: '/survey/module/page',
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
    url: '/survey/module',
    method: 'delete',
    params: {
      id: id
    }
  })
}

export const clone = (id) => {
  return request({
    url: '/survey/module/clone',
    method: 'get',
    params: {
      id: id
    }
  })
}

export const getAllModelForm= (page, limit, params) => {
  return request({
    url: '/survey/module/getAllModelForm',
    method: 'get',
    params: {
      page: page,
      limit: limit,
      ...params
    }
  })
}

export const getAllPrepareModule=(page, limit, params) => {
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

export const switchRelease = (id) =>{
  return request({
    url: '/survey/module/switchRelease',
    method: 'get',
    params: {
      id: id
    }
  })
}


