import request from '@/utils/request'

export const getPageList = (page, limit, params) => {
  return request({
    url: 'sys/rotationchart/page',
    method: 'get',
    params: {
      page: page,
      limit: limit,
      order: 'desc',
      orderField: 'create_date',
      ...params
    }
  })
}

export const saveOrUpdate = (data) => {
  return request({
    url: '/sys/rotationchart',
    method: 'post',
    data: data
  })
}

export const remove = (ids) => {
  return request({
    url: 'sys/rotationchart',
    method: 'delete',
    params:{
      ids: ids
    }
  })
}
