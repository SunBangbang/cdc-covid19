import request from "@/utils/request";

export const getStatSampleAndPeople = (params) => {
  return request({
    url: "/dashboard/statSampleAndPeople",
    method: "get",
    params: {
      ...params,
    },
  });
};

export const getDetectResult = (params) => {
  return request({
    url: "/dashboard/detectResult",
    method: "get",
    params: {
      ...params,
    },
  });
};

export const getStatYearEveryMonthSampAdd = (params) => {
  return request({
    url: "/dashboard/statYearEveryMonthSampAdd",
    method: "get",
    params: {
      ...params,
    },
  });
};

export const getSampleOccupationDistribution = (limit, params) => {
  return request({
    url: "/dashboard/statCareer",
    method: "get",
    params: {
      category: limit,
      ...params,
    },
  });
};

export const getSampleInvest = (category, params) => {
  return request({
    url: "/dashboard/statInvestCount",
    method: "get",
    params: {
      category: category,
      ...params,
    },
  });
};

export const getAgeAndSex = (params) => {
  return request({
    url: "/dashboard/ageAndSex",
    method: "get",
    params: {
      ...params,
    },
  });
};

export const getSampleAge = (params) => {
  return request({
    url: "/dashboard/sampleAge",
    method: "get",
    params: {
      ...params,
    },
  });
};

export const getProvince = (limit, params) => {
  return request({
    url: "/dashboard/statL7MapProvinceOperation",
    method: "get",
    params: {
      limit: limit,
      ...params,
    },
  });
};

export const getCity = (params) => {
  return request({
    url: "/dashboard/statL7MapCityOperation",
    method: "get",
    params: {
      ...params,
    },
  });
};

export const getDistrict = (params) => {
  return request({
    url: "/dashboard/statL7MapDistrictOperation",
    method: "get",
    params: {
      ...params,
    },
  });
};

export const getSamplePlaceTop10 = (limit, params) => {
  return request({
    url: "/dashboard/samplePlaceTop10",
    method: "get",
    params: {
      limit: limit,
      ...params,
    },
  });
};

export const getSampleSex = (limit, params) => {
  return request({
    url: "/dashboard/statSex",
    method: "get",
    params: {
      category: limit,
      ...params,
    },
  });
};

export const getSampleSource = (limit, params) => {
  return request({
    url: "/dashboard/statSource",
    method: "get",
    params: {
      category: limit,
      ...params,
    },
  });
};

export const getCollectSample = (limit, params) => {
  return request({
    url: "/dashboard/statInvest",
    method: "get",
    params: {
      category: limit,
      ...params,
    },
  });
};

// 统计任务发布和完成数量
export const getStatTopicTask = () => {
  return request({
    url: "/dashboard/statTopicTask",
    method: "get",
  });
};

// 统计病例来源分布
export const getStatCountryFrom = (limit, params) => {
  return request({
    url: "/dashboard/statCountryFrom",
    method: "get",
    params: {
      category: limit,
      ...params,
    },
  });
};

// 统计调查对象来源
export const getStatParticipantFrom = (limit, params) => {
  return request({
    url: "/dashboard/statParticipantFrom",
    method: "get",
    params: {
      category: limit,
      ...params,
    },
  });
};

// 统计调查员工作量
export const getStatInvestWork = (limit, params) => {
  return request({
    url: "/dashboard/statInvestWork",
    method: "get",
    params: {
      category: limit,
      ...params,
    },
  });
};
