import request from "@/utils/request";

export const getPageList = (page, limit, params) => {
  return request({
    url: 'sys/userRegister/page',
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

export const update = (data) => {
  return request({
    url: 'sys/userRegister',
    method: 'put',
    data: data
  })
}

export const batchDelete = (ids) => {
  return request({
    url: 'sys/userRegister',
    method: 'delete',
    data: ids
  })
}
