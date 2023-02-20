import request from '@/utils/request';

export const investigatorInfoPage = (page, limit, deptId, params) => {
  return request({
    url: '/sys/user/getInvestigatorsPage',
    method: 'get',
    params: {
      page: page,
      limit: limit,
      deptId: deptId,
      ...params
    }
  })
}
