import request from '@/utils/request';

export const getUpgradeList = (page, limit, params) => {
  return request({
    url: '/sys/androidUpgrade/page',
    method: 'get',
    params: {
      page: page,
      limit: limit,
      ...params
    }
  })
}

export const publish = (id) => {
  return request({
    url: `/sys/androidUpgrade/publish/${id}`,
    method: 'get'
  })
}

export const add = (data) => {
  return request({
      url: '/sys/androidUpgrade/add',
      method: 'post',
      data: data,
  })
}

export const update = (data) => {
  return request({
      url: '/sys/androidUpgrade/update',
      method: 'post',
      data: data,
  })
}

export const remove = (id) => {
  return request({
      url: `/sys/androidUpgrade/${id}`,
      method: 'delete',
  })
}

export const batchDelete = (ids) => {
  return request({
      url: `/sys/androidUpgrade`,
      method: 'delete',
      data: ids
  })
}