import request from '@/utils/request'

const communicationChainApis = {};

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
communicationChainApis.getData = (form) => {
  return new Promise((resolve, reject) => {
    let data = {
      relation: {
        id: 'g1',
        name: '张杰',
        children: [
          {
            id: 'g12',
            name: '孙艺洲',
            children: [
              {
                id: 'g121',
                name: '李小龙',
                children: [
                  {
                    id: 'g1211',
                    name: '谢霆锋',
                    children: [],
                  },
                ],
              },
              {
                id: 'g122',
                name: '周杰伦',
                children: [
                  {
                    id: 'g1221',
                    name: '李易峰',
                    children: [
                      {
                        id: 'g12211',
                        name: '周笔畅',
                      },
                    ],
                  },
                  {
                    id: 'g1222',
                    name: '旦增尼玛',
                    children: [],
                  },
                ],
              },
              {
                id: 'g123',
                name: '欧阳娜娜',
                children: [
                  {
                    id: 'g1231',
                    name: '李忘生',
                    children: [],
                  },
                ],
              },
            ],
          },
          {
            id: 'g13',
            name: '谢云流',
            children: [
              {
                id: 'g131',
                name: '王小帅',
                children: [],
              },
              {
                id: 'g132',
                name: '洛风',
                children: [],
              },
            ],
          },
          {
            id: 'g14',
            name: '于睿',
            children: [],
          },
        ],
      },
      alone: [
        {
          id: 't1',
          name: 'Faker',
        },
        {
          id: 't2',
          name: 'Uzi',
        },
        {
          id: 't3',
          name: '小虎',
        },
        {
          id: 't4',
          name: '张学友',
        },
        {
          id: 't5',
          name: '郭富城',
        },
        {
          id: 't6',
          name: '刘德华',
        },
        {
          id: 't7',
          name: '王靖雯',
        },
        {
          id: 't8',
          name: '李荣浩',
        },
      ]
    };
    resolve(getResult(data));
  })
}


export default communicationChainApis;
