import { isEmpty } from "@/utils";

const form = {
  state: {
    // 表单结构
    form: [],
    // 表单数据
    formData: {},
    //弹出表单时表单类型子表单数据
    dynamicFormData: {},
    relation: {},
    relationData: {},
    formHandler: null,
    dataSource: {},
    //显隐触发数据来源操作，显隐关联项
    joinSubjects: new Set(),
    // 由于存在子表单，或者是因为一条数据可能会被更改多次，地址选择存储使用map，key为prop或did或prop_index
    regionSelectMap: new Map(),
    // 协查监听疫点表属性，
    trackData: null,
    formLoopEndFlag: false,
    ccDids: [],
    currentUser: '',
  },
  getters: {
    relationList: (state) => state.relation,
    relationData: (state) => state.relationData,
    formHandler: (state) => state.formHandler,
    getDataSource: (state) => (prop) => {
      // console.log('get src:', prop, state.joinSubjects)
      if (state.joinSubjects.has(prop)) {
        return state.dataSource;
      } else {
        return null;
      }
    },
    getRegionSelectMap: (state) => state.regionSelectMap,
    getTrackData: (state) => state.trackData,
    getSaveProp: (state) => state.saveProp,
    getDynaFormLastRecord: (state) => (prop) => state.dynamicFormData[prop],
    getFormLoopEndFlag: (state) => state.formLoopEndFlag,
    getCcDids: (state) => state.ccDids,
    getCurrentUser: (state) => state.currentUser,
  },
  mutations: {
    form(state, data) {
      state.form = data;
    },
    setFormData(state, data) {
      state.formData = data;
    },
    setRelation(state, value) {
      state.relation = value;
    },
    setTracks(state, value) {
      state.relationData.tracks = value;
    },
    setRelationData(state, obj) {
      state.relationData[obj.writeField] = obj.value;
    },
    setFormHandler(state, data) {
      state.formHandler = data;
    },
    saveDataSource(state, obj) {
      let { label, item } = { ...obj };
      state.dataSource.label = label;
      //记录来源组件对应的显隐项
      item.dicData.forEach((dic) => {
        dic.joinSubjects.forEach((prop) => state.joinSubjects.add(prop));
      });
    },
    clearDataSource(state) {
      state.dataSource = {};
    },
    regionSelectMap(state, obj) {
      if (obj) {
        state.regionSelectMap.set(obj.key, obj.value);
      } else {
        state.regionSelectMap = new Map();
      }
    },
    deleteRegionAddress(state, delAddrObj) {
      if (delAddrObj) {
        let newAddresses = delAddrObj.del;
        let map = state.regionSelectMap;
        for (let [k, v] of map) {
          let obj = JSON.parse(v);
          if (newAddresses.has(obj.fullAddress)) {
            map.delete(k);
          }
        }
      }
    },
    saveTrackData(state, val) {
      if (val && val.length > 0) {
        state.trackData = val;
      } else {
        state.trackData = [];
      }
    },
    //快速保存子表单一行数据
    quickSaveDynaFormLastRecord(state, obj) {
      state.dynamicFormData[obj.prop] = obj.form;
    },
    clearDynaFormLastRecord(state) {
      state.dynamicFormData = {};
    },
    setFormLoopEndFlag(state, data) {
      state.formLoopEndFlag = data;
    },
    setCcDids(state, data) {
      state.ccDids = data;
    },
    setCurrentUser(state, data) {
      state.currentUser = data;
    },
  },
};

export default form;
