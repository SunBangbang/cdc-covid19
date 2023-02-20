import { isEmpty } from "@/utils";

export default {
  methods: {
    /**
     * 解析表单各基本组件之间关系
     * @returns {widgetForm.relation|{}}
     */
    parseRelations() {
      if (this.widgetForm.column && this.widgetForm.column.length > 0) {
        let tracks = [],
          reads = [],
          writes = [],
          ridx = 0,
          widx = 0;
        let track = null;
        this.widgetForm.column.forEach((col, index) => {
          // console.log(col)
          if (col.type === "dynamic" || col.type === "group") {
            if (
              col.children &&
              col.children.column &&
              col.children.column.length > 0
            ) {
              let columns = col.children.column;
              let length = columns.length;
              let dtype = col.children.type;
              dtype = dtype ? dtype : col.type === "dynamic" ? "table" : null;
              for (let i = 0; i < length; i++) {
                let cln = columns[i];
                //轨迹
                track = this.addTrackProp(col.prop, columns, cln, i, length);
                if (track) {
                  track.type = col.type;
                  tracks.push(track);
                }
                if (!this.validatenull(cln.readField)) {
                  reads.push({
                    id: ++ridx,
                    prop: col.prop + "." + cln.prop,
                    dtype: dtype,
                    ptype: col.type,
                    type: cln.type,
                    field: cln.readField
                  });
                }
                if (!this.validatenull(cln.writeField)) {
                  writes.push({
                    id: ++widx,
                    prop: col.prop + "." + cln.prop,
                    dtype: dtype,
                    ptype: col.type,
                    type: cln.type,
                    field: cln.writeField
                  });
                }

                this.handleIdCard(cln, columns, i);
                this.removeSecondFormat(cln);
                this.handleRadio(cln);
              }
            }
          } else {
            this.handleIdCard(col, this.widgetForm.column, index);
            this.removeSecondFormat(col);
            this.handleRadio(col);

            //忽略
            /*track =this.addTrackProp(null, this.widgetForm.column, col, index, this.widgetForm.column.length)
                        if(track){
                            track.type = 'normal'
                            tracks.push(track)
                        }*/
            if (!this.validatenull(col.readField)) {
              reads.push({
                id: ++ridx,
                prop: col.prop,
                ptype: "n",
                type: col.type,
                field: col.readField
              });
            }
            if (!this.validatenull(col.writeField)) {
              writes.push({
                id: ++widx,
                prop: col.prop,
                ptype: "n",
                type: col.type,
                field: col.writeField
              });
            }
          }
        });

        if (!this.widgetForm.relation) {
          this.widgetForm.relation = {};
        }

        /**
         * 生成读写关系配置，子表单关联删除配置
         */
        this.widgetForm.relation.tracks = tracks;
        this.widgetForm.relation.reads = reads;
        let readMap = new Map();
        let writeMap = new Map();
        let rdMap = new Map();
        reads.forEach(item => {
          let arr = readMap.get(item.field);
          arr = arr && arr != undefined ? arr : [];
          arr.push(item.id);
          readMap.set(item.field, arr);

          if (item.ptype === "dynamic") {
            rdMap.set(item.id, item.prop.split(".")[0]);
          }
        });
        let wdMap = new Map();
        writes.forEach(item => {
          let arr = writeMap.get(item.field);
          arr = arr && arr != undefined ? arr : [];
          arr.push(item.id);
          writeMap.set(item.field, arr);
          item.map = readMap.get(item.field);

          if (item.ptype === "dynamic") {
            let dprop = item.prop.split(".")[0];
            let maps = wdMap.get(dprop);
            maps = maps && maps != undefined ? maps : [];
            wdMap.set(dprop, Array.from(new Set(maps.concat(item.map))));
          }
        });
        reads.forEach(item => {
          item.map = writeMap.get(item.field);
        });

        let deletes = [];
        for (let [k, v] of wdMap) {
          let set = new Set();
          v.forEach(item => {
            if (rdMap.has(item)) {
              set.add(rdMap.get(item));
            }
          });
          if (set.size > 0) {
            wdMap.set(k, Array.from(set));
            deletes.push({ prop: k, value: Array.from(set) });
          }
        }
        this.widgetForm.relation.writes = writes;
        this.widgetForm.relation.deletes = deletes;
        this.$store.commit("setRelation", this.widgetForm.relation);
        // console.log('relation:', reads, writes, deletes)

        return this.widgetForm.relation;
      }
    },
    addTrackProp(parentProp, columns, cln, i, length) {
      parentProp = parentProp ? parentProp + "." : "";
      //轨迹
      if (
        (cln.type === "map" || cln.type === "regionSelect") &&
        cln.track &&
        cln.track === true
      ) {
        let track = { address: parentProp + cln.prop };
        if (i >= 2) {
          let start = columns[i - 2];
          let end = columns[i - 1];
          if (start.trackTime && start.trackTime === true) {
            track.start = parentProp + start.prop;
            if (end.trackTime && end.trackTime === true) {
              track.end = parentProp + end.prop;
            }
          } else if (end.trackTime && end.trackTime === true) {
            track.start = parentProp + end.prop;
          }
          // if (i + 1 <= length) {
          //   let nextCln = columns[i + 1];
          //   if (
          //     nextCln.type === "radio" &&
          //     nextCln.epidSpot &&
          //     nextCln.epidSpot === true
          //   ) {
          //     track.epidSpot = parentProp + nextCln.prop;
          //   }
          // }
        } else if (i === 1) {
          let start = columns[i - 1];
          if (start.trackTime && start.trackTime === true) {
            track.start = parentProp + start.prop;
          }
          // if (i + 1 <= length) {
          //   let nextCln = columns[i + 1];
          //   if (
          //     nextCln.type === "radio" &&
          //     nextCln.epidSpot &&
          //     nextCln.epidSpot === true
          //   ) {
          //     track.epidSpot = parentProp + nextCln.prop;
          //   }
          // }
        }
        for (let j = i; j < columns.length; j++) {
          if (
            columns[j].type === "radio" &&
            columns[j].epidSpot &&
            columns[j].epidSpot === true
          ) {
            track.epidSpot = parentProp + columns[j].prop;
          }
        }
        // columns.forEach(item => {
        //   if (
        //     item.type === "radio" &&
        //     item.epidSpot &&
        //     item.epidSpot === true
        //   ) {
        //     track.epidSpot = parentProp + item.prop;
        //   }
        // });

        return track;
      }
      return null;
    },
    /**
     * 获取轨迹数据
     * @returns {[]}
     */
    getTrackList() {
      let trackData = [];
      let tracks = this.relation.tracks;
      if (tracks) {
        tracks.forEach(track => {
          if (track.type === "normal") {
            let regionSelect = this.form[track.address];
            if (regionSelect) {
              let d = null;
              if (regionSelect.name) {
                d = {
                  address:
                    regionSelect.name.replaceAll("/", "") +
                    this.trim(regionSelect.detailedAddress)
                };
              } else if (regionSelect.formattedAddress) {
                d = { address: regionSelect.formattedAddress };
              }
              if (d) {
                let found = false;
                if (track.start) {
                  let r = this.form[track.start];
                  if (r instanceof Array) {
                    d.start = r[0];
                    d.end = r[1];
                    found = true;
                  } else {
                    d.start = r;
                  }
                }
                if (track.end && !found) {
                  d.end = this.form[track.end];
                }
                if (track.epidSpot) {
                  d.epidSpot = this.form[track.epidSpot];
                }
                trackData.push(d);
              }
            }
          } else if (track.type === "group") {
            let arr = track.address.split(".");
            let obj = this.form[arr[0]];
            if (obj) {
              let regionSelect = obj[arr[1]];
              if (regionSelect) {
                let d = null;
                if (regionSelect.name) {
                  d = {
                    address:
                      regionSelect.name.replaceAll("/", "") +
                      this.trim(regionSelect.detailedAddress)
                  };
                } else if (regionSelect.formattedAddress) {
                  d = { address: regionSelect.formattedAddress };
                }
                if (d) {
                  let found = false;
                  if (track.start) {
                    let r = obj[track.start.split(".")[1]];
                    if (r instanceof Array) {
                      d.start = r[0];
                      d.end = r[1];
                      found = true;
                    } else {
                      d.start = r;
                    }
                  }
                  if (track.end && !found) {
                    d.end = obj[track.end.split(".")[1]];
                  }
                  if (track.epidSpot) {
                    d.epidSpot = obj[track.epidSpot.split(".")[1]];
                  }
                  trackData.push(d);
                }
              }
            }
          } else if (track.type === "dynamic") {
            let arr = track.address.split(".");
            let list = this.form[arr[0]];
            // console.log('dynamic:', track, ' ', list)
            if (list !== undefined && list instanceof Array) {
              let startIdx = track.start ? track.start.split(".")[1] : null;
              let endIdx = track.end ? track.end.split(".")[1] : null;
              let epidSpotIdx = track.epidSpot
                ? track.epidSpot.split(".")[1]
                : null;
              list.forEach(item => {
                let regionSelect = item[arr[1]];
                if (regionSelect) {
                  let d = null;
                  if (regionSelect.name) {
                    d = {
                      address:
                        regionSelect.name.replaceAll("/", "") +
                        this.trim(regionSelect.detailedAddress)
                    };
                  } else if (regionSelect.formattedAddress) {
                    d = { address: regionSelect.formattedAddress };
                  }
                  if (d) {
                    let found = false;
                    if (startIdx) {
                      let r = item[startIdx];
                      if (r instanceof Array) {
                        d.start = r[0];
                        d.end = r[1];
                        found = true;
                      } else {
                        d.start = r;
                      }
                    }
                    if (endIdx && !found) {
                      d.end = item[endIdx];
                    }
                    if (epidSpotIdx) {
                      d.epidSpot = item[epidSpotIdx];
                    }
                    trackData.push(d);
                  }
                }
              });
            }
          }
        });
      }
      this.trackList = trackData.filter(d => d.epidSpot === "0");
      if (this.page && this.trackList) {
        this.page.total = this.trackList.length;
      }
      this.$store.commit("setRelationData", {
        writeField: "tracks",
        value: trackData
      });
      console.log("track table:", this.trackList);
      if (this.trackList && this.trackList.length > 0) {
        this.$store.commit("saveTrackData", this.trackList);
      }
      return trackData;
    },
    trim(str) {
      if (str === null || str === undefined) {
        return "";
      }
      return str;
    },
    /**
     * 添加证件号标记
     * @param col
     */
    handleIdCard(col, columns, index) {
      if (
        col.idCard &&
        eval(col.idCard) &&
        ("radio" === col.type || "select" === col.type)
      ) {
        //关联证件类型，证件号输入, 约定顺序证件类型，证件号输入
        let cln = columns[index + 1];
        if (cln && eval(cln.idCard) && cln.type === "input") {
          cln.idTypeProp = col.prop;
          col.idNoProp = cln.prop;
        } else {
          cln = columns[index + 2];
          if (cln && eval(cln.idCard) && cln.type === "input") {
            cln.idTypeProp = col.prop;
            col.idNoProp = cln.prop;
          }
        }
      }
    },
    /**
     * 临时清理秒格式, 便于填写表单时不显示秒
     * @param cln
     */
    removeSecondFormat(cln) {
      const times = ["datetime", "datetimerange", "time"];
      if (times.includes(cln.type)) {
        let idx = cln.format.indexOf(":ss");
        if (idx > -1) {
          cln.format = cln.format.substring(0, idx);
        }
      }
    },
    handleRadio(cln) {
      if ("radio" === cln.type) {
        //针对现有表单json, 设置第一个选项为触发关联表单值
        if (!isEmpty(cln.relatedDynamic) && isEmpty(cln.relFormVal)) {
          console.log("add relFormVal:", cln);
          cln.relFormVal = cln.dicData[0].value;
        }
      }
    }
  }
};
