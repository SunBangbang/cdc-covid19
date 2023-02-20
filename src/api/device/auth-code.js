import request from '@/utils/request'

export function getResult(data) {
  let result = {};
  result.data = {};
  result.data.code = 0;
  if (data) {
    result.data.data = data;
  }
  return result;
}

/**
 * 授权码 - 分页
 */
export const getPageList = (page, limit, params) => {
  return request({
    url: '/authCode/page',
    method: 'get',
    params: {
      page: page,
      limit: limit,
      ...params
    }
  })
}

/**
 * 生成授权码
 */
export const generate = () => {
  return request({
    url: '/authCode/generate',
    method: 'get'
  })
}
