import request from '@/utils/request';

const codeTableApis = {};

codeTableApis.getByType = (type) =>{
  return request({
    url: `/sys/code/table/get/${type}`,
    method: "get",
  });
}

export default codeTableApis;
