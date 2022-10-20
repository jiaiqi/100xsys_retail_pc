<template>
  <div
    id="proc_detail"
    v-loading="isLoaded"
  >

    <!--流程图-->
    <el-card class="box-card">
      <div class="text item">
        <el-row>
          <!-- <el-col :span="20"> -->

          <el-steps
            ref="stepsChart"
            :finish-status="proHanleData.finishStatus"
            v-if="isStepDataReady()"
            :process-status="proHanleData.processStatus"
            v-bind:active="proHanleData.activeStep"
            align-center
          >

            <el-step
              :status="getstatus(item)"
              :icon="geticon(item)"
              v-bind:class="{ div_click_class: item.step_no==handle_active_step_no }"
              v-for="(item, index)  in proCharData"
              @click.native="step_switch(item,index)"
              :key="index+1"
            >
              <template slot="title">
                <div
                  v-if="item.state!='未开始'"
                  :class="isallowclick(item) ? 'step_handle_css' : '' "
                >
                  {{item.step_name}}
                </div>
                <div v-else>
                  {{item.step_name}}
                </div>
              </template>

              <template slot="description">
                {{getStepDesprition(item)}}</br>{{getStepHandleTime(item)}}
              </template>

            </el-step>
            <el-step
              @click.native="showRecord()"
              :key="proCharData.length + 1"
              icon="el-icon-tickets"
              v-bind:class="{ div_click_class: handle_active_step_no == '_approval_record_' }"
              description=""
              status="finish"
            >
              <template slot="title">
                <div style="cursor:pointer">流程审批记录</div>
              </template>
            </el-step>
          </el-steps>

        </el-row>

      </div>
    </el-card>

    <!--业务表单、列表和审批表单-->
    <el-card
      class="box-card"
      v-show="handle_active_step_no != '_approval_record_'"
    >
      <div
        slot="header"
        class="clearfix"
      >
        <span>{{handle_active_step_name}}</span>

      </div>

      <template v-for="(step_item, index) in proCharData">

        <!--v-show 是控制显示隐藏的 当前激活节点-->
        <div
          class="text item"
          :key="index"
          v-show="handle_active_step_no==step_item.step_no"
        >

          <!--审核过的数据显示 条件不等于当前审核步骤-->
          <div v-if="handle_active_step_no==step_item.step_no">

            <template v-for="(biz_item, index) in step_item.biz_cfg_data">

              <!--业务只读列表-->
              <el-form
                label-width="130px"
                label-suffix=":"
                v-if="(step_item.step_no!=proHanleData.step_no||proc_basic.is_finsh) && biz_item.type=='grid'"
                v-show="bizDataStepReadVisible[step_item.step_no] !== false"
                :key="step_item.step_no+index+'_list'"
              >

                <el-row>

                  <div
                    class="el-col el-col-24 el-col-xl-24"
                    :key="step_item.step_no+index+'_list'"
                  >
                    <div class="el-form-item">
                      <span class="section-title">{{biz_item["_section_name"]}}</span>
                    </div>
                  </div>

                  <el-col :span="24">

                    <proc-simple-list
                      @proc-simple-list-loaded="onProcSimpleListLoad"
                      :name="'stepr' +step_item.step_no + 'i' + index "
                      :foreign-key="biz_item._foreign_key[0]"
                      :service="biz_item.select_service"
                      list-type="procdetaillist"
                      :default-condition="[{'colName':'parent_proc_instance_no','ruleType':'eq','value':proc_instance_no}]"
                    >
                    </proc-simple-list>
                  </el-col>
                </el-row>

              </el-form>

              <!--审批表单详情-->
              <div
                v-if="(step_item.step_no!=proHanleData.step_no||proc_basic.is_finsh)&&biz_item.type=='form' &&biz_item.select_service=='srvprocess_record_select'"
                :key="step_item.step_no+index+'_record_result'"
              >

                <el-form
                  label-width="130px"
                  label-suffix=":"
                >
                  <el-row>

                    <div
                      class="el-col el-col-24 el-col-xl-24"
                      :key="step_item.step_no+index+'_list_section'"
                    >
                      <div class="el-form-item">
                        <span class="section-title">审批说明</span>
                      </div>
                    </div>

                    <el-col :span="6">
                      <!-- 11111111111 -->
                      <el-form-item
                        label="意见"
                        prop="proc_result"
                      >
                        <el-input
                          :readonly="1==1"
                          :value="step_item.proc_result[step_item._record_data.proc_result]"
                        ></el-input>

                      </el-form-item>

                    </el-col>
                    <el-col :span="24">
                      <el-form-item
                        label="审批意见"
                        prop="remark"
                      >
                        <el-input
                          type="textarea"
                          :value="step_item._record_data.remark"
                          :readonly="1==1"
                          :autosize="{ minRows: 6, maxRows: 8}"
                        ></el-input>
                      </el-form-item>
                    </el-col>
                    <el-col :span="24">
                      <el-form-item
                        label="附件"
                        prop="remark"
                      >

                        <a
                          v-for=" (file, index) in  step_item._record_data._fileList "
                          :key="index+'_file'"
                          :href="serviceApi().downloadFile+file.fileurl"
                        >
                          {{file.src_name}}</a>

                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form>
              </div>

              <!--业务详情-->
              <div
                v-else-if="(step_item.step_no!=proHanleData.step_no||proc_basic.is_finsh)&&biz_item.type=='form'"
                v-show="bizDataStepReadVisible[step_item.step_no] !== false"
                :key="step_item.step_no+index+'_detail'"
              >

                <detail
                  form-type="procdetail"
                  :name="'stepr' +step_item.step_no + 'i' + index "
                  ref="proc-simple-detail"
                  :service="biz_item.select_service"
                  :default-conditions="getFormViewCondition(biz_item,step_item.step_no)"
                ></detail>

              </div>

            </template>

          </div>

          <!--（开启流程/申请步骤）form表单数据 条件等于当前审核步骤-->
          <el-form
            label-width="100px"
            label-suffix=":"
            v-if="step_item.step_no==proHanleData.step_no&&proHanleData._handle_type=='start_proc'&&initload"
          >

            <el-row>

              <!--子表数据-->
              <template v-for="(biz_item, index) in proHanleData.biz_cfg_data">

                <el-col
                  v-if="biz_item.type=='grid'"
                  :key="step_item.step_no+index+'_list'"
                  :span="24"
                >

                  <div
                    class="el-col el-col-24 el-col-xl-24"
                    :key="step_item.step_no+index+'_list_section'"
                  >
                    <div class="el-form-item">
                      <span class="section-title">{{biz_item["_section_name"]}}</span>
                    </div>
                  </div>

                  <el-col :span="24">

                    <proc-simple-list
                      :name="'apply_list' + index"
                      @proc-simple-list-loaded="onProcSimpleListLoad"
                      :foreign-key="biz_item._foreign_key[0]"
                      :service="biz_item.select_service"
                      :list-type="biz_item['_type_grid']=='readGrid'?'procdetaillist':'prochandlelist'"
                      :default-condition="[{'colName':'parent_proc_instance_no','ruleType':'eq','value':proc_instance_no}]"
                    >
                    </proc-simple-list>
                  </el-col>

                </el-col>

                <el-col
                  v-if="biz_item.type=='form'"
                  :key="step_item.step_no+index+'_list'"
                  :span="24"
                >

                  <update
                    v-if="biz_item._type_form=='update'"
                    :name="'apply_update' + index"
                    ref="proc-update-form-submit"
                    :service="biz_item.update_service"
                    pk-col="proc_instance_no"
                    :pk="proc_instance_no"
                    @form-loaded="onStartProcFormLoaded('update')"
                  ></update>

                  <add
                    v-else
                    :name="'apply_add' + index"
                    :def-data-para="defDataPara"
                    :default-values="startProcDefaultValue"
                    ref="proc-add-form-submit"
                    :service="biz_item.add_service"
                    @form-loaded="onStartProcFormLoaded('add')"
                  ></add>

                </el-col>

              </template>

            </el-row>

            <el-row
              type="flex"
              class="row-bg"
              justify="center"
            >

              <el-button
                type="primary"
                :disabled="submitStatus === 'occupy'"
                @click="submitProc((proc_instance_no==''||proc_instance_no==undefined)?'add':'update','submit')"
              >
                提交
              </el-button>

              <el-button
                type="primary"
                @click="submitProc((proc_instance_no==''||proc_instance_no==undefined)?'add':'update','save')"
              >
                保存草稿
              </el-button>

            </el-row>

          </el-form>

          <!--审核流程form表单数据 条件等于当前审核步骤-->
          <el-form
            label-width="10rem"
            label-suffix=":"
            :model="approval_form"
            ref="approval_form"
            v-if="step_item.step_no==proHanleData.step_no&&proHanleData._handle_type=='approval_proc'"
          >

            <el-row v-if="proHanleData.authority">

              <template v-for="(biz_item, index) in proHanleData.biz_cfg_data">

                <div
                  class="el-col el-col-24 el-col-xl-24"
                  :key="step_item.step_no+index+'_list_section'"
                >
                  <div class="el-form-item">
                    <span class="section-title">{{biz_item['_section_name']}}</span>
                  </div>
                </div>

                <!--子表数据-->
                <el-col
                  v-if="biz_item.type=='grid'"
                  :key="step_item.step_no+index+'_list'"
                  :span="24"
                >

                  <proc-simple-list
                    :name="'apv' + step_item.step_no + 'i'+ index"
                    @proc-simple-list-loaded="onProcSimpleListLoad"
                    :foreign-key="biz_item._foreign_key[0]"
                    :list-type="biz_item['_type_grid']=='readGrid'?'procdetaillist':'prochandlelist'"
                    :storage-type="step_item.list_storage_type || 'mem'"
                    :service="biz_item.select_service"
                    :default-condition="[{'colName':'parent_proc_instance_no','ruleType':'eq','value':proc_instance_no}]"
                  >
                  </proc-simple-list>

                </el-col>

                <!--审批步骤业务表单-->
                <el-col
                  v-if="biz_item.type=='form'"
                  :key="step_item.step_no+index+'_list'"
                  :span="24"
                >

                  <simple-update
                    v-if="biz_item._type_form=='update'"
                    :name="'apv' + step_item.step_no + 'i' + index"
                    ref="proc-update-form-approval"
                    :service="biz_item.update_service"
                    :pk-col="biz_item.biz_type=='main'?'proc_instance_no':'parent_proc_instance_no'"
                    :pk="proc_instance_no"
                    @form-loaded="onStepFormLoaded('update',biz_item._uuid)"
                  ></simple-update>

                  <simple-add
                    v-if="biz_item._type_form=='add'"
                    :name="'apv' + step_item.step_no + 'i'+ index"
                    ref="proc-add-form-approval"
                    :service="biz_item.add_service"
                    @form-loaded="onStepFormLoaded('add',biz_item._uuid)"
                  ></simple-add>

                  <detail
                    :is_view_title="1==2"
                    v-if="biz_item._type_form=='select'"
                    :name="'apv' + step_item.step_no + 'i'+ index"
                    form-type="procdetail"
                    name="proc-simple-detail"
                    :service="biz_item.select_service"
                    :default-conditions="getFormViewCondition(biz_item,step_item.step_no)"
                  ></detail>

                </el-col>
              </template>
            </el-row>

            <!--审批表单-->
            <el-row v-if="proHanleData.authority&&proHanleData.approval_options.length>0">
              <div
                class="el-col el-col-24 el-col-xl-24"
                :key="step_item.step_no+index+'_list_section'"
              >
                <div class="el-form-item">
                  <span class="section-title">审批操作</span>
                </div>
              </div>

              <el-col :span="24">

                <el-form-item
                  label="意见"
                  prop="proc_result"
                  v-show="proHanleData.approval_options.length > 1 || (proHanleData.approval_options.length === 1 && proHanleData.approval_options[0].show !== false)"
                  :rules="{required: true, message: '审批意见不能为空', trigger: 'change'}"
                >

                  <el-radio
                    border
                    v-for="item in proHanleData.approval_options"
                    :key="item.value"
                    v-model="approval_form.proc_result"
                    :label="item.value"
                  >{{item.disp}}
                  </el-radio>

                </el-form-item>

              </el-col>

              <el-col
                :span="6"
                v-if="approval_form.proc_result=='turn'"
              >

                <el-form-item
                  label="转派用户"
                  prop="turn_user_no"
                  :rules="{required: true, message: '用户不能为空', trigger: 'change'}"
                >

                  <el-select
                    @focus="findTurnUser('')"
                    v-model="approval_form.turn_user_no"
                    filterable
                    remote
                    placeholder="请选择转派用户"
                    :remote-method="findTurnUser"
                  >

                    <el-option
                      v-for="item in approval_form.userOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    >
                    </el-option>

                  </el-select>

                </el-form-item>

              </el-col>

              <el-col
                :span="24"
                v-if="approval_form.proc_result=='return'"
              >

                <el-form-item
                  label="返回步骤"
                  prop="step_no"
                  :rules="{required: true, message: '步骤不能为空', trigger: 'change'}"
                >

                  <el-radio
                    border
                    v-for="item in proHanleData.return_options"
                    :key="item.value"
                    v-model="approval_form.step_no"
                    :label="item.value"
                  >{{item.disp}}
                  </el-radio>

                </el-form-item>

              </el-col>

              <el-col
                :span="24"
                v-if="getRemarkFileShow('remark')"
              >
                <el-form-item
                  label="审批意见"
                  prop="remark"
                  :rules="getRemarkRules()"
                >
                  <el-input
                    type="textarea"
                    v-model="approval_form.remark"
                    :autosize="{ minRows: 4, maxRows: 6}"
                  ></el-input>
                </el-form-item>
              </el-col>

              <el-col :span="24">

                <el-form-item
                  label="附件"
                  prop="file_no"
                  v-if="getRemarkFileShow('files')"
                >

                  <upload-file :field="uplaodFiled"></upload-file>
                </el-form-item>

              </el-col>

              <el-col :span="24">
                <el-row
                  type="flex"
                  class="row-bg"
                  justify="center"
                >
                  <el-form-item>
                    <el-button
                      type="primary"
                      @click="submitApprovalForm('approval_form')"
                    >提交
                    </el-button>
                    <el-button @click="resetForm('approval_form')">重置
                    </el-button>

                  </el-form-item>
                </el-row>
              </el-col>

            </el-row>

            <el-row
              type="flex"
              class="row-bg"
              justify="center"
              v-else-if="!proHanleData.authority&&!proc_basic.is_finsh"
            >
              {{ getNoAuthorityMessage() }}
            </el-row>

          </el-form>

        </div>

      </template>

    </el-card>

    <!--流程审批记录-->
    <el-card
      class="box-card"
      v-if="page_type!='approval'&&handle_active_step_no == '_approval_record_'"
    >
      <div
        slot="header"
        class="clearfix"
      >
        <span>流程审批记录</span>

      </div>
      <div class="text item">

        <proc-simple-list
          service="srvprocess_record_select"
          list-type="procdetaillist"
          :default-order="[{'colName':'id','orderType':'desc'}]"
          :default-condition="record_default_condition"
        >
        </proc-simple-list>
      </div>
    </el-card>

  </div>

</template>


<style scoped>
.step_handle_css {
  cursor: pointer;
}
</style>


<script>
import procSimpleList from "./proc-simple-list.vue";
import simpleDetail from "./simple-detail.vue";
import detail from "./detail.vue";
import SimpleAdd from "./simple-add.vue";
import add from "./add.vue";
import update from "./update.vue";
import SimpleUpdate from "./simple-update.vue";
import UploadFile from "../ui/upload-file.vue";

var init_page_index = 0;
export default {
  name: "procdetail",
  components: {
    procSimpleList,
    simpleDetail,
    SimpleAdd,
    SimpleUpdate,
    UploadFile,
    add,
    update,
    detail,
  },
  props: {
    name: {
      type: String,
      default: "main",
    },
    serviceProp: {
      type: String,
    },

    procInstanceNoProp: {
      type: String,
    },

    navigateHandler: {
      type: Function,
    },
  },
  watch: {
    proHanleData: function (data) {
      if (
        data != undefined &&
        data.approval_options != undefined &&
        data.approval_options.length == 1
      ) {
        this.approval_form.proc_result = data.approval_options[0]["value"];
        if (
          this.approval_form.proc_result == "return" &&
          data.return_options.length == 1
        ) {
          this.approval_form.step_no = data.return_options[0]["value"];
        }
      }
    },
    approval_form: {
      handler: function (data) {
        if (
          data.proc_result == "return" &&
          this.proHanleData.return_options.length == 1
        ) {
          data.step_no = this.proHanleData.return_options[0]["value"];
        }
      },
      deep: true,
    },
  },
  data() {
    return {
      submitStatus: "unwanted", //unwanted 空闲 // occupy 占用
      // true：当审核不通过时，不带业务数据
      noBizDataWhenNoPass: false,
      noAuthorityErrorMessage: null,
      apvTurnUserOtionsFunc: null,
      bizDataStepReadVisible: {},
      hideOnlyApvOption: false,
      timeId: null,
      interval: null,
      save_data_str: "",
      proc_instance_no: null,
      mainData: {},
      startProcDefaultValue: {},
      initload: false,
      service_name: null,
      record_activeNames: ["1"],
      record_default_condition: [],
      existsGridButton: false,
      handle_active_step_name: "",
      handle_active_step_no: "",
      proCharData: [],
      proHanleData: {},
      proc_basic: {},
      stepForm: [],
      startFrom: null,
      recordShow: false,
      defDataPara: null,
      uplaodFiled: {
        info: {
          editable: true,
        },
        fileDesc: "请上传文件,大小不超过50MB",
        fileSize: 6200,
        fileType: "",
        model: "",
      },
      approval_form: {
        proc_result: "",
        remark: "",
        file_no: "",
        turn_user_no: "",
        turn_step_no: "",
        step_no: "",
        userOptions: [],
      },
      button_info: null,
      page_type: "approval",
      // 可以提交的_ 开始的字段
      submitableLodashCols: [],
      isLoaded: false,
    };
  },
  methods: {
    getNoAuthorityMessage() {
      let defaultMsg = `您无权限处理......`;
      return this.noAuthorityErrorMessage
        ? this.noAuthorityErrorMessage
        : defaultMsg;
    },
    isStepDataReady() {
      return !_.isEmpty(this.proHanleData) && !_.isEmpty(this.proCharData);
    },

    isFinished() {
      return (
        !_.isUndefined(this.proHanleData.finishStatus) &&
        !_.isNull(this.proHanleData.finishStatus)
      );
    },

    isInApplyStep() {
      return (
        !this.isFinished() &&
        this.proHanleData.step_no === this.proc_basic.init_step_no
      );
    },

    isApplyWithDraft() {
      return this.isInApplyStep() && !!this.proc_instance_no;
    },

    isInApproveStep() {
      return !this.isFinished() && !this.isInApplyStep();
    },

    prevalidate(data) {
      let vm = this;
      if (this.button_info != null) {
        let action_validate = this.button_info.action_validate;
        if (
          action_validate != null &&
          action_validate != "" &&
          action_validate != undefined
        ) {
          return eval("var zz=" + action_validate + "(vm,data); zz");
        } else {
          return true;
        }
      } else {
        return true;
      }
    },
    onProcSimpleListLoad(simpleList) {
      let gridService = simpleList.service;

      for (let item_biz of this.proHanleData.biz_cfg_data) {
        if (item_biz["select_service"] == gridService) {
          item_biz._simpleListInstance = simpleList;
          break;
        }
      }
    },
    isallowclick(item) {
      let view_rule = this.proc_basic.view_rules;
      if (top.user != undefined) {
        let login_user = top.user.user_no;

        if (view_rule != "" && view_rule != null && view_rule != undefined) {
          view_rule = JSON.parse(view_rule);

          //申请人查看逻辑判断
          let applicant = view_rule.applicant;
          if (applicant == "all") {
            let applyuser = this.mainData.create_user;
            if (login_user == applyuser) {
              return true;
            }
          }
          //审核人查看逻辑判断
          let reviewer = view_rule.reviewer;

          if (reviewer == "all_review_step") {
            let handUser = item._approval_user_no;
            if (handUser == "" || handUser == undefined || handUser == null) {
              return false;
            } else {
              let handUsers = handUser.split(",");
              return handUsers.includes(login_user);
            }
          }

          return false;
        } else {
          return true;
        }
      } else {
        return true;
      }
    },
    getstatus(item) {
      if (item.state == "未开始") {
        return "wait";
      } else if (item.state == "已处理" && item._approval_user == null) {
        return "wait";
      } else if (item.state == "已处理") {
        return "success";
      } else {
        return "finish";
      }
      // return item.state === '未开始' ? 'wait': item.state === '已处理' ? 'success' : 'finish';
    },
    geticon(item) {
      let icon = "";
      if (item.state == "已处理" && item._approval_user == null) {
        icon = "el-icon-remove-outline";
      }
      return icon;
    },
    showRecord() {
      this.handle_active_step_no = "_approval_record_";
    },
    getRemarkFileShow(type) {
      let selectResult = this.approval_form.proc_result;
      if (selectResult == "") {
        return false;
      }
      let isShow = true;
      for (let item of this.proHanleData.approval_options) {
        if (item.value == selectResult) {
          let type_value = item[type];

          if (type_value == undefined || type_value == null) {
            isShow = true;
          } else if (!type_value) {
            isShow = false;
          }
          break;
        }
      }
      return isShow;
    },
    getRemarkRules() {
      if (this.approval_form.proc_result == "pass") {
        return {};
      } else {
        return { required: true, message: "说明不能为空", trigger: "blur" };
      }
    },
    step_switch(stepItem, index) {
      if (this.isallowclick(stepItem)) {
        if (stepItem["state"] != "未开始") {
          if (
            !(
              stepItem["state"] == "已处理" &&
              stepItem["_approval_user"] == null
            )
          ) {
            this.handle_active_step_name = stepItem.step_name;
            this.handle_active_step_no = stepItem.step_no;
          }
        }
      }
    },

    findTurnUser(query) {
      let service_name = "srvsso_user_select";
      let condition = [
        { colName: "user_disp", value: query, ruleType: "like" },
      ];
      let page = { pageNo: 1, rownumber: 50 };

      setTimeout(() => {
        let url = window.backendIpAddr + "/sso/select/" + service_name;
        let selectPromise = this.doSelect(url, service_name, condition, page);
        if (this.apvTurnUserOtionsFunc) {
          selectPromise = this.apvTurnUserOtionsFunc.bind(this)();
        }
        selectPromise.then((response) => {
          this.approval_form.userOptions = [];
          let dataList = response.body.data;
          for (let item of dataList) {
            let option = { label: item.user_disp, value: item.user_no };
            this.approval_form.userOptions.push(option);
          }
        });
      }, 200);
    },

    timedSave() {
      let me = this;

      if (
        this.proc_basic.init_step_no == this.proHanleData.step_no &&
        this.proHanleData.authority == true &&
        this.interval != null
      ) {
        this.timeId = setInterval(() => {
          if (
            me.proc_instance_no != undefined &&
            me.proc_instance_no != null &&
            me.proc_instance_no != ""
          ) {
            me.start("update", "save", true);
          } else {
            me.start("add", "save", true);
          }
        }, this.interval * 1000);
      }
    },
    onStartProcFormLoaded(operate_type) {
      let me = this;

      let form = null;
      if (operate_type == "add") {
        form = this.$refs["proc-add-form-submit"][0];
      } else {
        form = this.$refs["proc-update-form-submit"][0];
      }

      if (form.actions.submit != undefined) {
        form.actions.submit.visible = false;
      }
      if (form.actions.reset != undefined) {
        form.actions.reset.visible = false;
      }

      this.startFrom = form;

      let formData = this.startFrom.srvValFormModel();
      delete formData["id"];
      this.save_data_str = JSON.stringify(formData);
    },
    async submitProc(operate_type, procState) {
      let me = this;
      let validate_result = false;
      if (procState == "submit") {
        me.submitStatus = "occupy"; //unwanted 空闲 // occupy 占用
        await this.startFrom
          .validateForm()
          .then(function () {
            validate_result = true;
          })
          .catch(function () {
            validate_result = false;
            me.submitStatus = "unwanted"; //unwanted 空闲 // occupy 占用
          });

        if (!validate_result) {
          return;
        }
      }
      this.$confirm("是否确认提交", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "info",
      })
        .then(() => {
          this.start(operate_type, procState);
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消操作",
          });

          me.submitStatus = "unwanted"; //unwanted 空闲 // occupy 占用
        });
    },

    onStepFormLoaded(operate_type, uuid) {
      let me = this;

      if (operate_type == "add") {
        let form = null;

        form = this.$refs["proc-add-form-approval"][0];
        form.actions.submit.visible = false;
        form.actions.reset.visible = false;

        if (form == null) {
          return;
        }

        let stepInstance = {};
        stepInstance[uuid] = form;
        this.stepForm.push(stepInstance);

        let i = 0;
        form.$watch(
          function () {
            form.srvValFormModel();
          },
          function (newData, oldData) {
            if (i == 0) {
              for (let item of me.proHanleData.biz_cfg_data) {
                let addData = form.srvValFormModel();

                if (item._uuid == uuid) {
                  for (let key in addData) {
                    item._data_form[key] = addData[key];
                    item._old_data_form[key] = addData[key];
                  }
                }
              }
            } else {
              for (let item of me.proHanleData.biz_cfg_data) {
                let addData = form.srvValFormModel();

                if (item._uuid == uuid) {
                  for (let key in addData) {
                    item._data_form[key] = addData[key];
                  }
                }
              }
            }
            i++;
          },
          { deep: true }
        );
      } else if (operate_type == "update") {
        let forms = this.$refs["proc-update-form-approval"];

        for (let form of forms) {
          //form = this.$refs["proc-update-form-approval"][0];

          if (form.actions.submit != undefined) {
            form.actions.submit.visible = false;
          }
          form.actions.reset.visible = false;
          if (form == null) {
            return;
          }

          let stepInstance = {};
          stepInstance[uuid] = form;
          this.stepForm.push(stepInstance);

          //初始化数据值
          for (let item of me.proHanleData.biz_cfg_data) {
            let updateFromData = form.srvValFormModel4Update;

            if (item._uuid == uuid) {
              for (let key in updateFromData) {
                item._data_form[key] = updateFromData[key];
                item._old_data_form[key] = updateFromData[key];
              }
            }
          }

          let i = 0;
          form.$watch(
            function () {
              form.srvValFormModel4Update;
            },
            function (newData, oldData) {
              for (let item of me.proHanleData.biz_cfg_data) {
                let updateFromData = form.srvValFormModel4Update;

                if (item._uuid == uuid) {
                  for (let key in updateFromData) {
                    item._data_form[key] = updateFromData[key];
                  }
                }
              }

              i++;
            },
            { deep: true }
          );
        }
      }
    },
    getFormViewCondition(item, step_no) {
      let conditions = [];
      let condition = null;

      if (item.biz_type == "child") {
        condition = {
          colName: "parent_proc_instance_no",
          ruleType: "eq",
          value: this.proc_instance_no,
        };
      } else {
        condition = {
          colName: "proc_instance_no",
          ruleType: "eq",
          value: this.proc_instance_no,
        };
      }

      conditions.push(condition);

      if (item["select_service"] == "srvprocess_record_select") {
        let condition = { colName: "step_no", ruleType: "eq", value: step_no };
        conditions.push(condition);
      }

      return conditions;
    },
    getStepDesprition(item) {
      let desc = item.state;

      if (item.state == "已处理" && item["_approval_user"] == null) {
        desc = "跳过";
      } else if (
        item["_approval_user"] != "" &&
        item["_approval_user"] != undefined
      ) {
        desc = desc + "(" + item["_approval_user"] + ")";
      }

      return desc;
    },
    getStepHandleTime(item) {
      let desc = "";
      if (item._record_data != undefined) {
        desc = item._record_data.create_time;
      }
      return desc;
    },

    async initProcData() {
      //第一次申请查询基本信息
      if (this.service_name != "" && this.service_name != undefined) {
        this.page_type = "approval";
        let proc_basic_srv = "srvprocess_basic_cfg_select";
        let condition = [
          {
            colName: "service_name",
            ruleType: "eq",
            value: this.service_name,
          },
        ];

        //
        await this.select(proc_basic_srv, condition).then((response) => {
          let respData = response.body;
          if (respData.state == "SUCCESS") {
            this.proCharData = response.body.proCharData;

            this.proHanleData = response.body.proHanleData;
            this.button_info = response.body.button;

            if (this.proHanleData.approval_options != undefined) {
              for (let item of this.proHanleData.approval_options) {
                let key = item.key;

                if (key == undefined) {
                  let key_value = item["value"];
                  item["key"] = key_value;
                  item["key_value"] = key_value;
                } else {
                  let key_value = item["value"];
                  item["value"] = key;
                  item["key_value"] = key_value;
                }
              }
            }

            this.handle_active_step_name = this.proHanleData.step_name;
            this.handle_active_step_no = this.proHanleData.step_no;
            this.proc_basic = response.body.proc_basic;
            this.mainData = response.body.mainData;
            if (
              this.proc_basic.save_period == undefined ||
              this.proc_basic.save_period == null ||
              this.proc_basic.save_period == ""
            ) {
              this.interval == null;
            } else {
              this.interval = this.proc_basic.save_period;
              this.timedSave();
            }

          
          }

          this.emitEvent("metadata-loaded", this);
        });
      } else {
        this.page_type = "detail";
        //流程详情页面
        this.record_default_condition = [
          {
            colName: "proc_instance_no",
            value: this.proc_instance_no,
            ruleType: "eq",
          },
        ];
        let proc_basic_srv = "srvprocess_basic_cfg_select";
        let condition = [
          {
            colName: "proc_instance_no",
            ruleType: "eq",
            value: this.proc_instance_no,
          },
        ];
        //
        await this.select(proc_basic_srv, condition).then((response) => {
          this.proCharData = response.body.proCharData;
          this.proHanleData = response.body.proHanleData;

          if (this.proHanleData.approval_options != undefined) {
            for (let item of this.proHanleData.approval_options) {
              let key = item.key;

              if (key == undefined) {
                let key_value = item["value"];
                item["key"] = key_value;
                item["key_value"] = key_value;
              } else {
                let key_value = item["value"];
                item["value"] = key;
                item["key_value"] = key_value;
              }
            }
          }

          this.proc_basic = response.body.proc_basic;
          this.handle_active_step_name = this.proHanleData.step_name;
          this.handle_active_step_no = this.proHanleData.step_no;
          this.mainData = response.body.mainData;
          if (
            this.proc_basic.save_period == undefined ||
            this.proc_basic.save_period == null ||
            this.proc_basic.save_period == ""
          ) {
            this.interval == null;
          } else {
            this.interval = this.proc_basic.save_period;
            this.timedSave();
          }

          this.emitEvent("metadata-loaded", this);
        });
      }

      
    },
    getMainChildCfg(constraint_name) {
      let relationCfg = "";
      if (
        this.startFrom.childrenList != undefined &&
        this.startFrom.childrenList.length > 0
      ) {
        let childrenList = this.startFrom.childrenList;
        for (let item of childrenList) {
          let foreign_key = item.foreign_key;
          if (foreign_key["constraint_name"] == constraint_name) {
            relationCfg = item;
            break;
          }
        }
      }
      return relationCfg;
    },
    getRowButtonService(type, rowButton) {
      let serviceName = "";
      for (let item of rowButton) {
        if (type == item.button_type) {
          serviceName = item["service_name"];
          break;
        }
      }
      return serviceName;
    },
    start(operate_type, procState, timerSave) {
      let bxRequests = [];
      let bxRequest = {};
      bxRequests.push(bxRequest);

      if ("add" == operate_type) {
        bxRequest["serviceName"] = this.proc_basic.add_service;
      } else {
        bxRequest["serviceName"] = this.proc_basic.update_service;
        bxRequest["condition"] = [
          {
            colName: "proc_instance_no",
            ruleType: "eq",
            value: this.proc_instance_no,
          },
        ];
        bxRequest["proc_instance_no"] = this.proc_instance_no;
      }

      bxRequest["data"] = [];

      let formData = this.startFrom.srvValFormModel();

      //构建主表数据
      let mainData = {};
      for (let key in formData) {
        if (key != "id" && key !== "_children") {
          mainData[key] = formData[key];
        }
      }
      bxRequest["data"].push(mainData);

      let _children = formData._children;
      if (_children != undefined && _children != "" && _children != null) {
        let formBxRequestData = this.startFrom.buildRunQuries();
        mainData["child_data_list"] =
          formBxRequestData[0].data[0].child_data_list;
      } else {
        mainData["child_data_list"] = [];
        //查询看是否存在相关子表数据
        let biz_cfg_data = this.proHanleData.biz_cfg_data;
        for (let item of biz_cfg_data) {
          if (item["biz_type"] == "child") {
            let simpleList = item._simpleListInstance;
            if (simpleList != undefined) {
              let childDataList = simpleList.getListData();

              for (let itemData of childDataList) {
                let childRequest = {};

                if ("add" == itemData._dirtyFlags) {
                  childRequest["serviceName"] = item["add_service"];
                  let dataArray = [];
                  let dataMap = {};
                  for (let datakey in itemData) {
                    if (this.isSubmitableCol(datakey)) {
                      dataMap[datakey] = itemData[datakey];
                    }
                  }
                  dataArray.push(dataMap);
                  childRequest.data = dataArray;
                  let depend_keys = this.getDependKey(item["_foreign_key"]);
                  childRequest["depend_keys"] = depend_keys;
                } else if ("update" == itemData._dirtyFlags) {
                  childRequest["serviceName"] = item["update_service"];
                  let dataArray = [];
                  let dataMap = {};
                  for (let datakey in itemData) {
                    if (this.isSubmitableCol(datakey)) {
                      dataMap[datakey] = itemData[datakey];
                    }
                  }
                  dataArray.push(dataMap);
                  childRequest.data = dataArray;
                  let depend_keys = this.getDependKey(item["_foreign_key"]);
                  childRequest["depend_keys"] = depend_keys;

                  childRequest["condition"] = [
                    {
                      colName: "id",
                      ruleType: "in",
                      value: itemData.id,
                    },
                  ];
                } else if ("delete" == itemData._dirtyFlags) {
                  childRequest["serviceName"] = item["delete_service"];

                  childRequest["condition"] = [
                    {
                      colName: "id",
                      ruleType: "in",
                      value: itemData.id,
                    },
                  ];
                }

                if (JSON.stringify(childRequest) != "{}") {
                  mainData.child_data_list.push(childRequest);
                }
              }
            }
          }
        }
      }

      //提交数据
      if (procState == "submit") {
        if (this.button_info != null) {
          let result = this.prevalidate(bxRequests);
          if (typeof result == "boolean") {
            if (result) {
            }
          } else {
            this.$message({
              type: "error",
              message: result,
            });
            return;
          }
        }

        if (this.timeId != null) {
          clearInterval(this.timeId);
        }

        this.startProc(bxRequests).then((resp) => {
          let state = resp.body.state;
          if ("SUCCESS" == state) {
            this.$message({
              type: "success",
              message: "提交成功!",
            });
            let response = resp.body["data"];
            let proc_instance_no = response[0]["proc_instance_no"];
            if (this.navigateHandler) {
              this.navigateHandler("submit", proc_instance_no);
            } else {
              this.$router.push({
                name: "procdetail",
                params: { proc_instance_no: proc_instance_no },
              });
              window.location.reload();
            }
          } else {
            this.$message({
              type: "error",
              message: response.body.resultMessage,
            });
          }
        });
      } else {
        if (timerSave) {
          let str = "";
          let data = bxRequests[0].data[0];
          if (data.child_data_list && data.child_data_list.length == 0) {
            delete data["child_data_list"];
            str = JSON.stringify(data);
          }
          if (this.save_data_str == str) {
            return;
          } else {
            this.save_data_str = str;
          }
        }

        this.saveDraft(bxRequests).then((response) => {
          let state = response.body.state;

          if ("SUCCESS" == state) {
            this.$message({
              type: "success",
              message: "保存成功!",
            });

            response = response.body["data"];
            let proc_instance_no = response[0]["proc_instance_no"];
            this.proc_instance_no = proc_instance_no;
            this.$router.push({
              name: "procdetail",
              params: { proc_instance_no: proc_instance_no },
            });
            if (timerSave) {
            } else {
              setTimeout(() => {
                if (this.navigateHandler) {
                  this.navigateHandler("savedraft", proc_instance_no);
                } else {
                  window.location.reload();
                }
              }, 500);
            }
          } else {
            this.$message({
              type: "error",
              message: response.body.resultMessage,
            });
          }
        });
      }
    },
    getChildDataForm(item, fill_type) {
      let childRequests = [];
      let childRequest = {};
      if (item["_type_form"] == "update") {
        let olddata = item._old_data_form;
        let newData = item._data_form;
        if (JSON.stringify(olddata) != JSON.stringify(newData)) {
          let updateData = {};

          for (let key in newData) {
            if (newData[key] != olddata[key]) {
              updateData[key] = newData[key];
            }
          }

          childRequest["serviceName"] = item["update_service"];
          childRequest.data = [updateData];
          childRequest["condition"] = [
            {
              colName: "id",
              ruleType: "in",
              value: newData.id,
            },
          ];
          childRequests.push(childRequest);
        }
      } else if (item["_type_form"] == "add") {
        childRequest["serviceName"] = item["add_service"];

        let newData = item._data_form;
        let addData = {};

        for (let key in newData) {
          if (newData[key] != null) {
            addData[key] = newData[key];
          }
        }

        if (fill_type == "relation") {
          if (
            item["_foreign_key"] != undefined &&
            item["_foreign_key"].length > 0
          ) {
            let depend_keys = this.getDependKey(item["_foreign_key"]);
            if (depend_keys.length > 0) {
              childRequest["depend_keys"] = depend_keys;
            }
          }
        } else {
          if (
            item["_foreign_key"] != undefined &&
            item["_foreign_key"].length > 0
          ) {
            this.fillOperateData(addData, item["_foreign_key"]);
          }
        }

        childRequest.data = [addData];
        childRequests.push(childRequest);
      }

      return childRequests;
    },
    getDependKey(foreignKeyList) {
      let depend_keys = [];
      for (let foreign_item of foreignKeyList) {
        let depend = {};
        depend["type"] = "column";
        depend["depend_key"] = foreign_item["referenced_column_name"];
        depend["add_col"] = foreign_item["column_name"];
        depend_keys.push(depend);
      }
      return depend_keys;
    },
    fillOperateData(data, foreignKeyList) {
      for (let item of data) {
        for (let foreign_item of foreignKeyList) {
          item[foreign_item["column_name"]] =
            this.mainData[foreign_item["referenced_column_name"]];
        }
      }
    },

    async submitApprovalForm(formName) {
      let me = this;

      let proc_result = "";
      let result_key = "";
      for (let item_result of this.proHanleData.approval_options) {
        if (item_result["value"] == me.approval_form.proc_result) {
          proc_result = item_result["key_value"];
          result_key = item_result["key"];
        }
      }

      if (proc_result === "pass") {
        for (let i = 0; i < this.stepForm.length; i++) {
          for (let key in this.stepForm[i]) {
            let step_form_instance = this.stepForm[i][key];
            try {
              let step_validate_result =
                await step_form_instance.validateForm();
            } catch (e) {
              this.$message({
                type: "error",
                message: "请检查输入！",
              });

              return;
            }
          }
        }
      }

      this.$refs[formName][0].validate((valid) => {
        if (valid) {
          let bxRequests = [];
          let bxRequest = {
            proc_instance_no: me.proc_instance_no,
            step_no: me.proHanleData.step_no,
          };
          bxRequest.data = [];

          let data = {
            remark: me.approval_form.remark,
            proc_result: proc_result,
            key: result_key,
            file_no: this.uplaodFiled.model,
          };

          if (data.proc_result == "turn") {
            data["turn_user_no"] = me.approval_form.turn_user_no;
          }
          if (data.proc_result == "return") {
            data["step_no"] = me.approval_form.step_no;
          }

          //看是否存在相关业务数据
          if (proc_result === "pass" || !this.noBizDataWhenNoPass) {
            data["child_data_list"] = [];
            let biz_cfg_data = this.proHanleData.biz_cfg_data;
            for (let item of biz_cfg_data) {
              if (item["type"] == "grid" && item["biz_type"] == "child") {
                let simpleList = item._simpleListInstance;
                if (simpleList != undefined) {
                  let childDataList = simpleList.getListData();

                  for (let itemData of childDataList) {
                    let childRequest = {};

                    if ("add" == itemData._dirtyFlags) {
                      childRequest["serviceName"] = item["add_service"];
                      let dataArray = [];
                      let dataMap = {};
                      for (let datakey in itemData) {
                        if (this.isSubmitableCol(datakey)) {
                          dataMap[datakey] = itemData[datakey];
                        }
                      }
                      dataArray.push(dataMap);
                      childRequest.data = dataArray;
                      let depend_keys = this.getDependKey(item["_foreign_key"]);
                      childRequest["depend_keys"] = depend_keys;
                    } else if ("update" == itemData._dirtyFlags) {
                      childRequest["serviceName"] = item["update_service"];
                      let dataArray = [];
                      let dataMap = {};
                      for (let datakey in itemData) {
                        if (this.isSubmitableCol(datakey)) {
                          dataMap[datakey] = itemData[datakey];
                        }
                      }
                      dataArray.push(dataMap);
                      childRequest.data = dataArray;
                      let depend_keys = this.getDependKey(item["_foreign_key"]);
                      childRequest["depend_keys"] = depend_keys;

                      childRequest["condition"] = [
                        {
                          colName: "id",
                          ruleType: "in",
                          value: itemData.id,
                        },
                      ];
                    } else if ("delete" == itemData._dirtyFlags) {
                      childRequest["serviceName"] = item["delete_service"];

                      childRequest["condition"] = [
                        {
                          colName: "id",
                          ruleType: "in",
                          value: itemData.id,
                        },
                      ];
                    }

                    if (JSON.stringify(childRequest) != "{}") {
                      data["child_data_list"].push(childRequest);
                    }
                  }
                }
              } else if (
                item["type"] == "form" &&
                item["_type_form"] == "update" &&
                (item["biz_type"] == "child" || item["biz_type"] == "main")
              ) {
                let childDataFrom = this.getChildDataForm(item, "data");
                if (JSON.stringify(childDataFrom) != "[]") {
                  data["child_data_list"] =
                    data["child_data_list"].concat(childDataFrom);
                }
              } else if (
                item["type"] == "form" &&
                item["_type_form"] == "add" &&
                item["biz_type"] == "child"
              ) {
                let childDataFrom = this.getChildDataForm(item, "data");
                if (JSON.stringify(childDataFrom) != "[]") {
                  data["child_data_list"] =
                    data["child_data_list"].concat(childDataFrom);
                }
              }
            }
          }

          bxRequest["data"].push(data);
          bxRequests.push(bxRequest);

          if (this.button_info != null) {
            let result = this.prevalidate(bxRequests);
            if (typeof result == "boolean") {
              if (result) {
              }
            } else {
              this.$message({
                type: "error",
                message: result,
              });
              return;
            }
          }

          this.approval(bxRequests).then((response) => {
            let state = response.body.state;
            if ("SUCCESS" == state) {
              this.$message({
                type: "success",
                message: "审批成功!",
              });
              if (this.navigateHandler) {
                this.navigateHandler("approve", this.proc_instance_no);
              } else {
                window.location.reload();
              }
            } else {
              this.$message({
                type: "error",
                message: response.body.resultMessage,
              });
            }
          });
        }
      });
    },

    resetForm(formName) {
      this.$refs[formName][0].resetFields();
      this.uplaodFiled.model = "";
    },

    setHandleGridData(gridData, service_name) {
      for (let item_biz of this.proHanleData.biz_cfg_data) {
        if (item_biz["select_service"] == service_name) {
          if (init_page_index == 0) {
            item_biz.old_data_list = this.bxDeepClone(gridData);
          }
          init_page_index++;

          item_biz.data_list = gridData;

          if (item_biz.data_list.length == 0) {
            item_biz.view_data_list = "";
          } else {
            item_biz.view_data_list = JSON.stringify(gridData);
          }
          break;
        }
      }
    },

    isSubmitableCol(datakey) {
      return (
        (!datakey.startsWith("_") && datakey != "id") ||
        _.find(this.submitableLodashCols, (col) => col === datakey)
      );
    },
  },

  created: function () {
    if (this.$route && this.$route.query) {
      this.startProcDefaultValue = {};
      let operate_params = this.getOperateParams();
      if (operate_params != "" && operate_params != null) {
        let operate_Object = JSON.parse(operate_params);
        this.startProcDefaultValue = operate_Object;
      }

      let temp_str = this.getVueUrlParams("defDataPara");
      if (temp_str != null && temp_str != "") {
        this.defDataPara = JSON.parse(temp_str);
      }
    }

    // service, proc_instance_no 设定默认值优先级:  props > router.params
    if (this.$route.params) {
      this.proc_instance_no = this.$route.params.proc_instance_no;
      this.service_name = this.$route.params.service_name;
    }

    if (this.serviceProp) {
      this.service_name = this.serviceProp;
    }
    if (this.procInstanceNoProp) {
      this.proc_instance_no = this.procInstanceNoProp;
    }
  
    this.initload = true;

    this.initProcData();
  },
};
</script>


<style lang="less">
/**
  div.aaaaa:hover{cursor:pointer;border-bottom:1px solid #000;color:red}
  div.aaaaa:visited {border-bottom:1px solid #000;}**/

.div_click_class {
  /* text-decoration: underline; */

  border-bottom: 2px solid #66b1ff;
}

.el-row {
  > .el-steps {
    div.el-step:nth-last-of-type(2) {
      .el-step__head {
        .el-step__line {
          height: 0;
        }
      }
    }
  }
}
</style>
