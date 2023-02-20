import request from '@/utils/request'

export const getPageList = (page, limit, params) => {
  return request({
    url: '/message/page',
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
    url: '/message',
    method: 'post',
    data: data
  })
}

export const detail = (params) => {
  return request({
    url: `/message/detail`,
    method: 'get',
    params: {
      ...params
    }
  })
}

export const remove = (ids) => {
  return request({
    url: '/message',
    method: 'delete',
    params:{
      ids: ids
    }
  })
}

export const getUserPageList = (page, limit, params) => {
  return request({
    url: 'sys/user/page',
    method: 'get',
    params: {
      page: page,
      limit: limit,
      ...params
    }
  })
}

//获取调查表分类树
export const getSurveyFormTreeList = () => {
  return request({
    url: '/survey/form/category/tree-list',
    method: 'get'
  });
}
//获取单个调查表
export const getSurveyFormDetail = (id, includes) => {
  return request({
    url: '/survey/form',
    method: 'get',
    params: {id: id, includes: includes}
  });
}

export const getUnreadMessage = () => {
  return request({
    url: '/message/unread',
    method: 'get'
  })
}

export const countUnreadMessage = () => {
  return request({
    url: '/message/unread/count',
    method: 'get'
  })
}

export const updateIsRead = (isRead, params) => {
  return request({
    url: '/message/isRead',
    method: 'post',
    params: {
      isRead: isRead,
      ...params
    }
  })
}

export const removeReadMessage = (messageId,userId) => {
  return request({
    url: '/message/complete/message/delete',
    method: 'delete',
    params: {
      messageId: messageId,
      userId: userId
    }
  })
}
