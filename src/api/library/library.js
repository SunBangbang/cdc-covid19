import request from '@/utils/request'

export const getPageList = (page, limit, params) => {
  return request({
    url: '/library/page',
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
    url: '/library',
    method: 'post',
    data: data
  })
}

export const detail = (id) => {
  return request({
    url: `/library/${id}`,
    method: 'get'
  })
}

export const remove = (ids) => {
  return request({
    url: '/library',
    method: 'delete',
    params:{
      ids: ids
    }
  })
}

export const getList = (params) => {
  return request({
    url: '/library/list',
    method: 'get',
    params: {
      ...params
    }
  })
}
