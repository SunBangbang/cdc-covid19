import request from '@/utils/request'

export const getForumPageList = (page, limit, params) => {
  return request({
    url: '/api/assist/forum/page',
    method: 'get',
    params: {
      page: page,
      limit: limit,
      ...params
    }
  })
}

export const getDetail = (id) => {
  return request({
    url: `/api/assist/forum/${id}`,
    method: 'get'
  })
}

export const saveOrUpdate = (data) => {
  return request({
    url: '/api/assist/forum',
    method: 'post',
    data: data
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/assist/forum',
    method: 'delete',
    data: [ids]
  })
}

export const removeReply = (ids) => {
  return request({
    url: '/api/assist/forum/thread',
    method: 'delete',
    data: [ids]
  })
}

export const getReplyList = (page, limit, id) => {
  return request({
    url: '/api/assist/forum/thread/page',
    method: 'get',
    params: {
      page: page,
      limit: limit,
      fid: id
    }
  })
}

export const sendReply = (data) => {
  return request({
    url: '/api/assist/forum/thread',
    method: 'post',
    data: data
  })
}

export const getDetailInfo = (id) => {
  return request({
    url: `/api/assist/forum/info/${id}`,
    method: 'get'
  })
}
