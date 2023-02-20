import request from '@/utils/request';

const countriesAndRegionsApis = {};


countriesAndRegionsApis.getCountriesAndRegions = () =>{
  return request({
    url: `/sys/region/getCountriesAndRegions`,
    method: "get",
  });
}

export default countriesAndRegionsApis;
