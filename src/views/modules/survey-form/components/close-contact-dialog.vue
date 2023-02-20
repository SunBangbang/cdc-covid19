<template>
  <el-dialog
    title="密接图谱"
    id="elDialog"
    :visible.sync="dialogVisible"
    width="80%"
    top="5vh"
    :before-close="handleClose"
    :fullscreen="fullscreen"
    append-to-body
  >
    <div slot="title" class="">
      <span class="el-dialog__title" @click="fullScreenHandle()">
        <label>密接图谱</label>
        <svg
          class="icon-svg aui-navbar__icon-menu icon-full"
          aria-hidden="true"
        >
          <use xlink:href="#icon-fullscreen"></use>
        </svg>
      </span>
    </div>

    <div style="float: right; margin-top: -20px">
      <!--             <el-button type="primary" @click="exportImg" size="mini">导出图片</el-button>-->
      <el-button type="primary" @click="exportData" size="mini">导出</el-button>
      <el-button
        type="primary"
        @click="(dialogVisible = false), (fullscreen = false)"
        size="mini"
        >关 闭</el-button
      >
    </div>

    <div id="ccContainer" style="height: 100%"></div>
  </el-dialog>
</template>

<script>
import screenfull from "screenfull";
import { getKnownCloseContact } from "@/api/survey-form/closeContact";
import G6 from "@antv/g6";
import moment from "moment";
import { getDictDataList } from "@/utils";
import { isEmpty } from "@antv/util";

export default {
  name: "closeContactDialog",
  components: {},
  data() {
    return {
      maleHeadImg: require("@/assets/svg/male.png"),
      femaleHeadImg: require("@/assets/svg/female.png"),
      dialogVisible: false,
      sampleId: "",
      search: {}, //查询参数
      fullscreen: false,
      idNo: 1,
      nodeMap: null,
      nodeHasHandleChildMap: null,
      secondNodes: [],
      existedPersons: [],
      deletedLeafNodes: [], //点击后没有子节点的叶子节点
      graph: null,
      tooltip: null,
      persons: [], //所有节点，即所有人信息
      genderMap: {}, //性别
      ccOrScMap: {}, //密接/次密
      ccIdTypeMap: {}, //证件类型
      ccConctactFormMap: {}, //密接人接触方式
      ccConctactCondMap: {}, //密接人接触情况
    };
  },
  beforeDestroy() {
    console.log("close contact destroy......");
    if (this.graph) {
      this.graph.destroy();
      this.graph = null;
    }
    let container = document.getElementById("ccContainer");
    let child = container.childNodes;
    if (child && child.length > 0) {
      child.forEach((item) => container.removeChild(item));
    }

    if (this.tooltip) {
      this.tooltip.destroy();
      this.tooltip = null;
    }
  },
  created() {
    const that = this;
    G6.registerNode(
      "img-node",
      {
        options: {
          size: [60, 20],
          stroke: "#91d5ff",
          fill: "#91d5ff",
        },
        draw(cfg, group) {
          const styles = this.getShapeStyle(cfg);
          const { labelCfg = {} } = cfg;

          const w = styles.width;
          const h = styles.height;

          const keyShape = group.addShape("rect", {
            attrs: {
              ...styles,
              x: -w / 2,
              y: -h / 2,
            },
          });

          // console.log('draw:', ' w:', w, ' h:', h, ' height:', styles.height)
          /**
           * leftIcon 格式如下：
           *  {
           *    style: ShapeStyle;
           *    img: ''
           *  }
           */
          if (cfg.leftIcon) {
            const { style, img } = cfg.leftIcon;
            group.addShape("rect", {
              attrs: {
                x: 1 - w / 2,
                y: 1 - h / 2,
                width: 38,
                height: styles.height - 2,
                fill: "#8c8c8c",
                ...style,
                radius: [1],
              },
            });

            group.addShape("image", {
              attrs: {
                x: 1 - w / 2,
                y: 1 - h / 2,
                width: 38,
                height: styles.height - 2,
                img: img || require("@/assets/svg/unknown_1.png"),
              },
              name: "image-shape",
            });
          }

          if (!that.deletedLeafNodes.includes(cfg.id)) {
            const hasChildren = cfg.children && cfg.children.length > 0;
            let symbol;
            // console.log('draw marker.....', cfg, ' ', group)
            // console.log('collapse:', cfg.collapsed, ' ', hasChildren)
            if (hasChildren) {
              // cfg.collapsed = false
              // symbol = G6.Marker.collapse
              symbol = cfg.collapsed ? G6.Marker.expand : G6.Marker.collapse;
            } else {
              // cfg.collapsed = true
              symbol = G6.Marker.expand;
              // symbol = cfg.collapsed ? G6.Marker.expand : G6.Marker.collapse
            }
            group.addShape("marker", {
              attrs: {
                x: 52 - w / 2,
                y: 48 - h / 2,
                r: 6,
                stroke: "#73d13d",
                cursor: "pointer",
                symbol: symbol,
              },
              name: "collapse-icon",
            });
          }

          if (cfg.label) {
            group.addShape("text", {
              attrs: {
                ...labelCfg.style,
                text:
                  cfg.label.length > 6
                    ? cfg.label.substring(0, 5) + "..."
                    : cfg.label,
                x: 43 - w / 2,
                y: 25 - h / 2,
              },
            });
          }

          return keyShape;
        },
        update: (cfg, item) => {
          const group = item.getContainer();
          const icon = group.find((e) => e.get("name") === "collapse-icon");
          icon.attr(
            "symbol",
            cfg.collapsed ? G6.Marker.expand : G6.Marker.collapse
          );
        },
      },
      "rect"
    );

    G6.registerEdge("flow-line", {
      draw(cfg, group) {
        const startPoint = cfg.startPoint;
        const endPoint = cfg.endPoint;

        const { style } = cfg;
        const shape = group.addShape("path", {
          attrs: {
            stroke: style.stroke,
            endArrow: style.endArrow,
            path: [
              ["M", startPoint.x, startPoint.y],
              ["L", startPoint.x, (startPoint.y + endPoint.y) / 2],
              ["L", endPoint.x, (startPoint.y + endPoint.y) / 2],
              ["L", endPoint.x, endPoint.y],
            ],
          },
        });

        return shape;
      },
    });
  },
  methods: {
    handleClose(done) {
      done();
      this.fullscreen = false;
      this.dialogVisible = false;
    },
    fullScreenHandle() {
      if (!screenfull.enabled) {
        return this.$message({
          message: this.$t("fullscreen.prompt"),
          type: "warning",
          duration: 500,
        });
      }
      this.fullscreen = true;
      screenfull.toggle();
    },
    createMap(map, dictName) {
      let dict = getDictDataList(dictName);
      dict.forEach((item) => (map[item.dictValue] = item.dictLabel));
      // console.log('dict:', dict, ' ', this.genderMap)
    },
    loadDict() {
      this.ccOrScMap["0"] = "密接";
      this.ccOrScMap["1"] = "次密";

      this.createMap(this.genderMap, "gender");
      this.createMap(this.ccIdTypeMap, "close-contact-identity-type");
      this.createMap(this.ccConctactFormMap, "close-contact-form");
      this.createMap(this.ccConctactCondMap, "close-contact-cond");
    },
    init() {
      this.loadDict();

      this.idNo = 1;
      this.nodeMap = new Map();
      this.nodeHasHandleChildMap = new Map();
      this.existedPersons = [];
      this.deletedLeafNodes = [];

      // this.search = this.sampleId !== '' ? {sampleId: this.sampleId} : this.search
      this.search = isEmpty(this.search)
        ? { sampleId: this.sampleId }
        : this.search;
      // console.log("search cond:", this.search);
      delete this.search.participant;
      getKnownCloseContact(this.search).then((res) => {
        if (res.data.code === 0) {
          let list = res.data.data;
          if (list && list.length > 0) {
            let data = {};
            data.id = "node" + this.idNo;
            data.oid = list[0].oid;
            data.sampleId = list[0].sampleId;
            data.headImg = list[0].pptHeadImg == null ? "" : list[0].pptHeadImg;
            data.label = list[0].participant;
            data.identity = list[0].pptIdentity;
            data.contAddress = list[0].contAddress;
            // data.contTime = this.handleTime(list[0].contactTime);
            data.firstContDate = this.handleTime(list[0].firstContDate);
            data.lastContDate = this.handleTime(list[0].lastContDate);
            // data.idType = '身份证' //this.ccIdTypeMap[list[0].idType]
            data.gender = this.genderMap[list[0].pptGender];
            // 密接人年龄
            data.age = list[0].age;
            // 密接人联系电话
            data.contact = list[0].contact;
            // 密接人其他联系电话
            data.otherContact = list[0].otherContact;
            // 密接证件类型
            data.credentialsType = list[0].credentialsType;
            // 密接其他证件类型
            data.otherCredentialsType = list[0].otherCredentialsType;
            // 密接工作单位
            data.workPlace = list[0].workPlace;
            // 密接现住址
            data.address = list[0].address;
            // 密接接触地点类型
            data.placeType = list[0].placeType;
            // 密接接触地点具体名称
            data.placeName = list[0].placeName;
            // 密接其他工作场所
            data.otherWorkPlace = list[0].otherWorkPlace;
            // 密接其他发现途径
            data.foundWay = list[0].foundWay;
            // 密接与病例关系
            data.relation = list[0].relation;
            // 密接与病例接触情形
            data.cvcType = list[0].cvcType;
            // 密接是否有效防护
            data.protect = list[0].protect;
            // 密接人员类别
            data.staffType = list[0].staffType;
            // 密接是否曾出现症状
            data.hasSymptom = list[0].hasSymptom;

            data.children = [];
            this.updateHeadImg(data);

            let person = data.label + ":" + data.identity;
            this.nodeMap.set(person, this.idNo);
            this.nodeHasHandleChildMap.set(person, true);
            this.idNo++;
            list.forEach((item) => {
              let newNode = this.newNode(item);
              newNode.id = "node" + this.idNo;
              data.children.push(newNode);

              person = item.personName + ":" + item.personIdentity;
              this.nodeMap.set(person, this.idNo);
              this.idNo++;
              this.secondNodes.push(newNode.id);
              if (item.children == 0) {
                this.deletedLeafNodes.push(newNode.id);
              }
            });
            // console.log('data:', data)
            const container = document.getElementById("ccContainer");
            let child = container.childNodes;
            if (child && child.length > 0) {
              child.forEach((item) => container.removeChild(item));
            }

            this.$nextTick(function () {
              let tooltipTitle = {
                label: "姓名",
                // age: "年龄",
                gender: "性别",
                // idType: "证件类型",
                identity: "证件号",
                // ccOrSc: "密接/次密",
                // ccHasBasicDisease: "是否有基础性疾病",
                // ccHasClinicSymp: "是否出现临床症状",
                // address: "地点",
                // contactCount: "密接次数",
                // personCount: "密接人数",
                // contTime: "密接时间"
                // firstContDate: "首次密接时间",
                // lastContDate: "末次密接时间",
              };
              this.drawCloseContactGraph(data, "ccContainer", tooltipTitle);
            });
          } else {
            // console.log("No data");
            const container = document.getElementById("ccContainer");
            container.innerHTML =
              '<h3 style="text-align: center;">没有密接人员</h3>';
          }
        } else {
          this.$message.error(res.data.msg);
        }
      });
    },
    drawCloseContactGraph(data, id, tooltipTitle) {
      const container = document.getElementById(id);
      if (!container) return;
      let child = container.childNodes;
      if (child && child.length > 0) {
        child.forEach((item) => container.removeChild(item));
      }
      let parentNode = container.parentNode;
      // console.log('parentNode:', parentNode, ' ', parentNode.clientHeight, ' ', parentNode.clientWidth)
      const width = parentNode.clientWidth - 40;
      const height =
        parentNode.scrollHeight > 800 ? parentNode.scrollHeight : 800;

      const defaultStateStyles = {
        hover: {
          stroke: "#1890ff",
          lineWidth: 2,
        },
      };
      const defaultNodeStyle = {
        fill: "#91d5ff",
        stroke: "#40a9ff",
        radius: 2,
      };
      const defaultEdgeStyle = {
        stroke: "#91d5ff",
        endArrow: {
          path: "M 0,0 L 12, 6 L 9,0 L 12, -6 Z",
          fill: "#91d5ff",
          d: -20,
        },
      };
      const defaultLabelCfg = {
        style: {
          fill: "#000",
          fontSize: 12,
        },
      };

      G6.Util.traverseTree(data, (d) => {
        d.leftIcon = {
          style: {
            fill: "#e6fffb",
            stroke: "#e6fffb",
          },
          img: require("@/assets/svg/unknown_1.png"),
        };
        this.updateHeadImg(d);
        d.leftIcon.img = d.headImg;

        return true;
      });
      let _this = this;
      this.tooltip = new G6.Tooltip({
        offsetX: 10,
        offsetY: 20,

        getContent(e) {
          let arr = [];
          let model = e.item.getModel();
          // console.log('model:', model)
          let json = model.json;
          if (json) {
            Object.keys(json).forEach((key) => {
              if (json[key]) {
                let data = json[key];
                if (key === "接触日期") {
                  data = _this.handleTimeGroup(json[key]);
                }
                arr.push(
                  '<label class="title">' +
                    key +
                    ":</label>" +
                    '<label class="content">' +
                    data +
                    "</label>"
                );
              }
            });
          } else {
            Object.keys(tooltipTitle).forEach((key) => {
              if (model[key]) {
                arr.push(
                  '<label class="title">' +
                    tooltipTitle[key] +
                    ":</label>" +
                    '<label class="content">' +
                    model[key] +
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
        itemTypes: ["node"],
      });

      // console.log('drawtree......', width, '  ', height)
      const graph = new G6.TreeGraph({
        container: id,
        width,
        height,
        linkCenter: true,
        plugins: [this.tooltip],
        modes: {
          default: [
            {
              type: "collapse-expand",
              onChange: function onChange(item, collapsed) {
                const data = item.getModel();
                // console.log('collapse.....', collapsed, ' ', item)
                graph.updateItem(item, {
                  collapsed,
                });
                data.collapsed = collapsed;
                return true;
              },
            },
            "drag-canvas",
            "zoom-canvas",
          ],
        },
        defaultNode: {
          type: "img-node",
          size: [120, 40],
          style: defaultNodeStyle,
          labelCfg: defaultLabelCfg,
        },
        defaultEdge: {
          type: "flow-line",
          style: defaultEdgeStyle,
        },
        nodeStateStyles: defaultStateStyles,
        edgeStateStyles: defaultStateStyles,

        layout: {
          type: "compactBox",
          direction: "TB",
          getId: function getId(d) {
            return d.id;
          },
          getHeight: function getHeight() {
            return 14;
          },
          getWidth: function getWidth() {
            return 14;
          },
          getVGap: function getVGap() {
            return 30;
          },
          getHGap: function getHGap() {
            return 60;
          },
        },
        nodeStateStyles: {
          hover: {
            lineWidth: 2,
            stroke: "#1890ff",
          },
        },
      });

      graph.data(data);
      graph.render();
      graph.fitView();

      let that = this;
      graph.on("collapse-icon:click", function (evt) {
        const { item, target } = evt;
        const nodeId = item.get("id");
        const model = item.getModel();
        const children = model.children;

        let person = model.label + ":" + model.identity;
        if (that.existedPersons.includes(person) && !children && that.nodeHasHandleChildMap.get(person)) {
          //该节点在上面已经被包含，不允许再点击查看子节点，上面重复的节点依旧可以点击收缩或展开
          that.$message.warning(model.label + "在前面已经显示");
          target.hide();
          that.deletedLeafNodes.push(nodeId);
          return;
        }

        if (!children || children.length === 0) {
          delete that.search.sampleId;
          Object.assign(that.search, { pptIdentity: model.identity });
          getKnownCloseContact(that.search).then((res) => {
            if (res.data.code === 0) {
              let list = res.data.data;
              that.nodeHasHandleChildMap.set(person, true);

              const parentData = graph.findDataById(nodeId);
              if (!parentData.children) {
                parentData.children = [];
              }

              if (list && list.length > 0) {
                list.forEach((itm) => {
                  let newNode = that.newNode(itm);
                  newNode.id = "node" + that.idNo;
                  (newNode.leftIcon = {
                    style: {
                      fill: "#e6fffb",
                      stroke: "#e6fffb",
                    },
                    img: newNode.headImg,
                  }),
                    parentData.children.push(newNode);
                  if (itm.children === 0) {
                    // console.log("children:", itm.personName, " ", newNode.id);
                    that.deletedLeafNodes.push(newNode.id);
                  }

                  person = itm.personName + ":" + itm.personIdentity;
                  if (that.nodeMap.get(person)) {
                    that.existedPersons.push(person);
                  } else {
                    that.nodeMap.set(person, that.idNo);
                  }
                  that.idNo++;
                });
                target.attr("symbol", G6.Marker.collapse);

                graph.updateChild(model, model.id);
                // graph.changeData();
              } else {
                target.hide();
                that.deletedLeafNodes.push(nodeId);
              }
            } else {
              this.$message.error(res.data.msg);
            }
          });
        }
      });

      graph.on("node:click", function (evt) {
        if (graph.isLayoutAnimating()) {
          graph.stopLayoutAnimate();
        }
        const { item, target } = evt;
        const nodeId = item.get("id");
        const model = item.getModel();
        const children = model.children;
        //根节点点击不再搜索子节点
        if (nodeId === "node1") return;

        let person = model.label + ":" + model.identity;
        if (that.existedPersons.includes(person)) {
          //该节点在上面已经被包含，不允许再点击查看子节点
          // that.$message.warning(model.label + "在前面已经显示");
          return;
        }
      });

      //增加水印
      // graph.setTextWaterMarker(['AntV', 'G6']);

      if (typeof window !== "undefined")
        window.onresize = () => {
          if (!graph || graph.get("destroyed")) return;
          if (!container || !container.scrollWidth || !container.scrollHeight)
            return;
          graph.changeSize(container.scrollWidth, container.scrollHeight);
        };
      this.graph = graph;
    },
    newNode(itm) {
      let node = {
        oid: itm.oid,
        headImg: itm.headImg,
        label: itm.personName,
        identity: itm.personIdentity,
        // 密接人年龄
        age: itm.age,
        contAddress: itm.contAddress,
        // contTime: this.handleTime(itm.contactTime),
        firstContDate: this.handleTime(itm.firstContDate),
        lastContDate: this.handleTime(itm.lastContDate),
        gender: this.genderMap[itm.gender],
        idType: this.ccIdTypeMap[itm.idType],

        // 密接人联系电话
        contact: itm.contact,
        // 密接人其他联系电话
        otherContact: itm.otherContact,
        // 密接证件类型
        credentialsType: itm.credentialsType,
        // 密接其他证件类型
        otherCredentialsType: itm.otherCredentialsType,
        // 密接工作单位
        workPlace: itm.workPlace,
        // 密接现住址
        address: itm.address,
        // 密接接触地点类型
        placeType: itm.placeType,
        // 密接接触地点具体名称
        placeName: itm.placeName,
        // 密接其他工作场所
        otherWorkPlace: itm.otherWorkPlace,
        // 密接其他发现途径
        foundWay: itm.foundWay,
        // 密接与病例关系
        relation: itm.relation,
        // 密接与病例接触情形
        cvcType: itm.cvcType,
        // 密接是否有效防护
        protect: itm.protect,
        // 密接人员类别
        staffType: itm.staffType,
        // 密接是否曾出现症状
        hasSymptom: itm.hasSymptom,
      };
      // console.log('json:', itm)
      if (itm.json) {
        node.json = JSON.parse(itm.json);
      }

      this.updateHeadImg(node);

      return node;
    },
    updateHeadImg(node) {
      if (!node.headImg) {
        if (node.gender === "男") {
          node.headImg = this.maleHeadImg;
        } else if (node.gender === "女") {
          node.headImg = this.femaleHeadImg;
        }
      }
    },
    exportImg() {
      this.graph.downloadFullImage("密接图谱");
    },
    exportData() {
      let graphData = this.graph.save();
      // console.log('graph data:', graphData)
      this.saveExcel(graphData);
    },
    readGraphData(graphData) {
      let node = {
        self: {
          name: graphData.label,
          identity: graphData.identity,
          idType: graphData.idType,
          gender: graphData.gender,
          age: graphData.age,
        },
        children: [],
      };
      if (graphData.children && graphData.children.length > 0) {
        graphData.children.forEach((item) => {
          node.children.push({
            name: item.label,
            identity: item.identity,
            idType: item.idType,
            gender: item.gender,
            age: item.age,
            // contTime: this.handleTime(item.contTime),
            firstContDate: this.handleTime(item.firstContDate),
            lastContDate: this.handleTime(item.lastContDate),
            contAddress: item.contAddress,
            // 密接人联系电话
            contact: item.contact,
            // 密接人其他联系电话
            otherContact: item.otherContact,
            // 密接证件类型
            credentialsType: item.credentialsType,
            // 密接其他证件类型
            otherCredentialsType: item.otherCredentialsType,
            // 密接工作单位
            workPlace: item.workPlace,
            // 密接现住址
            address: item.address,
            // 密接接触地点类型
            placeType: item.placeType,
            // 密接接触地点具体名称
            placeName: item.placeName,
            // 密接其他工作场所
            otherWorkPlace: item.otherWorkPlace,
            // 密接其他发现途径
            foundWay: item.foundWay,
            // 密接与病例关系
            relation: item.relation,
            // 密接与病例接触情形
            cvcType: item.cvcType,
            // 密接是否有效防护
            protect: item.protect,
            // 密接人员类别
            staffType: item.staffType,
            // 密接是否曾出现症状
            hasSymptom: item.hasSymptom,
          });
          if (item.collapsed !== undefined && item.collapsed === true) {
            //收缩节点不导出
            return;
          }
          this.readGraphData(item);
        });
      }

      this.persons.push(node);
    },
    saveExcel(graphData) {
      this.persons = [];
      this.readGraphData(graphData);
      this.persons = this.persons.reverse();
      // console.log('persons:', JSON.stringify(this.persons))

      let list = [];
      let _this = this;
      this.persons.forEach((p) => {
        if (p.children && p.children.length > 0) {
          p.children.forEach((item) => {
            list.push({
              name0: _this.getValue(p.self.name),
              identity0: p.self.identity,
              idType0: _this.getValue(p.self.idType),
              gender0: _this.getValue(p.self.gender),
              oper: "密接",
              name1: _this.getValue(item.name),
              identity1: item.identity,
              idType1: _this.getValue(item.idType),
              gender1: _this.getValue(item.gender),
              // contTime: _this.handleTime(_this.getValue(item.contTime)),
              firstContDate: _this.handleTime(
                _this.getValue(item.firstContDate)
              ),
              lastContDate: _this.handleTime(_this.getValue(item.lastContDate)),
              contAddress: _this.getValue(item.contAddress),

              age: _this.getValue(item.age),
              // 密接人联系电话
              contact: _this.getValue(item.contact),
              // 密接人其他联系电话
              otherContact: _this.getValue(item.otherContact),
              // 密接证件类型
              credentialsType: _this.getValue(item.credentialsType),
              // 密接其他证件类型
              otherCredentialsType: _this.getValue(item.otherCredentialsType),
              // 密接工作单位
              workPlace: _this.getValue(item.workPlace),
              // 密接现住址
              address: _this.getValue(item.address),
              // 密接接触地点类型
              placeType: _this.getValue(item.placeType),
              // 密接接触地点具体名称
              placeName: _this.getValue(item.placeName),
              // 密接其他工作场所
              otherWorkPlace: _this.getValue(item.otherWorkPlace),
              // 密接发现途径
              foundWay: _this.getValue(item.foundWay),
              // 密接与病例关系
              relation: _this.getValue(item.relation),
              // 密接与病例接触情形
              cvcType: _this.getValue(item.cvcType),
              // 密接是否有效防护
              protect: _this.getValue(item.protect),
              // 密接人员类别
              staffType: _this.getValue(item.staffType),
              // 密接是否曾出现症状
              hasSymptom: _this.getValue(item.hasSymptom),
            });
          });
        }
      });

      let title = "密接列表";
      let columns = [
        { label: "姓名", prop: "name0" },
        { label: "性别", prop: "gender0" },
        // {label:'证件类别', prop:'idType0'},
        { label: "证件号", prop: "identity0" },
        { label: "关系", prop: "oper" },
        { label: "密接人姓名", prop: "name1" },
        { label: "密接人性别", prop: "gender1" },
        // {label:'密接人证件类别', prop:'idType1'},
        { label: "密接人年龄", prop: "age" },
        { label: "密接人联系方式", prop: "contact" },
        { label: "密接人其他联系方式", prop: "otherContact" },
        { label: "密接人证件类型", prop: "credentialsType" },
        { label: "密接人证件号", prop: "identity1" },
        { label: "密接工作单位", prop: "workPlace" },
        { label: "密接现住址", prop: "address" },

        { label: "密接接触地点类型", prop: "placeType" },
        { label: "密接接触地点具体名称", prop: "placeName" },
        { label: "密接地点", prop: "contAddress" },

        // { label: "密接时间", prop: "contTime" },
        { label: "首次密接时间", prop: "firstContDate" },
        { label: "末次密接时间", prop: "lastContDate" },

        { label: "密接是否曾出现症状", prop: "hasSymptom" },
        { label: "密接发现途径", prop: "foundWay" },

        { label: "密接与病例关系", prop: "relation" },
        { label: "密接与病例接触情形", prop: "cvcType" },
        { label: "密接是否有效防护", prop: "protect" },
        { label: "密接人员类别", prop: "staffType" },
      ];

      // console.log('list:', list)
      this.$Export.excel({
        title: title || new Date().getTime(),
        columns: columns,
        data: list,
      });
    },
    getValue(obj) {
      return this.validatenull(obj) ? "" : obj;
    },
    handleTimeGroup(data) {
      let time = "";
      if (data && data.includes("至")) {
        let list = data.split("至");
        time = list.map((s) => moment(s).format("YYYY-MM-DD HH:mm")).join("至");
      } else if (data) {
        let time1 = data.slice(0, 16);
        let time2 = data.slice(20, 36);
        time = time1 + "-" + time2;
      }
      return time;
    },
    handleTime(data) {
      //   if (data) {
      //     return moment(data).format("YYYY-MM-DD HH:mm:ss");
      //   } else {
      //     return "";
      //   }
      if (data) {
        console.log(data);
        let tmp = moment(data).format("YYYY-MM-DD HH:mm:ss");
        return tmp;
      } else {
        return "";
      }
    },
  },
};
</script>

<!--<style type="text/css">-->
<style lang="scss" scope>
/* 提示框的样式 */
#ccContainer {
  .g6-tooltip {
    border: 1px solid #e2e2e2;
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.9);
    padding: 10px 8px;
    margin-left: 30px;
    opacity: 0.8;
    box-shadow: rgb(174, 174, 174) 0px 0px 10px;
  }
  .g6-component-tooltip {
    .title {
      font-weight: bold;
      padding-top: 5px;
      line-height: 20px;
    }
    .content {
      padding-left: 10px;
    }
  }
}
#elDialog {
  .el-dialog__body {
    height: 90%;
  }
}
</style>
