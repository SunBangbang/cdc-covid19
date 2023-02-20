import moment from "moment";

class Component {
  constructor(column, form) {
    this.column = column;
    this.form = form;
  }

  set value(value) {
    this.form[this.column.prop] = value;
  }

  get value() {
    return this.form[this.column.prop];
  }

  //获得默认值
  get defaultValue() {
    throw new Error("subclass responsibility");
  }

  //把值设置为默认值
  setDefaultValue(that) {
    //有配置的默认值则使用配置的默认值
    if (this.column.value) {
      that.$set(this.form, this.column.prop, this.column.value);
    }
    //有值 赋值
    else if (this.hasValue()) {
      this.value = this.defaultValue;
    }
    //没值 初始化成默认值
    else {
      that.$set(this.form, this.column.prop, this.defaultValue);
    }
  }

  setNull() {
    this.value = this.defaultValue;
  }

  //是否有值
  hasValue() {
    throw new Error("subclass responsibility");
  }

  //获取label
  get label() {
    return this.value;
  }

  // 更新显隐状态
  handleDisplay(columns) {}

  handleDisplayByMap(map) {}

  // 获取rule
  getRule() {
    if (this.column.rules && this.column.rules.length > 0) {
      return this.column.rules;
    }
    return [];
  }
}

class stringValueComponent extends Component {
  hasValue() {
    if (this.value) {
      return this.value.length > 0;
    }
    return false;
  }

  get defaultValue() {
    return "";
  }
}

class arrayValueComponent extends Component {
  hasValue() {
    if (this.value) {
      return this.value.length > 0;
    }
    return false;
  }

  get defaultValue() {
    return [];
  }
}

class numberValueComponent extends Component {
  hasValue() {
    if (this.value === undefined) return false;
    return this.value !== 0;
  }

  get defaultValue() {
    return 0;
  }
}

class objectValueComponent extends Component {
  hasValue() {
    return true;
  }

  get defaultValue() {
    return {};
  }
}

class radio extends stringValueComponent {
  get label() {
    if (this.hasValue()) {
      const dict = this.column.dicData.find(item => {
        return item.value === this.value;
      });
      if (dict) {
        return dict.label === undefined ? undefined : dict.label;
      }
    }
    return undefined;
  }

  handleDisplay(columns) {
    let map = new Map();
    columns.forEach(item => {
      map.set(item.prop, item);
    });
    this.handleDisplayByMap(map);
  }

  handleDisplayByMap(map) {
    if (this.hasValue()) {
      // 显示当前值关联组件，隐藏其他值关联组件
      let promise = new Promise((resolve, reject) => {
        // 要显示组件的prop
        let openProps = [];
        // 需要隐藏的组件prop
        let closeProps = [];
        // 当前组件选中的值
        let values = [this.value];
        // 当前选中值对应的dicData的joinSubjects就是要显示的组件的prop
        this.column.dicData.forEach(dic => {
          if (values.includes(dic.value)) {
            if (dic.joinSubjects && dic.joinSubjects.length > 0) {
              openProps = openProps.concat(dic.joinSubjects);
            }
          } else {
            if (dic.joinSubjects && dic.joinSubjects.length > 0) {
              closeProps = closeProps.concat(dic.joinSubjects);
            }
          }
        });
        let result = {
          openProps,
          closeProps
        };
        resolve(result);
      })
        .then(result => {
          let openProps = result.openProps;
          let closeProps = result.closeProps;

          //
          let setNullProps = [];
          let component;
          openProps.forEach(prop => {
            component = map.get(prop);
            if (component && component !== undefined) {
              component.display = true;
            }
          });
          closeProps.forEach(prop => {
            let item = map.get(prop);
            if (item && item.display === true) {
              setNullProps.push(item);
              item.display = false;
            }
          });
          return setNullProps;
        })
        .then(result => {
          result.forEach(item => {
            const component = createComponent(item, this.form);
            component.setNull();
            component.handleDisplayByMap(map);
          });
        });
    } else {
      new Promise((resolve, reject) => {
        //隐藏所有关联组件
        let closeProps = [];
        this.column.dicData.forEach(dic => {
          if (dic.joinSubjects && dic.joinSubjects.length > 0) {
            closeProps = closeProps.concat(dic.joinSubjects);
          }
        });
        resolve(closeProps);
      }).then(closeProps => {
        closeProps.forEach(prop => {
          let item = map.get(prop);
          if (item && item.display === true) {
            const component = createComponent(item, this.form);
            component.setNull();
            component.handleDisplayByMap(map);
            item.display = false;
          }
        });
      });
    }
  }
}

class checkbox extends arrayValueComponent {
  get label() {
    if (this.hasValue()) {
      const dicts = this.column.dicData
        .filter(item => {
          return this.value.includes(item.value);
        })
        .map(item => {
          return item.label;
        });
      if (dicts.length > 0) {
        return dicts.join(",");
      }
      return undefined;
    }
    return undefined;
  }

  handleDisplay(columns) {
    let map = new Map();
    columns.forEach(item => {
      map.set(item.prop, item);
    });
    this.handleDisplayByMap(map);
  }

  handleDisplayByMap(map) {
    if (this.hasValue()) {
      // 显示当前值关联组件，隐藏其他值关联组件
      let promise = new Promise((resolve, reject) => {
        // 要显示组件的prop
        let openProps = [];
        // 需要隐藏的组件prop
        let closeProps = [];
        // 当前组件选中的值
        let values = [...this.value];
        // 当前选中值对应的dicData的joinSubjects就是要显示的组件的prop
        this.column.dicData.forEach(dic => {
          if (values.includes(dic.value)) {
            if (dic.joinSubjects && dic.joinSubjects.length > 0) {
              openProps = openProps.concat(dic.joinSubjects);
            }
          } else {
            if (dic.joinSubjects && dic.joinSubjects.length > 0) {
              closeProps = closeProps.concat(dic.joinSubjects);
            }
          }
        });
        let result = {
          openProps,
          closeProps
        };
        resolve(result);
      })
        .then(result => {
          let openProps = result.openProps;
          let closeProps = result.closeProps;
          //
          let setNullProps = [];
          openProps.forEach(prop => {
            map.get(prop).display = true;
          });
          closeProps.forEach(prop => {
            let item = map.get(prop);
            if (item && item.display === true) {
              setNullProps.push(item);
              item.display = false;
            }
          });
          return setNullProps;
        })
        .then(result => {
          result.forEach(item => {
            const component = createComponent(item, this.form);
            component.setNull();
            component.handleDisplayByMap(map);
          });
        });
    } else {
      new Promise((resolve, reject) => {
        //隐藏所有关联组件
        let closeProps = [];
        this.column.dicData.forEach(dic => {
          if (dic.joinSubjects && dic.joinSubjects.length > 0) {
            closeProps = closeProps.concat(dic.joinSubjects);
          }
        });
        resolve(closeProps);
      }).then(closeProps => {
        closeProps.forEach(prop => {
          let item = map.get(prop);
          if (item && item.display === true) {
            const component = createComponent(item, this.form);
            component.setNull();
            component.handleDisplayByMap(map);
            item.display = false;
          }
        });
      });
    }
  }
}

class input extends stringValueComponent {}

class password extends stringValueComponent {}

class textarea extends stringValueComponent {}

class number extends numberValueComponent {}

class select extends Component {
  setDefaultValue(that) {
    //多选
    if (this.column.multiple) {
      that.$set(this.form, this.column.prop, []);
    }
    //单选
    else {
      that.$set(this.form, this.column.prop, "");
    }
  }

  hasValue() {
    if (this.value) {
      return this.value.length > 0;
    }
    return false;
  }

  get label() {
    if (this.hasValue()) {
      if ("remote" === this.column.dicType) {
        // 先拿缓存
        let data = sessionStorage.getItem(`remoteData-${this.column.dicUrl}`);
        let label = "";
        if (data) {
          let remoteSelectOptions = JSON.parse(data);
          if (this.column.multiple) {
            remoteSelectOptions.forEach(option => {
              if (this.value.includes(option.dictValue)) {
                label += " " + option.dictLabel;
              }
            });
          } else {
            remoteSelectOptions.some(option => {
              if (this.value === option.dictValue) {
                label = option.dictLabel;
                return true;
              }
            });
          }
        }
        return label;
      }
      //多选
      if (this.column.multiple) {
        const dicts = this.column.dicData
          .filter(item => {
            return this.value.includes(item.value);
          })
          .map(item => {
            return item.label;
          });
        if (dicts.length > 0) {
          return dicts.join(",");
        }
        return undefined;
      }
      //单选
      else {
        const dict = this.column.dicData.find(item => {
          return item.value === this.value;
        });
        return dict === undefined ? undefined : dict.label;
      }
    }
    return undefined;
  }

  handleDisplay(columns) {
    let map = new Map();
    columns.forEach(item => {
      map.set(item.prop, item);
    });
    this.handleDisplayByMap(map);
  }

  handleDisplayByMap(map) {
    if (this.hasValue()) {
      // 显示当前值关联组件，隐藏其他值关联组件
      let promise = new Promise((resolve, reject) => {
        // 要显示组件的prop
        let openProps = [];
        // 需要隐藏的组件prop
        let closeProps = [];
        // 当前组件选中的值
        let values =
          this.value instanceof Array ? [...this.value] : [this.value];
        // 当前选中值对应的dicData的joinSubjects就是要显示的组件的prop
        this.column.dicData.forEach(dic => {
          if (values.includes(dic.value)) {
            if (dic.joinSubjects && dic.joinSubjects.length > 0) {
              openProps = openProps.concat(dic.joinSubjects);
            }
          } else {
            if (dic.joinSubjects && dic.joinSubjects.length > 0) {
              closeProps = closeProps.concat(dic.joinSubjects);
            }
          }
        });
        let result = {
          openProps,
          closeProps
        };
        resolve(result);
      })
        .then(result => {
          let openProps = result.openProps;
          let closeProps = result.closeProps;
          //
          let setNullProps = [];
          openProps.forEach(prop => {
            if (!!map.get(prop)) {
              map.get(prop).display = true;
            }
          });
          closeProps.forEach(prop => {
            let item = map.get(prop);
            if (item && item.display === true) {
              setNullProps.push(item);
              item.display = false;
            }
          });
          return setNullProps;
        })
        .then(result => {
          result.forEach(item => {
            const component = createComponent(item, this.form);
            component.setNull();
            component.handleDisplayByMap(map);
          });
        });
    } else {
      new Promise((resolve, reject) => {
        //隐藏所有关联组件
        let closeProps = [];
        this.column.dicData.forEach(dic => {
          if (dic.joinSubjects && dic.joinSubjects.length > 0) {
            closeProps = closeProps.concat(dic.joinSubjects);
          }
        });
        resolve(closeProps);
      }).then(closeProps => {
        closeProps.forEach(prop => {
          let item = map.get(prop);
          if (item && item.display === true) {
            const component = createComponent(item, this.form);
            component.setNull();
            component.handleDisplayByMap(map);
            item.display = false;
          }
        });
      });
    }
  }
}

class cascader extends arrayValueComponent {
  get label() {
    if (this.hasValue()) {
      let current = this.column.dicData;
      const result = [];
      this.value.forEach(item => {
        const dict = current.find(dict => {
          return dict.value === item;
        });
        result.push(dict.label);
        current = dict.children;
      });
      if (result.length > 0) {
        return result.join("/");
      }
      return undefined;
    }
    return undefined;
  }
}

class date extends stringValueComponent {}

class time extends stringValueComponent {
  get label() {
    let val = this.value;
    if (/^(\d{2}:\d{2}):(\d{2})$/g.test(val)) {
      return val.substring(0, val.lastIndexOf(":"));
    } else {
      return this.value;
    }
  }
}

class datetime extends stringValueComponent {
  get label() {
    let val = this.value;
    if (/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}):(\d{2})$/g.test(val)) {
      return moment(val).format("YYYY-MM-DD HH:mm");
    } else {
      return this.value;
    }
  }
}

class daterange extends arrayValueComponent {
  hasValue() {
    if (this.value) {
      return this.value.length === 2;
    }
    return false;
  }

  get label() {
    if (this.hasValue()) {
      return `${this.value[0]} 至 ${this.value[1]}`;
    }
    return undefined;
  }
}

class timerange extends arrayValueComponent {
  hasValue() {
    if (this.value) {
      return this.value.length === 2;
    }
    return false;
  }

  setDefaultValue(that) {
    //有配置的默认值则使用配置的默认值
    if (this.column.value) {
      that.$set(this.form, this.column.prop, this.column.value);
    }
    //有值 赋值
    else if (this.hasValue()) {
      this.value = this.defaultValue;
    }
    //没值 初始化成默认值
    else {
      that.$set(this.form, this.column.prop, [new Date(), new Date()]);
    }
  }

  get label() {
    if (this.hasValue()) {
      let first = this.trimSecond(this.value[0]);
      let second = this.trimSecond(this.value[1]);
      return `${first} 至 ${second}`;
    }
    return undefined;
  }

  trimSecond(val) {
    if (/^(\d{2}:\d{2}):(\d{2})$/g.test(val)) {
      return val.substring(0, val.lastIndexOf(":"));
    } else {
      return val;
    }
  }
}

class datetimerange extends arrayValueComponent {
  hasValue() {
    if (this.value) {
      return this.value.length === 2;
    }
    return false;
  }

  get label() {
    if (this.hasValue()) {
      let first = this.trimSecond(this.value[0]);
      let second = this.trimSecond(this.value[1]);
      return `${first} 至 ${second}`;
    }
    return undefined;
  }

  trimSecond(val) {
    if (/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}):(\d{2})$/g.test(val)) {
      return moment(val).format("YYYY-MM-DD HH:mm");
    } else {
      return val;
    }
  }
}

class map extends objectValueComponent {
  hasValue() {
    if (this.value) {
      return (
        this.value.formattedAddress && this.value.formattedAddress.length > 0
      );
    }
    return false;
  }

  get label() {
    if (this.hasValue()) {
      return this.value.formattedAddress;
    }
    return undefined;
  }

  getRule() {
    let result = [];
    let rules = this.column.rules;
    if (rules && rules.length > 0) {
      result[0] = {};
      result[0].message = rules[0].message;
      result[0].validator = (rule, value, callback) => {
        if (!value.formattedAddress) {
          return callback(new Error(result[0].message));
        } else {
          callback();
        }
      };
      result.push(rules[0]);
      return result;
    }
    return [];
  }
}

class regionSelect extends objectValueComponent {
  hasValue() {
    if (this.value) {
      return this.value.name && this.value.name.length > 0;
    }
    return false;
  }

  get label() {
    if (this.hasValue()) {
      if (this.value.detailedAddress) {
        return this.value.name + this.value.detailedAddress;
      }
      return this.value.name;
    }
    return undefined;
  }

  get defaultValue() {
    return { ids: null, name: null, detailedAddress: null };
  }

  getRule() {
    let result = [];
    let rules = this.column.rules;
    if (rules && rules.length > 0) {
      result[0] = {};
      result[0].message = rules[0].message;
      result[0].validator = (rule, value, callback) => {
        if (!value.name) {
          return callback(new Error(result[0].message));
        } else {
          callback();
        }
      };
      result.push(rules[0]);
      return result;
    }
    return [];
  }
}

class upload extends arrayValueComponent {}

class autoFill extends stringValueComponent {}

class group extends objectValueComponent {
  // group
  setDefaultValue(that) {
    this.column.column.forEach(i => {
      if (i.display) {
        const component = createComponent(i, this.form[this.column.prop]);
        component.setDefaultValue(that);
        component.handleDisplay(this.column.column);
      }
    });
  }
}

class dynamic extends arrayValueComponent {
  setDefaultValue(that) {
    this.form[this.column.prop] = [];
  }
}

class empty extends stringValueComponent {
  hasValue() {
    return false;
  }

  get defaultValue() {
    return "";
  }
}

export default function createComponent(column, form) {
  switch (column.type) {
    case "radio":
      return new radio(column, form);
    case "checkbox":
      return new checkbox(column, form);
    case "input":
    case "description":
    case "title":
    case "bigtitle":
      return new input(column, form);
    case "password":
      return new password(column, form);
    case "textarea":
      return new textarea(column, form);
    case "number":
      return new number(column, form);
    case "select":
      return new select(column, form);
    case "cascader":
      return new cascader(column, form);
    case "date":
      return new date(column, form);
    case "time":
      return new time(column, form);
    case "datetime":
      return new datetime(column, form);
    case "daterange":
      return new daterange(column, form);
    case "timerange":
      return new timerange(column, form);
    case "datetimerange":
      return new datetimerange(column, form);
    case "map":
      return new map(column, form);
    case "regionSelect":
      return new regionSelect(column, form);
    case "upload":
      return new upload(column, form);
    case "autoFill":
      return new autoFill(column, form);
    case "group":
      return new group(column, form);
    case "dynamic":
      return new dynamic(column, form);
    case "ASR":
      return new textarea(column, form);
    case "measureTemperature":
      return new number(column, form);
    case "table":
      return new empty(column, form);
    default:
      if (column.component === "el-divider") {
        return new empty(column, form);
      } else {
        throw new Error(`unknown type: ${column.type}`);
      }
  }
}
