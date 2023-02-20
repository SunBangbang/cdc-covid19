import DataSet from "@antv/data-set";
import { registerTheme, Chart } from "@antv/g2";
import { Bar, Column } from "@antv/g2plot";
import { HeatmapLayer, Scene } from "@antv/l7";
import { GaodeMap } from "@antv/l7-maps";
import G6 from "@antv/g6";
import insertCss from "insert-css";
import sm4Utils from "@/utils/sm4";
import store from "@/store";

const user = require("../assets/image/user.png");

var echarts = require("echarts");

/**
 * 获取文件
 * @param {*} url
 */
const getBlob = (url, method = "GET", json, token) => {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    // xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
    // xhr.setRequestHeader('Access-Control-Allow-Headers', 'Content-Type');
    // xhr.setRequestHeader('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    xhr.responseType = "blob";
    xhr.dataType = "JSONP";
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(xhr.response);
      }
    };
    if (token) {
      xhr.setRequestHeader("Authorization", "Bearer " + token);
    }
    if ("post" === method || "POST" === method) {
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      if (store.state.cryptoOpen === true) {
        const sm4Key = !!store.state.keyForSm4
          ? store.state.keyForSm4
          : localStorage.getItem("keyForSm4");
        let tmpString = JSON.stringify(json);
        const sendData = sm4Utils.encrypt(tmpString, sm4Key);
        xhr.send(JSON.stringify(sendData));
      } else {
        xhr.send(JSON.stringify(json));
      }
    } else {
      xhr.send();
    }
  });
};

/**
 * 保存文件
 * @param {*} blob
 * @param {*} filename
 */
export const saveAs = (blob, filename) => {
  if (window.navigator.msSaveOrOpenBlob) {
    navigator.msSaveBlob(blob, filename);
  } else {
    const link = document.createElement("a");
    const body = document.querySelector("body");

    link.href = window.URL.createObjectURL(blob); // 创建对象url
    link.download = filename;

    // fix Firefox
    link.style.display = "none";
    body.appendChild(link);

    link.click();
    body.removeChild(link);

    window.URL.revokeObjectURL(link.href); // 通过调用 URL.createObjectURL() 创建的 URL 对象
  }
};

/**
 * 导出文件
 * @param {*} url
 * @param {*} filename
 */
export const download = (url) => {
  console.log("url:", url);
  const temArr = url.split("/");
  const filename = temArr[temArr.length - 1];
  getBlob(url).then((blob) => {
    saveAs(blob, filename);
  });
};

/**
 * POST请求导出文件
 * @param url
 * @param fileName
 * @param reqJson
 * @param token
 */
export const postDownload = (url, fileName, reqJson, token) => {
  console.log("url:", url);
  const temArr = url.split("/");
  getBlob(url, "post", reqJson, token).then((blob) => {
    saveAs(blob, fileName);
  });
};

/**
 * 创建图表绘制区域
 *
 * @param {*画布父结点id: string} pid
 * @param {*画布id: string} id
 */
const createElementForDrawingChart = (pid, id) => {
  if (pid === id) {
    this.$message.error("图表绘图区域父区域和子区域属性id的值不能相同,");
    return;
  }
  const parentEle = document.getElementById(pid);
  let childNode = document.createElement("div");
  childNode.setAttribute("id", id);
  if (parentEle !== null) {
    if (
      document.getElementById(id) !== null &&
      document.getElementById(id) !== undefined
    ) {
      parentEle.removeChild(parentEle.childNodes[0]);
    }
    parentEle.appendChild(childNode);
  } else {
    console.log("画面区域不存在，请重新检查输入参数");
    return;
  }
};
/**
 * 分组柱状图（即antv/g2的堆叠条形图）
 * @param {*图表数据} data
 * @param {*画布父结点id: string} pid
 * @param {*画布id: string} id
 * @param {*展开字段集:Array['string']} fields
 * @param {*保留字段集，默认为除fields以外的所有字段: Array['string']} retainsFields
 * @param {*y轴展示的字段: string} yAxisField
 * @param {*key字段（自定义展开字段集的描述）:string} key
 * @param {*value字段（自定义展开字段的值的意义）:string} value
 */
export const drawGroupHistogram = (
  data,
  pid,
  id,
  fields,
  retainsFields,
  yAxisField,
  key,
  value
) => {
  createElementForDrawingChart(pid, id);
  const ds = new DataSet();
  const dv = ds.createView().source(data);
  dv.transform({
    type: "fold",
    fields: fields,
    key: key,
    value: value,
    retains: retainsFields,
  });

  const chart = new Chart({
    container: id,
    autoFit: true,
    height: 500,
  });
  registerTheme("newTheme", { minColumnWidth: 20, maxColumnWidth: 60 });
  chart.theme("newTheme");
  chart.coordinate().transpose();

  chart.data(dv.rows);
  chart.scale(value, { nice: true });

  chart.axis(value, {
    label: {
      formatter(text, item, index) {
        return !!Number.isInteger(Number(text)) ? Number(text) : "";
      },
    },
  });

  chart.tooltip({
    shared: true,
    showMarkers: false,
  });

  chart
    .interval()
    .adjust("stack")
    .position(`${yAxisField}*${value}`)
    .color(key);

  // chart.columnStyle(
  //     {fill: '#03C4DC'}
  // )
  chart.interaction("active-region");

  chart.render();
};
/**
 * 堆叠条形图（即antv/g2的分组条形图）
 * @param {*图表数据} data
 * @param {*画布父结点id: string} pid
 * @param {*画布id: string} id
 * @param {*展开字段集:Array['string']} fields
 * @param {*x轴展示字段:string} xAxisField
 * @param {*y轴展示字段:string} yAxisField
 * @param {*y轴别名:string} yAxisFieldAlias
 */
export const drawStackedBar = (
  data,
  pid,
  id,
  fields,
  xAxisField,
  yAxisField,
  yAxisFieldAlias
) => {
  createElementForDrawingChart(pid, id);
  const chart = new Chart({
    container: id,
    autoFit: true,
    height: 500,
    padding: [15, 0, 0, 60],
  });

  chart.data(data);
  chart.scale(yAxisField, {
    alias: yAxisFieldAlias,
  });

  chart.axis(yAxisField, false);
  chart.coordinate().transpose();
  chart.facet("mirror", {
    fields: fields,
    transpose: true,
    showTitle: true,
    eachView: (view, facet) => {
      const facetIndex = facet.columnIndex;
      if (facetIndex === 0) {
        view.axis(xAxisField, {
          position: "top",
          label: {
            style: {
              fill: "#aaaaaa",
              fontSize: 12,
            },
          },
          tickLine: {
            alignTick: false,
            length: 0,
          },
          line: null,
        });
      } else {
        view.axis(xAxisField, false);
      }
      const color = facetIndex === 0 ? "#1890ff" : "#2fc25b";
      view
        .interval()
        .position(`${xAxisField}*${yAxisField}`)
        .color(color)
        .size(30)
        .label(xAxisField, (val) => {
          let offset = facetIndex === 1 ? -4 : 4;
          let shadowBlur = 2;
          let textAlign = facetIndex === 1 ? "end" : "start";
          let fill = "white";
          if (val < 15) {
            offset = facetIndex === 1 ? 4 : -4;
            textAlign = facetIndex === 1 ? "start" : "end";
            fill = "#666666";
            shadowBlur = 0;
          }
          return {
            offset,
            style: {
              fill,
              stroke: null,
              shadowBlur,
              shadowColor: "rgba(0, 0, 0, .45)",
              textAlign,
            },
          };
        });
    },
  });
  chart.interaction("element-highlight");
  chart.render();
};

/**
 * 堆叠柱状图
 * @param {*图表数据} data
 * @param {*画布父结点id: string} pid
 * @param {*画布id: string} id
 * @param {*展开字段集:Array['string']} fields
 * @param {*x轴展示字段:string} xAxisField
 * @param {*y轴展示字段:string} yAxisField
 * @param {*颜色字段：string} colorField
 */

export const drawStackedHistogram = (
  data,
  pid,
  id,
  xAxisField,
  yAxisField,
  colorField
) => {
  createElementForDrawingChart(pid, id);
  const chart = new Chart({
    container: id,
    autoFit: true,
    height: 500,
  });

  registerTheme("newTheme", { minColumnWidth: 20, maxColumnWidth: 60 });
  chart.theme("newTheme");

  chart.data(data);
  chart.scale(xAxisField, {
    nice: true,
  });

  chart.axis(xAxisField, {
    label: {
      formatter(text, item, index) {
        return !!Number.isInteger(Number(text)) ? Number(text) : "";
      },
    },
  });

  chart.axis(yAxisField, {
    label: {
      formatter(text, item, index) {
        return !!Number.isInteger(Number(text)) ? Number(text) : "";
      },
    },
  });

  chart.tooltip({
    shared: true,
    showMarkers: false,
  });

  chart
    .interval()
    .position(`${xAxisField}*${yAxisField}`)
    .color(colorField)
    .adjust("stack");

  chart.interaction("active-region");

  chart.render();
};
/**
 *
 * @param {*图表数据} data
 * @param {*画布父结点id: string} pid
 * @param {*画布id: string} id
 * @param {*x轴展示字段:string} xAxisField
 * @param {*y轴展示字段:string} yAxisField
 * @param {*颜色字段：string} colorField
 */
export const drawWiggleLine = (
  data,
  pid,
  id,
  xAxisField,
  yAxisField,
  colorField
) => {
  createElementForDrawingChart(pid, id);
  const chart = new Chart({
    container: id,
    autoFit: true,
    height: 500,
  });

  chart.data(data);
  chart.scale({
    xAxisField: {
      range: [0, 1],
    },
    yAxisField: {
      nice: true,
    },
  });

  chart.tooltip({
    showCrosshairs: true,
    shared: true,
  });

  chart.axis(yAxisField);

  chart
    .line()
    .position(`${xAxisField}*${yAxisField}`)
    .color("type")
    .shape("smooth");

  chart
    .point()
    .position(`${xAxisField}*${yAxisField}`)
    .color(colorField)
    .shape("circle");

  chart.render();
};

/**
 * 基础条形图
 * @param {*图表数据} data
 * @param {*画布父结点id: string} pid
 * @param {*画布id: string} id
 * @param {*x轴展示字段:string} xAxisField
 * @param {*y轴展示字段:string} yAxisField
 */
export const drawBisicBar = (
  data,
  pid,
  id,
  xAxisField,
  yAxisField,
  isBigData
) => {
  createElementForDrawingChart(pid, id);
  let dynamicBarWidth = data.length > 2 ? 0.6 : 0.2;
  let dynamicHeight = data.length > 2 ? 300 : 200;

  if (isBigData) {
    const barPlot = new Bar(id, {
      autoFit: false,
      height: dynamicHeight,
      data,
      xField: yAxisField,
      yField: xAxisField,
      barWidthRatio: dynamicBarWidth,
      appendPadding: [0, 30, 0, 30],
      meta: {
        total: {
          alias: "人数",
        },
      },
      barStyle: {
        fill: "#03C4DC",
      },
      xAxis: {
        grid: {
          line: {
            style: {
              lineDash: [4, 5],
            },
          },
        },
      },
    });

    barPlot.render();
  } else {
    const barPlot = new Bar(id, {
      autoFit: false,
      height: dynamicHeight,
      data,
      xField: yAxisField,
      yField: xAxisField,
      barWidthRatio: dynamicBarWidth,
      appendPadding: [0, 30, 0, 30],
      meta: {
        total: {
          alias: "人数",
          tickInterval: 1,
        },
      },
      barStyle: {
        fill: "#03C4DC",
      },
      xAxis: {
        grid: {
          line: {
            style: {
              lineDash: [4, 5],
            },
          },
        },
      },
    });

    barPlot.render();
  }

  // const chart = new Chart({
  //     container: id,
  //     autoFit: true,
  //     width: 1196,
  //     height: 200,
  // });
  //
  // chart.data(data);
  // chart.scale(yAxisField, { nice: true, alias: '人数' });
  // chart.coordinate().transpose();
  // chart.tooltip({
  //     showMarkers: false
  // });
  // chart.interaction('active-region');
  // chart.interval().position(`${xAxisField}*${yAxisField}*`);
  // chart.render();
};
/**
 * 基础柱状图
 * @param {*图表数据} data
 * @param {*画布父结点id: string} pid
 * @param {*画布id: string} id
 * @param {*x轴展示字段:string} xAxisField
 * @param {*y轴展示字段:string} yAxisField
 */
export const drawBisicHistogram = (
  data,
  pid,
  id,
  xAxisField,
  yAxisField,
  isBigData
) => {
  createElementForDrawingChart(pid, id);
  if (isBigData) {
    const columnPlot = new Column(id, {
      data,
      xField: xAxisField,
      yField: yAxisField,
      columnWidthRatio: 0.3,
      xAxis: {
        label: {
          autoHide: false,
          autoRotate: false,
          //rotate: 0.2,
          formatter(text) {
            return text.substring(0, 10);
          },
        },
      },
      slider: {
        start: 0,
        end: 1,
      },
      meta: {
        total: {
          alias: "人数",
        },
      },
    });

    columnPlot.render();
  } else {
    const columnPlot = new Column(id, {
      data,
      xField: xAxisField,
      yField: yAxisField,
      columnWidthRatio: 0.3,
      xAxis: {
        label: {
          autoHide: false,
          autoRotate: false,
          //rotate: 0.2,
          formatter(text) {
            return text.substring(0, 10);
          },
        },
      },
      slider: {
        start: 0,
        end: 1,
      },
      meta: {
        total: {
          alias: "人数",
          tickInterval: 1,
        },
      },
    });

    columnPlot.render();
  }

  // const chart = new Chart({
  //     container: id,
  //     autoFit: true,
  //     height: 200,
  // });
  //
  // chart.data(data);
  // chart.scale(yAxisField, {
  //     nice: true,
  // });
  //
  // chart.tooltip({
  //     showMarkers: false
  // });
  // chart.interaction('active-region');
  //
  // chart.interval().position(`${xAxisField}*${yAxisField}`);
  //
  // chart.render();
};

/**
 *
 * @param {*图表数据} data
 * @param {*画布父结点id: string} pid
 * @param {*画布id: string} id
 * @param {*关键字字段} itemField
 * @param {*数据字段} percentField
 */

export const drawBisicPie = (data, pid, id, itemField, percentField) => {
  createElementForDrawingChart(pid, id);
  const chart = new Chart({
    container: id,
    autoFit: true,
    height: 200,
  });

  chart.coordinate("theta", {
    radius: 0.75,
  });

  chart.data(data);

  chart.scale(`${percentField}`, {
    formatter: (val) => {
      val = (val * 100).toFixed(1) + "%";
      return val;
    },
  });

  chart.tooltip({
    showTitle: false,
    showMarkers: false,
  });

  chart
    .interval()
    .position(`${percentField}`)
    .color(`${itemField}`)
    .label(`${percentField}`, {
      content: (itemdata) => {
        return `${itemdata[itemField]}: ${(
          itemdata[percentField] * 100
        ).toFixed(1)}%`;
      },
    })
    .adjust("stack");

  chart.interaction("element-active");

  chart.render();
};
/**
 *
 * @param {*} pid
 * @param {*} id
 */
export const drawAreaMap = (pid, id) => {
  createElementForDrawingChart(pid, id);

  //todo
};
export const drawHeatMap = (data, pid, id) => {
  if (data && data.length > 0) {
    createElementForDrawingChart(pid, id);
    console.log(id);
    const scene = new Scene({
      id: id,
      logoVisible: false,
      map: new GaodeMap({
        style: "normal",
        pitch: 0,
        center: data[0].coord,
        zoom: 10,
        plugin: ['AMap.CircleEditor']
      }),
    });

    scene.on("loaded", () => {
      window.AMap.plugin(['AMap.CircleEditor'], () => {
        const layer = new HeatmapLayer({})
          .source(data, {
            parser: {
              type: "json",
              coordinates: "coord",
            },
          })
          .shape("heatmap")
          .size("coordinates", [0, 1.0]) // weight映射通道
          .style({
            intensity: 2,
            radius: 20,
            opacity: 1.0,
            rampColors: {
              colors: [
                "#FF4818",
                "#F7B74A",
                "#FFF598",
                "#91EABC",
                "#2EA9A1",
                "#206C7C",
              ].reverse(),
              positions: [0, 0.2, 0.4, 0.6, 0.8, 1.0],
            },
          });
        scene.addLayer(layer);
      });
    })
  }
};

export const drawAdminMap = (pid, id) => {
  createElementForDrawingChart(pid, id);
  let myChart = echarts.init(document.getElementById(id));
  console.log(myChart);
  myChart.resize({
    width: 1196,
    height: 500,
  });

  //todo
  // 使用刚指定的配置项和数据显示图表。
  myChart.setOption(option);
  //  })
};

export const base64DataURLToArrayBuffer = (dataURL) => {
  const base64Regex = /^data:image\/(png|jpg|svg|svg\+xml);base64,/;
  if (!base64Regex.test(dataURL)) {
    return false;
  }
  const stringBase64 = dataURL.replace(base64Regex, "");
  let binaryString;
  if (typeof window !== "undefined") {
    binaryString = window.atob(stringBase64);
  } else {
    binaryString = Buffer.from(stringBase64, "base64").toString("binary");
  }
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    const ascii = binaryString.charCodeAt(i);
    bytes[i] = ascii;
  }
  return bytes.buffer;
};

/**
 * 关系树
 * @param {*图表数据} data
 * @param {*画布父结点id: string} pid
 * @param {*画布id: string} id
 * @param {*画布id: string} id
 * @param {*提示框显示对象tooltip} tooltip
 */
export const drawTree = (data, id, tooltip) => {
  if (Object.getOwnPropertyNames(data).length === 0) {
    data = {
      id: "1",
      label: "A",
      children: [
        {
          id: "2",
          label: "B",
          children: [
            { id: "3", label: "C" },
            { id: "4", label: "D" },
          ],
        },
      ],
    };
  }
  const container = document.getElementById(id);
  if (!container) return;
  let child = container.childNodes;
  if (child && child.length > 0) {
    child.forEach((item) => container.removeChild(item));
  }
  let parentNode = container.parentNode;
  // console.log('parentNode:', parentNode, ' ', parentNode.clientHeight, ' ', parentNode.clientWidth)
  const width = parentNode.clientWidth - 40;
  const height = parentNode.scrollHeight > 800 ? parentNode.scrollHeight : 800;

  // console.log('drawtree......', width, '  ', height)
  const graph = new G6.TreeGraph({
    container: id,
    width,
    height,
    linkCenter: true,
    modes: {
      default: [
        {
          type: "collapse-expand",
          onChange: function onChange(item, collapsed) {
            const data = item.getModel();
            data.collapsed = collapsed;
            return true;
          },
        },
        "drag-canvas",
        "zoom-canvas",
        {
          type: "tooltip", // 提示框
          formatText(model) {
            // 提示框文本内容
            let arr = [];
            Object.keys(tooltip).forEach((key) => {
              if (model[key]) {
                arr.push(tooltip[key] + ": " + model[key]);
              }
            });

            return arr.join("<br/>");
          },
        },
      ],
    },
    defaultNode: {
      size: 22,
      anchorPoints: [
        [0, 0.5],
        [1, 0.5],
      ],
    },
    defaultEdge: {
      type: "cubic-vertical",
    },
    layout: {
      type: "compactBox",
      direction: "TB",
      getId: function getId(d) {
        return d.id;
      },
      getHeight: function getHeight() {
        return 16;
      },
      getWidth: function getWidth() {
        return 16;
      },
      getVGap: function getVGap() {
        return 30;
      },
      getHGap: function getHGap() {
        return 30;
      },
    },
  });

  graph.node(function (node) {
    let position = "right";
    let rotate = 0;
    if (!node.children) {
      position = "bottom";
      rotate = Math.PI / 2;
    }
    return {
      label: node.label,
      labelCfg: {
        position,
        offset: 5,
        style: {
          rotate,
          textAlign: "start",
        },
      },
    };
  });
  graph.on("node:click", function (evt) {
    console.log("node click:", evt);
    console.log("node click:", evt.item._cfg.model);
  });

  graph.data(data);
  graph.render();
  graph.fitView();

  if (typeof window !== "undefined")
    window.onresize = () => {
      if (!graph || graph.get("destroyed")) return;
      if (!container || !container.scrollWidth || !container.scrollHeight)
        return;
      graph.changeSize(container.scrollWidth, container.scrollHeight);
    };
};

export const drawChain = (pid, id, mocData) => {
  createElementForDrawingChart(pid, id);

  insertCss(`
  .g6-component-tooltip {
    background-color: rgba(0,0,0, 0.65);
    padding: 10px;
    box-shadow: rgb(174, 174, 174) 0px 0px 10px;
    width: fit-content;
    color: #fff;
    border-radius = 4px;
  }
`);

  const props = {
    data: mocData,
    config: {
      padding: [20, 50],
      defaultLevel: 3,
      defaultZoom: 0.8,
      modes: { default: ["zoom-canvas", "drag-canvas"] },
    },
  };

  const container = document.getElementById(id);
  const width = container.scrollWidth;
  const height = container.scrollHeight || 500;

  const defaultConfig = {
    width,
    height,
    modes: {
      default: ["zoom-canvas", "drag-canvas"],
    },
    fitView: true,
    animate: true,
    defaultNode: {
      type: "flow-rect",
    },
    defaultEdge: {
      type: "cubic-horizontal",
      style: {
        stroke: "#CED4D9",
      },
    },
    layout: {
      type: "indented",
      direction: "LR",
      dropCap: false,
      indent: 300,
      getHeight: () => {
        return 60;
      },
    },
  };

  const registerFn = () => {
    /**
     * 自定义节点
     */
    G6.registerNode(
      "flow-rect",
      {
        shapeType: "flow-rect",
        draw(cfg, group) {
          const { name = "", collapsed } = cfg;
          const grey = "#CED4D9";
          // 逻辑不应该在这里判断
          const rectConfig = {
            width: 202,
            height: 60,
            lineWidth: 1,
            fontSize: 12,
            fill: "#fff",
            radius: 4,
            stroke: grey,
            opacity: 1,
          };

          const nodeOrigin = {
            x: -rectConfig.width / 2,
            y: -rectConfig.height / 2,
          };

          const textConfig = {
            textAlign: "left",
            textBaseline: "center",
          };

          const rect = group.addShape("rect", {
            attrs: {
              x: nodeOrigin.x,
              y: nodeOrigin.y,
              ...rectConfig,
            },
          });

          group.addShape("image", {
            attrs: {
              x: -80,
              y: -25,
              img: user,
            },
            // must be assigned in G6 3.3 and later versions. it can be any value you want
            name: "image-shape",
          });

          // label title
          group.addShape("text", {
            attrs: {
              ...textConfig,
              x: -30,
              y: 10,
              text: name.length > 4 ? name.substr(0, 4) + "..." : name,
              fontSize: 25,
              opacity: 1,
              fill: "#000",
              cursor: "pointer",
            },
            name: "name-shape",
          });

          // collapse rect
          if (cfg.children && cfg.children.length) {
            group.addShape("rect", {
              attrs: {
                x: rectConfig.width / 2 - 8,
                y: -8,
                width: 16,
                height: 16,
                stroke: "rgba(0, 0, 0, 0.25)",
                cursor: "pointer",
                fill: "#fff",
              },
              name: "collapse-back",
              modelId: cfg.id,
            });

            // collpase text
            group.addShape("text", {
              attrs: {
                x: rectConfig.width / 2,
                y: -1,
                textAlign: "center",
                textBaseline: "middle",
                text: collapsed ? "+" : "-",
                fontSize: 16,
                cursor: "pointer",
                fill: "rgba(0, 0, 0, 0.25)",
              },
              name: "collapse-text",
              modelId: cfg.id,
            });
          }

          this.drawLinkPoints(cfg, group);
          return rect;
        },
        update(cfg, item) {
          const group = item.getContainer();
          this.updateLinkPoints(cfg, group);
        },
        setState(name, value, item) {
          if (name === "collapse") {
            const group = item.getContainer();
            const collapseText = group.find(
              (e) => e.get("name") === "collapse-text"
            );
            if (collapseText) {
              if (!value) {
                collapseText.attr({
                  text: "-",
                });
              } else {
                collapseText.attr({
                  text: "+",
                });
              }
            }
          }
        },
        getAnchorPoints() {
          return [
            [0, 0.5],
            [1, 0.5],
          ];
        },
      },
      "rect"
    );

    G6.registerEdge(
      "flow-cubic",
      {
        getControlPoints(cfg) {
          let controlPoints = cfg.controlPoints; // 指定controlPoints
          if (!controlPoints || !controlPoints.length) {
            const { startPoint, endPoint, sourceNode, targetNode } = cfg;
            const {
              x: startX,
              y: startY,
              coefficientX,
              coefficientY,
            } = sourceNode ? sourceNode.getModel() : startPoint;
            const { x: endX, y: endY } = targetNode
              ? targetNode.getModel()
              : endPoint;
            let curveStart = (endX - startX) * coefficientX;
            let curveEnd = (endY - startY) * coefficientY;
            curveStart = curveStart > 40 ? 40 : curveStart;
            curveEnd = curveEnd < -30 ? curveEnd : -30;
            controlPoints = [
              { x: startPoint.x + curveStart, y: startPoint.y },
              { x: endPoint.x + curveEnd, y: endPoint.y },
            ];
          }
          return controlPoints;
        },
        getPath(points) {
          const path = [];
          path.push(["M", points[0].x, points[0].y]);
          path.push([
            "C",
            points[1].x,
            points[1].y,
            points[2].x,
            points[2].y,
            points[3].x,
            points[3].y,
          ]);
          return path;
        },
      },
      "single-line"
    );
  };

  registerFn();

  const { data } = props;
  let graph = null;

  const initGraph = (data) => {
    if (!data) {
      return;
    }
    const { onInit, config } = props;
    const tooltip = new G6.Tooltip({
      // offsetX and offsetY include the padding of the parent container
      offsetX: 20,
      offsetY: 30,
      // the types of items that allow the tooltip show up
      // 允许出现 tooltip 的 item 类型
      itemTypes: ["node"],
      // custom the tooltip's content
      // 自定义 tooltip 内容
      getContent(e) {
        let arr = [];
        let model = e.item.getModel();
        // console.log('model:', model)
        let json = {
          姓名: model.name,
          证件号: model.identity,
          性别: model.gender === "0" ? "男" : (model.gender === "1" ? "女" : ""),
          手机号: model.phone,
        };
        if (json) {
          Object.keys(json).forEach((key) => {
            if (json[key]) {
              arr.push(
                '<label class="title">' +
                  key +
                  ":</label>" +
                  '<label class="content">' +
                  json[key] +
                  "</label>"
              );
            }
          });
        }
        const outDiv = document.createElement("div");
        outDiv.style.width = "250px";
        outDiv.innerHTML = arr.join("<br/>");
        return outDiv;
      },
      shouldBegin: (e) => {
        if (e.target.get("name") === "name-shape") return true;
        return false;
      },
    });
    graph = new G6.TreeGraph({
      container: id,
      ...defaultConfig,
      ...config,
      plugins: [tooltip],
    });
    if (typeof onInit === "function") {
      onInit(graph);
    }
    graph.data(data);
    graph.render();
    graph.zoom(config.defaultZoom || 1);

    const handleCollapse = (e) => {
      const target = e.target;
      const id = target.get("modelId");
      const item = graph.findById(id);
      const nodeModel = item.getModel();
      nodeModel.collapsed = !nodeModel.collapsed;
      graph.layout();
      graph.setItemState(item, "collapse", nodeModel.collapsed);
    };
    graph.on("collapse-text:click", (e) => {
      handleCollapse(e);
    });
    graph.on("collapse-back:click", (e) => {
      handleCollapse(e);
    });
  };

  initGraph(data);

  if (typeof window !== "undefined")
    window.onresize = () => {
      if (!graph || graph.get("destroyed")) return;
      if (!container || !container.scrollWidth || !container.scrollHeight)
        return;
      graph.changeSize(container.scrollWidth, container.scrollHeight);
    };
};
