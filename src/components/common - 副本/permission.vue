<template>

  <div>


   

    <detail ref="role_from" name="role_detail" form-type="detail" service="srvauth_role_select" :defaultConditions="[{'colName': 'role_no', 'ruleType': 'eq', 'value': role_no}]"  @list-loaded="xxxx()" @form-loaded="initdetailpage()"></detail>

    <el-collapse accordion>
      <el-collapse-item title="设置当前角色接口权限" name="1">

        <el-tabs v-model="activeName">

          <el-tab-pane label="应用菜单" name="app_menu">

            <label for="role_no" class="el-form-item__label">选择设置应用:</label>
            <el-select @change="menuAppchange" v-model="selectMenuApp" filterable allow-create default-first-option placeholder="请选择设置应用">
              <el-option v-for="item in apps" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>

            <el-button v-if="readonly=='1'" type="primary" @click="submitAppMenuData()">设置权限</el-button>

            <el-row>
              <el-col :span="10">

                <el-card class="box-card">
                  <div slot="header" class="clearfix">
                    <span>源数据&nbsp;&nbsp;
                      <el-checkbox v-model="rightMenuAllState" @change="rightMenuSelectAll">全选</el-checkbox>
                    </span>
                  </div>
                  <el-tree ref="menu_source_tree" default-expand-all :data="source_menu_source" show-checkbox node-key="menu_no" :props="menu_pros"></el-tree>
                </el-card>
              </el-col>

              <el-col :span="4">
                <el-card class="box-card">

                  <el-container>

                    <el-header style="height: 100px;">

                    </el-header>
                    <el-header style="height: 90px;">

                      <el-button v-if="readonly=='1'" type="primary" @click="menu_right">向右移动</el-button><br>

                    </el-header>

                    <el-footer style="height: 90px;">
                      <el-button v-if="readonly=='1'" type="primary" @click="menu_left">向左移动</el-button>
                    </el-footer>

                  </el-container>

                </el-card>

              </el-col>

              <el-col :span="10">

                <el-card class="box-card">
                  <div slot="header" class="clearfix">
                    <span>目标数据&nbsp;&nbsp;
                      <el-checkbox v-model="leftMenuAllState" @change="leftMenuSelectAll">全选</el-checkbox>
                    </span>
                  </div>

                  <el-tree ref="menu_target_tree" default-expand-all :data="target_menu_source" show-checkbox node-key="menu_no" :props="menu_pros">
                  </el-tree>

                </el-card>

              </el-col>
            </el-row>

          </el-tab-pane>

          <el-tab-pane label="应用接口" name="app_srv">

            <label for="role_no" class="el-form-item__label">选择设置应用:</label>
            <el-select @change="srvAppchange" v-model="selectSrvApp" filterable allow-create default-first-option placeholder="请选择设置应用">
              <el-option v-for="item in apps" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>

            <el-button v-if="readonly=='1'" type="primary" @click="submitAppSrvData()">设置权限</el-button>

            <el-row>
              <el-col :span="10">

                <el-card class="box-card">
                  <div slot="header" class="clearfix">
                    <span>源数据 &nbsp;&nbsp;
                      <el-checkbox v-model="rightSrvAllState" @change="rightSrvSelectAll">全选</el-checkbox>
                    </span>
                  </div>
                  <el-tree ref="srv_source_tree" default-expand-all :data="source_srv_source" show-checkbox node-key="service_name" :props="srv_pros"></el-tree>

                </el-card>

              </el-col>

              <el-col :span="4">
                <el-card class="box-card">

                  <el-container>
                    <el-header style="height: 100px;">

                    </el-header>

                    <el-header style="height: 100px;">
                      <el-button v-if="readonly=='1'" type="primary" @click="srv_right">向右移动</el-button>
                    </el-header>

                    <el-footer style="height: 100px;">
                      <el-button v-if="readonly=='1'" type="primary" @click="srv_left">向左移动</el-button>
                    </el-footer>
                  </el-container>

                </el-card>

              </el-col>

              <el-col :span="10">

                <el-card class="box-card">
                  <div slot="header" class="clearfix">
                    <span>目标数据&nbsp;&nbsp;
                      <el-checkbox v-model="leftSrvAllState" @change="leftSrvSelectAll">全选</el-checkbox>
                    </span>
                    <!--
                    &nbsp;&nbsp;
                    <el-button type="text" @click="exclusiveSet()">独有权限设置</el-button>-->
                  </div>

                  <el-tree ref="srv_target_tree" default-expand-all :data="target_srv_source" show-checkbox node-key="service_name" :props="srv_pros">
                  </el-tree>

                </el-card>

              </el-col>
            </el-row>

          </el-tab-pane>

          <el-tab-pane label="系统菜单" name="menu">

            <el-row type="flex" class="row-bg" justify="start">

              <el-button v-if="readonly=='1'" type="primary" @click="submitMenuData()">设置权限</el-button>
            </el-row>

            <permission-set ref="sys_menu" service="srvauth_role_permission_select" :defaultCondition='menuCondType'></permission-set>

          </el-tab-pane>
          <el-tab-pane label="系统接口" name="srv">

            <el-row type="flex" class="row-bg" justify="start">
              <el-button v-if="readonly=='1'" type="primary" @click="submitSrvData()">设置权限</el-button>

            </el-row>
            <permission-set ref="sys_srv" service="srvauth_role_permission_select" :defaultCondition='srvCondType'></permission-set>

          </el-tab-pane>

        </el-tabs>

      </el-collapse-item>

    </el-collapse>


    <el-dialog title="独有权限设置" width="90%" :close-on-click-modal="1==2"
               append-to-body :visible="activeForm == 'exclusiveSet'"
               @close="activeForm = 'xx'">

    <el-tree ref="srv_target_tree_set" default-expand-all :data="target_srv_source" show-checkbox node-key="service_name" :props="srv_pros">
                      </el-tree>
      
    </el-dialog>

  </div>
</template>
<script>
import { GridInfo } from "../model/GridInfo";
import SimpleDetail from "./simple-detail";
import PermissionSet from "./permission-set";
import list from "./list";
import detail from "./detail.vue";

function deepClone(obj) {
  if (obj == null) return null;
  let newObj = obj instanceof Array ? [] : {};
  for (var i in obj) {
    newObj[i] = typeof obj[i] == "object" ? deepClone(obj[i]) : obj[i];
  }
  return newObj;
}

var removeByValue = function(sourceData, val) {
  //对数组原型添加删除指定项的方法
  for (var i = 0; i < sourceData.length; i++) {
    if (sourceData[i] == val) {
      sourceData.splice(i, 1);
      break;
    }
  }
};

export default {
  name: "treegrid",
  components: {
    SimpleDetail,
    PermissionSet,
    detail,
    list
  },
  props: {},
  data() {
    return {
      leftMenuAllState: false,
      rightMenuAllState: false,
      activeForm:"xx",
      leftSrvAllState: false,
      rightSrvAllState: false,
      target_srv_source: [],
      source_srv_source: [],
      srv_pros: {
        label: "service_view_name",
        children: "children"
      },

      target_menu_source: [],
      source_menu_source: [],
      menu_pros: {
        label: "menu_name",
        children: "children"
      },

      menuCondType: [
        { colName: "permision_type", ruleType: "eq", value: "menu" },
        {
          colName: "role_no",
          ruleType: "eq",
          value: this.$route.params.role_no
        }
      ],
      srvCondType: [
        { colName: "permision_type", ruleType: "eq", value: "srv" },
        {
          colName: "role_no",
          ruleType: "eq",
          value: this.$route.params.role_no
        }
      ],
      selectMenuApp: "",
      selectSrvApp: "",
      apps: [],

      role_no: this.$route.params.role_no,
      readonly: 1,
      activeName: "app_menu"
    };
  },
  methods: {
    xxxx(){

       var detailForm = this.$refs["role_from"];
    
    },
    exclusiveSet(){
      this.activeForm="exclusiveSet";
    },
    submitSrvData() {
      var sys_srv_data = this.$refs["sys_srv"].gridData;
      //var sys_menu_data = this.$refs["sys_menu"].gridData;

      var bxRequests = [];
      var request = {};
      request["serviceName"] = "srvauth_role_permission_save";
      var listdata = [{ sys_srv_data: sys_srv_data, role_no: this.role_no }];
      request["data"] = listdata;
      bxRequests.push(request);

      this.operate(bxRequests).then(response => {
        var state = response.body.state;

        if ("SUCCESS" == state) {
          this.$message({
            type: "success",
            message: "设置成功!"
          });
        } else {
          this.$message({
            type: "error",
            message: response.body.resultMessage
          });
        }
      });
    },
    submitAppSrvData() {
      var bxRequests = [];
      var request = {};
      request["serviceName"] = "srvauth_role_permission_save";
      var listdata = [
        {
          sys_add_data: this.target_srv_source,
          sys_delete_data: this.source_srv_source,
          role_no: this.role_no,
          app_no: this.selectSrvApp,
          update_type: "srv"
        }
      ];
      request["data"] = listdata;
      bxRequests.push(request);

      this.operate(bxRequests).then(response => {
        var state = response.body.state;

        if ("SUCCESS" == state) {
          this.$message({
            type: "success",
            message: "设置成功!"
          });
        } else {
          this.$message({
            type: "error",
            message: response.body.resultMessage
          });
        }
      });
    },
    submitMenuData() {
      var sys_menu_data = this.$refs["sys_menu"].gridData;
      var bxRequests = [];
      var request = {};
      request["serviceName"] = "srvauth_role_permission_save";
      var listdata = [{ sys_menu_data: sys_menu_data, role_no: this.role_no }];
      request["data"] = listdata;
      bxRequests.push(request);

      this.operate(bxRequests).then(response => {
        var state = response.body.state;

        if ("SUCCESS" == state) {
          this.$message({
            type: "success",
            message: "设置成功!"
          });
        } else {
          this.$message({
            type: "error",
            message: response.body.resultMessage
          });
        }
      });
    },
    submitAppMenuData() {
      var bxRequests = [];
      var request = {};
      request["serviceName"] = "srvauth_role_permission_save";
      var listdata = [
        {
          sys_add_data: this.target_menu_source,
          sys_delete_data: this.source_menu_source,
          role_no: this.role_no,
          app_no: this.selectMenuApp,
          update_type: "menu"
        }
      ];
      request["data"] = listdata;
      bxRequests.push(request);

      this.operate(bxRequests).then(response => {
        var state = response.body.state;

        if ("SUCCESS" == state) {
          this.$message({
            type: "success",
            message: "设置成功!"
          });
        } else {
          this.$message({
            type: "error",
            message: response.body.resultMessage
          });
        }
      });
    },
    rightMenuSelectAll(state) {
      if (state) {
        var dataNode = this.$refs.menu_source_tree.setCheckedNodes(
          this.source_menu_source
        );
      } else {
        this.$refs.menu_source_tree.setCheckedKeys([]);
      }
    },
    rightSrvSelectAll(state) {
      if (state) {
        var dataNode = this.$refs.srv_source_tree.setCheckedNodes(
          this.source_srv_source
        );
      } else {
        this.$refs.srv_source_tree.setCheckedKeys([]);
      }
    },
    leftMenuSelectAll(state) {
      if (state) {
        var dataNode = this.$refs.menu_target_tree.setCheckedNodes(
          this.target_menu_source
        );
      } else {
        this.$refs.menu_target_tree.setCheckedKeys([]);
      }
    },
    leftSrvSelectAll(state) {
      if (state) {
        var dataNode = this.$refs.srv_target_tree.setCheckedNodes(
          this.target_srv_source
        );
      } else {
        this.$refs.srv_target_tree.setCheckedKeys([]);
      }
    },
    menu_left() {
      this.leftMenuAllState = false;
      this.rightMenuAllState = false;

      var deleteNodes = this.$refs.menu_target_tree.getCheckedNodes();
      //先删除叶子节点 并且移动节点
      for (var deleteItem of deleteNodes) {
        if (deleteItem.is_leaf == "是") {
          var addnodes = [{}];
          this.deleteTreeArrayData(
            this.target_menu_source,
            deleteItem.menu_no,
            addnodes,
            "menu_no",
            "menu_name",
            "parent_no"
          );
          this.toMenuTargetData(this.source_menu_source, addnodes[0]);
        }
      }

      //如果存在父节点删除父节点
      for (var deleteItem of deleteNodes) {
        if (deleteItem.is_leaf != "是") {
          this.deleteTreeNode(
            this.target_menu_source,
            deleteItem.menu_no,
            "menu_no"
          );
        }
      }

      this.$refs.menu_target_tree.setCheckedKeys([]);
    },
    menu_right() {
      this.leftMenuAllState = false;
      this.rightMenuAllState = false;

      var deleteNodes = this.$refs.menu_source_tree.getCheckedNodes();

      //先删除叶子节点 并且移动节点
      for (var deleteItem of deleteNodes) {
        if (deleteItem.is_leaf == "是") {
          var addnodes = [{}];

          this.deleteTreeArrayData(
            this.source_menu_source,
            deleteItem.menu_no,
            addnodes,
            "menu_no",
            "menu_name",
            "parent_no"
          );

          this.toMenuTargetData(this.target_menu_source, addnodes[0]);
        }
      }

      //如果存在父节点删除父节点
      for (var deleteItem of deleteNodes) {
        if (deleteItem.is_leaf != "是") {
          this.deleteTreeNode(
            this.source_menu_source,
            deleteItem.menu_no,
            "menu_no"
          );
        }
      }

      this.$refs.menu_source_tree.setCheckedKeys([]);
    },
    srv_left() {
      this.leftSrvAllState = false;
      this.rightSrvAllState = false;

      var deleteNodes = this.$refs.srv_target_tree.getCheckedNodes();

      for (var deleteItem of deleteNodes) {
        if (deleteItem.is_leaf == "是") {
          var addnodes = [{}];
          this.deleteTreeArrayData(
            this.target_srv_source,
            deleteItem.service_name,
            addnodes,
            "service_name",
            "service_view_name",
            "parent_no"
          );
          this.toMenuTargetData(this.source_srv_source, addnodes[0]);
        }
      }

      //如果存在父节点删除父节点
      for (var deleteItem of deleteNodes) {
        if (deleteItem.is_leaf != "是") {
          this.deleteTreeNode(
            this.target_srv_source,
            deleteItem.service_name,
            "service_name"
          );
        }
      }
      this.$refs.srv_target_tree.setCheckedKeys([]);
    },
    srv_right() {
      this.leftSrvAllState = false;
      this.rightSrvAllState = false;
      var deleteNodes = this.$refs.srv_source_tree.getCheckedNodes();
      //先删除叶子节点 并且移动节点
      for (var deleteItem of deleteNodes) {
        if (deleteItem.is_leaf == "是") {
          var addnodes = [{}];
          this.deleteTreeArrayData(
            this.source_srv_source,
            deleteItem.service_name,
            addnodes,
            "service_name",
            "service_view_name",
            "parent_no"
          );
          this.toMenuTargetData(this.target_srv_source, addnodes[0]);
        }
      }

      //如果存在父节点删除父节点
      for (var deleteItem of deleteNodes) {
        if (deleteItem.is_leaf != "是") {
          this.deleteTreeNode(
            this.source_srv_source,
            deleteItem.service_name,
            "service_name"
          );
        }
      }

      this.$refs.srv_source_tree.setCheckedKeys([]);
    },
    toMenuTargetData(data, addnode) {
      var add_path = addnode.path;
      var i = 0;
      var len = data.length;
      if (len == 0) {
        data.push(addnode);
      } else {
        for (var i = 0; i < len; i++) {
          var item = data[i];
          var path = item.path;
          if (add_path == path) {
            //要添加的下级节点是子节点
            if (addnode.children[0].is_leaf == "是") {
              if (item.children) {
                item.children.push(addnode.children[0]);
              } else {
                item.children = [addnode.children[0]];
              }
            } else {
              this.toMenuTargetData(item.children, addnode.children[0]);
            }
            break;
          }

          if (i == data.length - 1) {
            data.push(addnode);
          }
        }
      }
    },
    getParentNode(data, parent_path) {
      var parent_item;
      for (var item of data) {
        var path = item["path"];
        if (parent_path == path) {
          parent_item = item;
          break;
        }
        var children_data = item.children;
        if (children_data) {
          parent_item = this.getParentNode(children_data, parent_path);
        }
      }

      return parent_item;
    },
    deleteTreeArrayData(
      data,
      deletenode,
      add_nodes,
      no_col,
      label_col,
      parent_no_col
    ) {
      var delete_result = false;
      for (var item of data) {
        var add_node = add_nodes[0];

        var unique_value = item[no_col];
        var is_leaf = item.is_leaf;
        var label = item[label_col];
        var parent_no = item[parent_no_col];
        var path = item.path;
        var service_type = item["service_type"];

        add_node[no_col] = unique_value;
        add_node["is_leaf"] = is_leaf;
        add_node[label_col] = label;
        add_node[parent_no_col] = parent_no;
        add_node["path"] = path;
        add_node["service_type"] = service_type;

        var childrenNodes = item.children;
        if (childrenNodes && childrenNodes.length > 0) {
          var add_childs = [{}];
          add_node.children = add_childs;
          add_node["path"] = path;
          delete_result = this.deleteTreeArrayData(
            childrenNodes,
            deletenode,
            add_childs,
            no_col,
            label_col,
            parent_no_col
          );
          if (delete_result) {
            break;
          }
        } else {
          if (deletenode == unique_value) {
            delete_result = true;
            removeByValue(data, item);
            break;
          }
        }
      }
      return delete_result;
    },

    deleteTreeNode(data, deletenode, unique_col) {
      for (var item of data) {
        var unique_col_value = item[unique_col];

        if (deletenode == unique_col_value) {
          removeByValue(data, item);
          break;
        }

        var childrenNodes = item.children;
        if (childrenNodes && childrenNodes.length > 0) {
          this.deleteTreeNode(childrenNodes, deletenode, unique_col);
        }
      }
    },
    srvAppchange(app) {
      this.setAppAuthCfg(app, "srv");
    },
    menuAppchange(app) {
      this.setAppAuthCfg(app, "menu");
    },
    async setAppList() {
      await this.select(
        "srvauth_run_apps_select",
        null,
        null,
        null
      ).then(response => {
        this.apps = response.body.data;
        this.selectMenuApp = this.apps[0].value;
        this.selectSrvApp = this.apps[0].value;
      });

      this.setAppAuthCfg(this.selectMenuApp);
    },
    setAppAuthCfg(app, type) {
      var conditions = [];
      var cMapRole = {};
      cMapRole["colName"] = "role_no";
      cMapRole["value"] = this.$route.params.role_no;
      cMapRole["ruleType"] = "eq";
      conditions.push(cMapRole);
      var cMapApp = {};
      cMapApp["colName"] = "app";
      cMapApp["value"] = app;
      cMapApp["ruleType"] = "eq";
      conditions.push(cMapApp);

      //加载表格数据
      this.select(
        "srvauth_role_app_permission_select",
        conditions,
        null,
        null
      ).then(response => {
        if (type && type == "menu") {
          this.target_menu_source = response.body.menu_target_data;
          this.source_menu_source = response.body.menu_source_data;
        } else if (type && type == "srv") {
          this.target_srv_source = response.body.srv_target_data;
          this.source_srv_source = response.body.srv_source_data;
        } else {
          this.target_menu_source = response.body.menu_target_data;
          this.source_menu_source = response.body.menu_source_data;
          this.target_srv_source = response.body.srv_target_data;
          this.source_srv_source = response.body.srv_source_data;
        }
      });
    },
    initdetailpage(detail) {
      var detailForm = this.$refs["role_from"].$refs["simple-detail"];
      detailForm.actions.nav2update.visible = false;
    }
  },
  created: function() {
    if (this.$route.query && this.$route.query.readonly) {
      this.readonly = this.$route.query.readonly;
    }
    this.setAppList();
  },
  mounted: function() {}
};
</script>

<style scoped>
.box-card {
  height: 450px;
  overflow: scroll;
}
.el-header,
.el-footer {
  text-align: center;
  line-height: 100px;
}
</style>