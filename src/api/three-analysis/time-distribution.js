import request from '@/utils/request'

const timeDistributionApis = {};

function getResult(data) {
  let result = {};
  result.data = {};
  result.data.code = 0;
  if (data) {
    result.data.data = data;
  }
  return result;
}

/**
 * 获取数据
 */
timeDistributionApis.getData = (form) => {
  return new Promise((resolve, reject) => {
    let data =[
      {
        date:"2021-09-02",
        num:5,
        seq: 0
      },
      {
        date:"2021-09-03",
        num:18,
        seq: 1
      },
      {
        date:"2021-09-04",
        num:15,
        seq: 2
      },
      {
        date:"2021-09-05",
        num:6,
        seq: 3
      },
      {
        date:"2021-09-06",
        num:18,
        seq: 4
      },
      {
        date:"2021-09-07",
        num:20,
        seq: 5
      },
    ]
    resolve(getResult(data));
  })
}


export default timeDistributionApis;
