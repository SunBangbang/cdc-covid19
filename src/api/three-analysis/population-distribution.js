import request from '@/utils/request'

const populationDistributionApis = {};

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
 * 获取调查表
 */
populationDistributionApis.getSurveyFormOptions = ()=> {
  return new Promise((resolve, reject) => {
    let data = [
      {
        label:"国家表单",
        value:"123"
      },
      {
        label:"江苏版本",
        value:"124"
      }
    ]
    resolve(getResult(data));
  })
}

/**
 * 获取任务
 */
populationDistributionApis.getTaskOptions = () => {
  return new Promise((resolve, reject) => {
    let data = [
      {
        label:"任务一",
        value:"123"
      },
      {
        label:"任务二",
        value:"124"
      }
    ]
    resolve(getResult(data));
  })
}

/**
 * 获得数据
 */
populationDistributionApis.getData = (form) => {
  return new Promise((resolve, reject) => {
    let data = [
      {
        name: '男',
        ageRange: '1-9',
        caseNumber: 5,
      },
      {
        name: '女',
        ageRange: '1-9',
        caseNumber: 4,
      },
      {
        name: '男',
        ageRange: '10-19',
        caseNumber: 0,
      },
      {
        name: '女',
        ageRange: '10-19',
        caseNumber: 3,
      },
      {
        name: '男',
        ageRange: '20-29',
        caseNumber: 1,
      },
      {
        name: '女',
        ageRange: '20-29',
        caseNumber: 3,
      },
      {
        name: '男',
        ageRange: '30-39',
        caseNumber: 5,
      },
      {
        name: '女',
        ageRange: '30-39',
        caseNumber: 13,
      },
      {
        name: '男',
        ageRange: '40-49',
        caseNumber: 6,
      },
      {
        name: '女',
        ageRange: '40-49',
        caseNumber: 20,
      },
      {
        name: '男',
        ageRange: '50-59',
        caseNumber: 6,
      },
      {
        name: '女',
        ageRange: '50-59',
        caseNumber: 20,
      },
    ];
    resolve(getResult(data));
  })
}



export default populationDistributionApis;
