<template>
  <el-dialog
    :visible.sync="visible"
    :title="!dataForm.id ? $t('add') : $t('update')"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @closed="handleClose"
  >
    <el-form
      :model="dataForm"
      :rules="dataRule"
      ref="dataForm"
      @keyup.enter.native="dataFormSubmitHandle()"
      label-width="100px"
      size="mini"
    >
      <el-divider content-position="left">基础信息</el-divider>
      <el-row>
        <el-col :span="9">
          <el-form-item prop="realName" :label="$t('user.realName')">
            <el-input
              v-model="dataForm.realName"
              :placeholder="$t('user.realName')"
              maxlength="30"
            ></el-input>
          </el-form-item>
          <el-form-item prop="mobile" :label="$t('user.mobile')">
            <el-input
              size="mini"
              v-model="dataForm.mobile"
              :placeholder="$t('user.mobile')"
              maxlength="20"
            ></el-input>
          </el-form-item>
          <el-form-item prop="idNo" :label="$t('user.idNumber')">
            <el-input
              size="mini"
              v-model="dataForm.idNo"
              :placeholder="$t('user.idNumber')"
              maxlength="30"
            ></el-input>
          </el-form-item>
          <el-form-item prop="degree" :label="$t('user.education')">
            <el-input
              size="mini"
              v-model="dataForm.degree"
              :placeholder="$t('user.education')"
              maxlength="30"
            >
              <!--              <el-option-->
              <!--                      v-for="item in dict.degreeOptions"-->
              <!--                      :key="item.dictValue"-->
              <!--                      :label="item.dictLabel"-->
              <!--                      :value="item.dictValue">-->
              <!--              </el-option>-->
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="9">
          <el-form-item prop="gender" :label="$t('user.gender')">
            <ren-radio-group
              v-model="dataForm.gender"
              dict-type="gender"
            ></ren-radio-group>
          </el-form-item>
          <el-form-item prop="email" :label="$t('user.email')">
            <el-input
              size="mini"
              v-model="dataForm.email"
              :placeholder="$t('user.email')"
              maxlength="30"
            ></el-input>
          </el-form-item>
          <el-form-item prop="major" :label="$t('user.specializedSubject')">
            <el-input
              size="mini"
              v-model="dataForm.major"
              :placeholder="$t('user.specializedSubject')"
              maxlength="30"
            ></el-input>
          </el-form-item>
          <el-form-item prop="jobTitle" :label="$t('user.positionalTitle')">
            <el-input
              size="mini"
              v-model="dataForm.jobTitle"
              :placeholder="$t('user.positionalTitle')"
              maxlength="30"
            >
              <!--              <el-option-->
              <!--                      v-for="item in dict.jobTitleOptions"-->
              <!--                      :key="item.dictValue"-->
              <!--                      :label="item.dictLabel"-->
              <!--                      :value="item.dictValue">-->
              <!--              </el-option>-->
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-upload
            :data="dataObj"
            class="avatar-uploader"
            :headers="headers"
            :action="uploadUrl"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="imageUrl" :src="imageUrl" class="avatar" />
            <!--                        <i v-if="isImageUrl" class="el-icon-plus avatar-uploader-icon"></i>-->
            <!--                        <i class="el-icon-close" ></i>-->
          </el-upload>
          <label
            class="el-form-item__label"
            style="font-size: 4px; margin-left: 40px"
          >
            (jpg/png 最大2MB)
          </label>
        </el-col>
      </el-row>
      <el-divider content-position="left">用户信息</el-divider>
      <el-row>
        <el-col :span="10">
          <el-form-item prop="username" :label="$t('user.username')">
            <el-input
              size="mini"
              v-model="dataForm.username"
              :disabled="dataForm.id ? true : false"
              :placeholder="$t('user.username')"
              auto-complete="off"
              maxlength="30"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="isCreate">
        <el-col :span="20">
          <el-form-item
            prop="password"
            :label="$t('user.password')"
            :class="{ 'is-required': !dataForm.id }"
          >
            <el-input
              size="mini"
              v-model="dataForm.password"
              type="password"
              :placeholder="$t('user.password')"
              auto-complete="off"
              maxlength="16"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="isCreate">
        <el-col :span="20">
          <el-form-item
            prop="confirmPassword"
            :label="$t('user.confirmPassword')"
            :class="{ 'is-required': !dataForm.id }"
          >
            <el-input
              size="mini"
              v-model="dataForm.confirmPassword"
              type="password"
              :placeholder="$t('user.confirmPassword')"
              maxlength="16"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <!--            只有deptId匹配的部门管理员才能修改隶属部门.所属部门可以随意.-->
        <!-- <el-col :span="20" v-if="adminDeptId === oldDeptId || !dataForm.id"> -->
        <el-col :span="20">
          <el-form-item
            prop="deptId"
            label="隶属组织"
            class="is-required role-list"
          >
            <el-popover placement="top" width="500" trigger="click">
              <el-tabs
                :active-name="activeName"
                type="card"
                stretch
                v-if="visible"
                @tab-click="changeTab"
              >
                <el-tab-pane name="treeSelect" label="从下级组织中选择">
                  <el-row class="flow-tree">
                    <el-input
                      placeholder="输入关键字进行过滤"
                      v-model="filterText"
                      class="filter-input"
                    ></el-input>
                    <el-tree
                      v-if="visible && activeName === 'treeSelect'"
                      ref="trueDeptTree"
                      node-key="id"
                      :data="deptData"
                      :default-checked-keys="defaultDeptIdCheckedList"
                      :props="defaultTrueDeptProps"
                      check-strictly
                      @check="handleCheckTrueDept"
                      :filter-node-method="filterNode"
                      show-checkbox
                    >
                    </el-tree>
                  </el-row>
                </el-tab-pane>
                <el-tab-pane name="enableSelect" label="从所在组织中选择">
                  <el-select
                    v-model="dataForm.deptId"
                    @change="handleChangeTrueDept"
                    value-key="id"
                    :value="dataForm.deptId"
                    v-if="visible && activeName === 'enableSelect'"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="(item, index) in deptListTags"
                      :key="index"
                      :label="item.label"
                      :value="item.id"
                    ></el-option>
                  </el-select>
                </el-tab-pane>
              </el-tabs>
              <el-row slot="reference" class="input-style-for-div">
                <div v-if="dataForm.deptId">
                  <el-tag
                    size="small"
                    style="margin: 0 10px 2px 0"
                    :closable="true"
                    :key="dataForm.deptId"
                    @close="handleRemoveTrueDept(dataForm.deptId)"
                  >
                    {{ dataForm.trueDeptName }}
                  </el-tag>
                </div>
                <div v-else style="font-size: 12px">
                  <span style="color: #c3c4cb !important; margin-left: 10px">
                    请选择隶属组织
                  </span>
                </div>
              </el-row>
            </el-popover>
            <!--                  <el-select v-model="dataForm.deptId" placeholder="隶属组织（人事关系隶属的组织）" value-key="id">-->
            <!--                    <el-option-->
            <!--                      v-for="item in deptListTags"-->
            <!--                      :key="item.id"-->
            <!--                      :label="item.label"-->
            <!--                      :value="item.id">-->
            <!--                    </el-option>-->
            <!--                  </el-select>-->
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="20">
          <el-form-item
            prop="deptNames"
            label="所在组织"
            class="is-required role-list"
          >
            <el-popover
              placement="top"
              width="500"
              @hide="cleanDefault()"
              trigger="click"
            >
              <el-row class="flow-tree">
                <el-tree
                  v-if="belongDeptVisible"
                  ref="trees"
                  node-key="id"
                  :default-checked-keys="defaultDeptIdsCheckedList"
                  :props="defaultProps"
                  :load="loadNode"
                  check-strictly
                  lazy
                  @check-change="checkChange"
                  show-checkbox
                >
                </el-tree>
              </el-row>
              <el-row slot="reference" class="input-style-for-div">
                <div v-if="deptListTags.length > 0">
                  <el-tag
                    v-for="(tag, index) in deptListTags"
                    size="small"
                    style="margin: 0 10px 2px 0"
                    :closable="true"
                    :key="index + 's'"
                    @close="handleRemoveDept(tag, index)"
                  >
                    {{ tag.label }}
                  </el-tag>
                </div>
                <div v-else style="font-size: 12px">
                  <span style="color: #c3c4cb !important; margin-left: 10px">
                    请选择所在组织
                  </span>
                </div>
              </el-row>
            </el-popover>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="20">
          <el-form-item
            prop="roleIdList"
            :label="$t('user.roleIdList')"
            class="is-required role-list"
          >
            <el-select
              size="mini"
              v-model="dataForm.roleIdList"
              multiple
              :placeholder="$t('user.roleIdList')"
              value-key="id"
            >
              <el-option
                v-for="role in roleList"
                :key="role.id"
                :label="role.name"
                :value="role.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="!isCreate">
        <el-col :span="20">
          <el-form-item label="QQ/微信绑定" prop="openId">
            <div v-if="dataForm.openId && dataForm.openId.length > 0">
              <el-tag size="small">已绑定 </el-tag>
              <el-button
                type="text"
                style="margin-left: 10px"
                @click="resetOpenId"
              >
                解绑
              </el-button>
            </div>
            <div v-else>
              <el-tag type="info" size="small">未绑定</el-tag>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="20">
          <el-form-item prop="status" :label="$t('user.status')" size="mini">
            <el-radio-group v-model="dataForm.status">
              <el-radio :label="0">{{ $t("user.status0") }}</el-radio>
              <el-radio :label="1">{{ $t("user.status1") }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-dialog
      width="30%"
      title="警告"
      :visible.sync="innerVisible"
      append-to-body
    >
      <span>确认更改该用户隶属组织？</span>
      <span slot="footer">
        <el-button size="mini" type="primary" @click="confirmChangeOrganization"
          >确 定</el-button
        >
        <el-button size="mini" @click="innerVisible = false">取 消</el-button>
      </span>
      <!-- <h4>
        系统检测到您已变更此用户的隶属组织，确认后您将
        <span style="color: red">无法撤回该操作</span>
        ，如需回退变更只能联系新隶属组织的管理员。
      </h4>
      <h4>
        如果只需要加入其它机构,更改
        <span style="color: red">所在组织</span>
        即可！
      </h4>
      <h4>
        如果您确认更改，请输入：“
        <span style="color: red">我已知晓</span>
        ”。
      </h4>
      <br />
      <el-input
        v-model="text"
        @input="changeText"
        type="input"
        placeholder="输入后更改会立即应用"
      ></el-input> -->
    </el-dialog>
    <template slot="footer">
      <el-button
        type="primary"
        @click="makeSureAgain"
        size="mini"
        :disabled="disabled"
        v-if="oldDeptId !== dataForm.deptId && oldDeptId && dataForm.id"
      >
        {{ $t("confirm") }}
      </el-button>
      <el-button
        type="primary"
        @click="dataFormSubmitHandle()"
        size="mini"
        :disabled="disabled"
        v-else
      >
        {{ $t("confirm") }}
      </el-button>
      <el-button @click="visible = false" size="mini">
        {{ $t("cancel") }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script>
import { lazyDeptTree } from "@/api/sys/dept";
import { Treeselect, LOAD_CHILDREN_OPTIONS } from "@riophae/vue-treeselect";
import { isMobile, isEmail, isPassword, isIdNo } from "@/utils/validate";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import debounce from "lodash/debounce";
import FileTypeConstant from "@/utils/FileTypeConstant";
import Cookies from "js-cookie";
import {
  resetOpenId,
  getIdNoIsExist,
  getDeptTreeListByUser,
} from "@/api/user/user";
import sm4Utils from "@/utils/sm4";

export default {
  // register the component
  // components: { Treeselect },
  data() {
    return {
      activeName: "enableSelect",
      text: "",
      innerVisible: false,
      oldDeptId: null,
      adminDeptId: this.$store.state.user.truthDeptId,
      truthDeptId: this.$store.state.user.truthDeptId,
      deptListData: [],
      defaultProps: {
        label: "label",
        children: "children",
        isLeaf: "leaf",
      },
      defaultTrueDeptProps: {
        label: "name",
        children: "children",
        isLeaf: "leaf",
      },
      trueDeptTags: {},
      defaultDeptIdCheckedList: [],
      defaultDeptIdsCheckedList: [],
      belongDeptVisible: false,
      deptListTags: [],
      deptListTagsBak: [],
      deptSelectedList: [],
      visible: false,
      isCreate: false,
      roleList: [],
      roleIdListDefault: [],
      disabled: false,
      imageUrl: "",
      headers: {
        Authorization: Cookies.get("access_token"),
      },
      uploadUrl: window.SITE_CONFIG["singleUploadURL"],
      dataObj: {
        type: FileTypeConstant.AVATAR,
      },
      dict: {
        degreeOptions: [],
        jobTitleOptions: [],
        majorOptions: [],
      },
      dataForm: {
        id: "",
        username: "",
        deptId: "",
        deptName: "",
        trueDeptName: "",
        password: "",
        confirmPassword: "",
        realName: "",
        gender: 0,
        email: "",
        mobile: "",
        errorMsg: "",
        roleIdList: [],
        status: 1,
        jobTitle: "",
        degree: "",
        major: "",
        idNo: "",
        investigator: 1,
        openId: null,
      },
      deptData: [],
      filterText: "",
      originIdNo: "",
      userDefHeadImg: require("@/assets/img/userDefHeadImg.png"),
    };
  },
  watch: {
    filterText(val) {
      this.$refs.trueDeptTree.filter(val);
    },
  },
  computed: {
    dataRule() {
      var that = this;
      var validatePassword = (rule, value, callback) => {
        if (!this.dataForm.id && !/\S/.test(value)) {
          return callback(new Error(this.$t("validate.required")));
        }
        // if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/.test(value)) {
        //   this.dataForm.password = "";
        //   return callback("输入8-16位不包含特殊符号的混合密码！");
        // }
        // if (value.length < 8 || value.length > 16) {
        //   return callback("请输入8-16位的密码！");
        // }
        if (
          !/^(?![A-Za-z0-9]+$)(?![a-z0-9\W]+$)(?![A-Za-z\W]+$)(?![A-Z0-9\W]+$)[a-zA-Z0-9\W]{8,16}$/.test(
            value
          )
        ) {
          // this.dataForm.password = "";
          return callback(
            "请输入包含大小写字母、数字、特殊字符的8到16位密码！"
          );
        }
        callback();
      };
      var validateConfirmPassword = (rule, value, callback) => {
        if (!this.dataForm.id && !/\S/.test(value)) {
          return callback(new Error(this.$t("validate.required")));
        }
        if (this.dataForm.password !== value) {
          return callback(new Error("确认密码与密码输入不一致"));
        }
        callback();
      };
      var validateEmail = (rule, value, callback) => {
        if (value && !isEmail(value)) {
          return callback(
            new Error(
              this.$t("validate.format", { attr: this.$t("user.email") })
            )
          );
        }
        callback();
      };
      var validateMobile = (rule, value, callback) => {
        if (value && !isMobile(value)) {
          return callback(
            new Error(
              this.$t("validate.format", { attr: this.$t("user.mobile") })
            )
          );
        }
        callback();
      };
      var validateDept = (rule, value, callback) => {
        if (!this.deptSelectedList[0]) {
          return callback(
            new Error(
              this.$t("validate.format", { attr: this.$t("user.deptName") })
            )
          );
        }
        callback();
      };
      var validateRole = (rule, value, callback) => {
        if (!this.dataForm.roleIdList[0]) {
          return callback(
            new Error(
              this.$t("validate.format", { attr: this.$t("user.roleIdList") })
            )
          );
        }
        callback();
      };
      var validateIdNo = async function (rule, value, callback) {
        if (!isIdNo(value)) {
          return callback(new Error("身份证格式错误"));
        }
        let isExist = await that.getValidateIdNo(value);
        if (isExist && that.originIdNo !== value) {
          return callback(new Error("该身份证号已存在，请重新输入"));
        }
        callback();
      };
      return {
        username: [
          {
            required: true,
            message: this.$t("validate.required"),
            trigger: "blur",
          },
        ],
        deptName: [{ validator: validateDept, trigger: "blur" }],
        roleIdList: [{ validator: validateRole, trigger: "blur" }],
        password: [
          { validator: validatePassword, trigger: "blur" },
          // { min: 8, max: 16, message: '请输入数字和英文字母组合的8-16位密码！', trigger: 'blur' }
        ],
        confirmPassword: [
          { validator: validateConfirmPassword, trigger: "blur" },
        ],
        realName: [
          {
            required: true,
            message: this.$t("validate.required"),
            trigger: "blur",
          },
        ],
        email: [{ validator: validateEmail, trigger: "blur" }],
        idNo: [{ required: true, validator: validateIdNo, trigger: "blur" }],
        mobile: [
          {
            required: true,
            message: this.$t("validate.required"),
            trigger: "blur",
          },
          { validator: validateMobile, trigger: "blur" },
        ],
      };
    },
  },
  mounted() {
    this.loadDeptTree();
  },
  methods: {
    loadDeptTree() {
      let treeData = this.$store.state.user.userDeptTree;
      if (treeData) {
        console.log("load cache...");
        this.deptData = JSON.parse(treeData);
      } else {
        console.log("load ...");
        getDeptTreeListByUser().then((res) => {
          if (res.data.code === 0) {
            let children = res.data.data;
            this.deptData = children;
            this.$store.commit("updateUserDeptTree", JSON.stringify(children));
          } else {
            console.error("err:", res.data.msg);
          }
        });
      }
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    handleClose() {
      this.$emit("user-close");
    },
    cleanDefault(isDeptId) {
      if (isDeptId) {
      }
    },
    changeTab(tab) {
      this.activeName = tab.name;
    },
    handleRemoveDept(tag, index) {
      let o = [];
      if (this.dataForm.trueDeptName === tag.label) {
        this.$message.error("无效的移除操作,隶属部门已占用此部门!");
        return;
      }
      this.deptListTags.splice(this.deptListTags.indexOf(tag), 1); //生效
      this.defaultDeptIdsCheckedList = this.deptListTags.map((v) => v.id);
      this.deptSelectedList = this.deptSelectedList.filter(
        (v) => v !== this.deptSelectedList[index]
      ); // 生效
      this.$refs.trees.setChecked(tag.id, false);
    },
    handleRemoveTrueDept(tag) {
      let toRemoveDeptId = tag;
      this.dataForm.deptId = "";
      this.dataForm.deptName = "";
      // 更新隶属部门
      this.trueDeptTags = {};
      // 更新所在部门
      console.log(this.deptListTagsBak, toRemoveDeptId);
      if (
        this.deptListTagsBak.filter((item) => item.id === toRemoveDeptId)
          .length <= 0
      ) {
        this.deptListTags = this.deptListTags.filter(
          (item) => item.id !== toRemoveDeptId
        );
        this.defaultDeptIdsCheckedList = this.deptListTags.map((v) => v.id);
        this.$set(
          this,
          "deptSelectedList",
          this.deptSelectedList.filter((item) => item.id !== toRemoveDeptId)
        );
      }
      this.defaultDeptIdCheckedList = [];
    },
    loadNode(node, resolve) {
      let deptList = [];
      if (node.level === 0) {
        lazyDeptTree({ pid: this.$store.state.user.deptId })
          .then((res) => {
            deptList = res.data.data;
            return resolve(deptList);
          })
          .catch(() => {});
      }
      if (node.level === 1) {
        console.log(node, this.deptListData);
        return node.data.children ? resolve(node.data.children) : resolve([]);
      }
      if (node.level >= 2) {
        let subDeptList = [];
        console.log(node);
        lazyDeptTree({ pid: node.data.id })
          .then((res) => {
            subDeptList = res.data.data[0];
            return subDeptList.children
              ? resolve(subDeptList.children)
              : resolve([]);
          })
          .catch(() => {});
        // return resolve(node.data.children)
      }
    },
    checkChange(v, u, e) {
      if (u) {
        this.deptListTags = this.deptListTags.filter(
          (item) => item.id !== v.id
        );
        this.deptListTags.push({ id: v.id, label: v.label });
        this.defaultDeptIdsCheckedList = this.deptListTags.map((v) => v.id);
        this.deptSelectedList.push(v.id);
      } else {
        let o = [];
        if (this.dataForm.deptId) {
          o = this.deptSelectedList.filter(
            (item) => item === this.dataForm.deptId && item === v.id
          );
          console.log(o, "ds");
          if (o.length > 0) {
            this.$refs.trees.setChecked(v.id, true);
            this.$message.error("无效的移除操作,隶属部门已占用此部门!");
            return;
          }
        }
        this.$set(
          this,
          "deptSelectedList",
          this.deptSelectedList.filter((item) => item !== v.id)
        );
        this.deptListTags = this.deptListTags.filter(
          (item) => item.id !== v.id
        );
        this.defaultDeptIdsCheckedList = this.deptListTags.map((v) => v.id);
      }
      this.$forceUpdate();
    },
    handleChangeTrueDept(data) {
      this.dataForm.deptId = data;
      let label = this.deptListTags.filter((i) => i.id === data)[0].label;
      this.dataForm.trueDeptName = label;
      this.defaultDeptIdCheckedList[0] = data;
      // 更新隶属部门
      this.trueDeptTags = { id: data, label: label };
      this.$set(
        this,
        "deptSelectedList",
        this.deptSelectedList.filter((item) => item !== data)
      );
      this.deptSelectedList.push(data);
      this.$forceUpdate();
    },
    handleCheckTrueDept(data, checked, indeterminate) {
      if (checked.checkedKeys.length > 0) {
        let originDeptId = this.dataForm.deptId;
        // 取消原选择
        this.$refs.trueDeptTree.setChecked(originDeptId, false);
        this.dataForm.deptId = data.id;
        this.dataForm.trueDeptName = data.label ? data.label : data.name;
        // 更新隶属部门
        this.trueDeptTags = {
          id: data.id,
          label: data.label ? data.label : data.name,
        };
        //重置隶属部门默认选择
        this.defaultDeptIdCheckedList = [data.id];
        //更新所在部门的列表
        if (
          this.deptListTagsBak.filter((item) => item.id === originDeptId)
            .length <= 0
        ) {
          this.deptListTags = this.deptListTags.filter(
            (item) => item.id !== originDeptId
          ); // 移除上一个选择
          this.defaultDeptIdsCheckedList = this.deptListTags.map((v) => v.id);
          this.deptSelectedList = this.deptSelectedList.filter(
            (item) => item.id !== originDeptId
          ); // 移除上一个选择
        }
        this.deptListTags = this.deptListTags.filter(
          (item) => item.id !== data.id
        ); //先移除本次选择，再添加，确保不重复
        this.deptListTags.push({
          id: data.id,
          label: data.label ? data.label : data.name,
        });
        this.defaultDeptIdsCheckedList = this.deptListTags.map((v) => v.id);
        this.$set(
          this,
          "deptSelectedList",
          this.deptSelectedList.filter((item) => item !== data.id)
        );
        this.deptSelectedList.push(data.id);
      } else {
        this.dataForm.deptId = "";
        this.dataForm.deptName = "";
        // 更新隶属部门
        this.trueDeptTags = {};
        this.defaultDeptIdCheckedList = [];
        //更新所在部门的列表
        if (
          this.deptListTagsBak.filter((item) => item.id === data.id).length <= 0
        ) {
          this.$set(
            this,
            "deptSelectedList",
            this.deptSelectedList.filter((item) => item !== data.id)
          );
          this.deptListTags = this.deptListTags.filter(
            (item) => item.id !== data.id
          );
          this.defaultDeptIdsCheckedList = this.deptListTags.map((v) => v.id);
        }
      }
      this.$forceUpdate();
    },
    init() {
      if (this.dataForm.id !== "") {
        this.isCreate = false;
      } else {
        this.isCreate = true;
        this.imageUrl = this.userDefHeadImg;
        this.dataForm.headUrl = this.imageUrl;
      }

      this.deptListTags = [];
      this.defaultDeptIdsCheckedList = [];
      this.deptSelectedList = [];
      this.defaultDeptIdCheckedList = [];
      this.visible = true;
      this.dataForm.deptId = "";
      this.belongDeptVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].resetFields();
        this.roleIdListDefault = [];
        Promise.all([
          this.getRoleList(),
          // this.getDeptList()
        ]).then(() => {
          if (!this.isCreate) {
            this.getInfo();
          } else {
            this.resetDataForm();
          }
          // console.log('init:', this.dataForm)
        });
      });
    },
    // 获取角色列表
    getRoleList() {
      return this.$http
        .get("/sys/role/list")
        .then(({ data: res }) => {
          if (res.code !== 0) {
            return this.$message.error(res.msg);
          }
          this.roleList = res.data;
          // console.log(this.roleList)
        })
        .catch(() => {});
    },
    //重置openId
    resetOpenId() {
      console.log(this.dataForm.id);
      resetOpenId(this.dataForm.id).then(({ data: res }) => {
        if (res.code !== 0) {
          return this.$message.error(res.msg);
        }
        this.getInfo();
      });
    },
    // 获取信息
    getInfo() {
      this.$http
        .get(`/sys/user/${this.dataForm.id}`)
        .then(({ data: res }) => {
          if (res.code !== 0) {
            return this.$message.error(res.msg);
          }
          this.dataForm = {
            ...this.dataForm,
            ...res.data,
            roleIdList: [],
          };
          this.imageUrl = this.dataForm.headUrl;
          if (!this.imageUrl) {
            this.imageUrl = this.userDefHeadImg;
          }
          this.oldDeptId = Object.assign({}, this.dataForm).deptId;
          let deptIds = res.data.deptIds;
          let deptName = res.data.deptName;
          this.trueDeptId = res.data.deptId;
          this.originIdNo = res.data.idNo;
          this.deptListTags = [];
          this.defaultDeptIdsCheckedList = [];
          this.defaultDeptIdCheckedList[0] = this.trueDeptId;
          if (deptIds) {
            let ids = deptIds.split(",");
            // this.defaultDeptIdCheckedList = deptIds.split(',')
            let names = deptName.split(" ");
            ids.forEach((item, index) => {
              this.deptListTags.push({ id: item, label: names[index] });
            });
            this.defaultDeptIdsCheckedList = Object.assign([], ids);
          }
          this.belongDeptVisible = false;
          this.$nextTick(() => (this.belongDeptVisible = true));

          this.deptListTagsBak = Object.assign([], this.deptListTags);
          this.deptSelectedList = [];
          // this.deptSelectedList.push(new String(res.data.deptId))  //一个用户单个部门
          //一个用户多部门
          res.data.deptIds.split(",").forEach((item) => {
            this.deptSelectedList.push(item);
          });

          // 角色配置, 区分是否为默认角色
          for (var i = 0; i < res.data.roleIdList.length; i++) {
            if (
              this.roleList.filter(
                (item) => item.id === res.data.roleIdList[i]
              )[0]
            ) {
              this.dataForm.roleIdList.push(res.data.roleIdList[i]);
              continue;
            }
            this.roleIdListDefault.push(res.data.roleIdList[i]);
          }
        })
        .catch(() => {});
    },
    // 获取组织机构列表数
    // getDeptList () {
    //   // {pid: this.$store.state.user.deptId}
    //   // return lazyDeptTree({pid: this.$store.state.user.deptId}).then((res) => {
    //   //   this.deptList = res.data.data
    //   // }).catch(() => {})
    // },
    deleteChildren(deptList) {
      deptList.forEach((item) => {
        if (!item.children || !item.children.length) {
          delete item.children;
        } else {
          this.deleteChildren(item.children);
        }
      });
      console.log(deptList);
      return deptList;
    },
    // 表单提交
    dataFormSubmitHandle: debounce(
      function () {
        this.$refs["dataForm"].validate((valid) => {
          if (!valid) {
            return false;
          }
          // this.$store.commit("updateHeadImg", this.dataForm.headUrl);
          // this.dataForm.deptId = this.deptSelectedList[0]
          this.dataForm.deptIds = this.defaultDeptIdsCheckedList.join(",");
          this.dataForm.investigator = 1;
          this.disabled = true;
          this.$http[!this.dataForm.id ? "post" : "put"]("/sys/user", {
            ...this.dataForm,
            roleIdList: [
              ...this.dataForm.roleIdList,
              ...this.roleIdListDefault,
            ],
          })
            .then(({ data: res }) => {
              this.disabled = false;
              if (res.code !== 0) {
                return this.$message.error(res.msg);
              }
              if (res.data === "您刚才已经请求了") {
                return this.$message.error("您刚才已经请求了,请过几秒再试");
              }
              this.$message({
                message: this.$t("prompt.success"),
                type: "success",
                duration: 500,
                onClose: () => {
                  this.visible = false;
                  this.$emit("refreshDataList");
                },
              });
            })
            .catch(() => {
              this.disabled = false;
            });
        });
      },
      2000,
      { leading: true, trailing: false }
    ),

    makeSureAgain() {
      this.innerVisible = true;
    },
    handleAvatarSuccess(res, file) {
      if (this.$store.state.cryptoOpen) {
        let tmpData = sm4Utils.decrypt(res, this.$store.state.key);
        res = JSON.parse(tmpData);
      }

      if (res.code === 0) {
        this.dataForm.headUrl = res.data.url;
        this.imageUrl = res.data.url;
      } else {
        console.log("err:", res.msg);
        this.$message.error(res.msg);
      }
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === "image/jpeg";
      const isPNG = file.type === "image/png";
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isJPG && !isPNG) {
        this.$message.error(
          "上传头像图片只能是 JPG、PNG 格式, 大小不能超过 2MB!"
        );
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return (isJPG || isPNG) && isLt2M;
    },
    changeText() {
      if (this.text === "我已知晓") {
        this.innerVisible = false;
        this.text = "";
        this.dataFormSubmitHandle();
      }
    },
    confirmChangeOrganization() {
      this.innerVisible = false;
      this.dataFormSubmitHandle();
    },
    resetDataForm() {
      this.deptSelectedList = [];
      this.dataForm = {
        id: "",
        username: "",
        deptId: "",
        deptName: "",
        password: "",
        confirmPassword: "",
        realName: "",
        gender: 0,
        email: "",
        mobile: "",
        deptListTags: [],
        errorMsg: "",
        roleIdList: [],
        status: 1,
        jobTitle: "",
        degree: "",
        major: "",
        idNo: "",
        investigator: 1,
        openId: null,
      };
    },
    async getValidateIdNo(num) {
      let data = await getIdNoIsExist(num);
      return data.data.data;
    },
  },
};
</script>

<style lang="scss" scoped>
.filter-input {
  margin-bottom: 10px;
}
.mod-sys__user {
  .role-list {
    .el-select {
      width: 100%;
    }
  }
}
.el-dialog {
  width: 60%;
}
.el-card__body {
  .el-form-item {
    margin-bottom: 15px;
  }
}
.treeSelectClass {
  line-height: 20px;
}
.avatar-uploader {
  text-align: center;
  padding-top: 30px;
}
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}
.avatar {
  width: 100px;
  height: 100px;
  display: block;
}
.input-style-for-div {
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  padding: 0 5px;
}
.flow-tree {
  //color: #ffffff;
  overflow: auto;
  flex: 1;
  height: auto;
  max-height: 300px;
  margin: 10px;
  :deep(.el-tree-node) {
    > .el-tree-node__children {
      overflow: visible !important;
    }
  }
}
</style>
