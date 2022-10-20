<template>
  <div id="proc_detail">
    <div style="font-size: 20px; position: fixed; top: 0px; z-index: 9999">
      <el-button type="text" @click="hideFlowchart(this)" style="font-size: 20px;">
        <i v-bind:class="icon"></i>{{ processTempl.templ_name ? processTempl.templ_name + ` - ` + (mainData.proc_status ? mainData.proc_status : "") : "" }}
      </el-button>
      <!-- <el-button
      type="text"
      @click="updateShowHelp(this)"
      style="font-size: 20px;right:0"
    >
      流程图指引
      </el-button> -->
    </div>

    <!--流程图-->
    <el-card class="box-card" v-show="viewFlowChart">
      <div class="text item">
        <el-row>
          <flowStep :showNostartStep="showNostartStep" :activatStepNo="handle_active_step_no" v-if="proCharData.length > 0" :stepData="proCharData" :proc_status="mainData.proc_status" :processTempl="processTempl" @node-click="step_switch"></flowStep>
        </el-row>

      </div>
    </el-card>

    <!--业务表单、列表和审批表单-->
    <el-card class="box-card" v-show="handle_active_step_no != '_approval_record_'">
      <div slot="header" class="clearfix" >
     
       <label> {{ handle_active_step_name }}  </label>&nbsp; &nbsp; <label v-if="urgentStep.length>0&&proHanleData._handle_type == 'start_proc'"> <el-checkbox  :border="1==1" size="medium" v-model="urgent">紧急申请</el-checkbox> </label>
   
      </div>

      <template v-for="(step_item, index) in proCharData">
        <!--v-show 是控制显示隐藏的 当前激活节点-->
        <div class="text item" :key="index" v-show="handle_active_step_no == step_item.step_no">
          <!--显示审核过的数据 条件不等于当前处理步骤-->

          <div v-if="
              handle_active_step_no == step_item.step_no &&
              (step_item.step_no != proHanleData.step_no || proc_basic.is_finsh)
            ">
            <!--tabs模式展示-->

            <el-tabs :value="getInitTabNum(step_item.biz_cfg_data) - 1 + '_view'" v-if="getInitTabNum(step_item.biz_cfg_data) > 0" type="border-card" :key="step_item.step_no + index + '_tabs_view_model'">
              <template v-for="(biz_item, tab_index) in step_item.biz_cfg_data" v-if="biz_item.show_ui_model == 'tabs'">
                <el-tab-pane :key="step_item.step_no + tab_index + '_tab'" :label="biz_item['_section_name']" :name="tab_index + '_view'">
                  <el-row v-if="biz_item.type == 'grid'">
                    <proc-simple-list @proc-simple-list-loaded="
                        onProcSimpleListLoad(biz_item._uuid, $event)
                      " :name="'stepr' + step_item.step_no + 'i' + index" :foreign-key="biz_item._foreign_key[0]" :service="biz_item.select_service" list-type="procdetaillist" :default-condition="[
                        {
                          colName: 'parent_proc_instance_no',
                          ruleType: 'eq',
                          value: proc_instance_no,
                        },
                      ]">
                    </proc-simple-list>
                  </el-row>

                  <el-row v-if="biz_item.type == 'form'">
                    <detail :is_view_title="1 == 2" :childListReadonly="1 == 1" form-type="detail" :name="'stepr' + step_item.step_no + 'i' + index" ref="proc-simple-detail" :service="biz_item.select_service" :default-conditions="
                        getFormViewCondition(biz_item, step_item.step_no)
                      " @form-loaded="detail_form_loaded($event)"></detail>
                  </el-row>
                </el-tab-pane>
              </template>
            </el-tabs>

            <!--collapse模式展示-->
            <template v-for="(biz_item, index) in step_item.biz_cfg_data" v-if="biz_item.show_ui_model != 'tabs'">
              <!--业务只读列表-->
              <div label-width="130px" v-if="biz_item.type == 'grid'" :key="step_item.step_no + index + '_list'">
                <el-row>
                  <div class="el-col el-col-24 el-col-xl-24" :key="step_item.step_no + index + '_list'">
                    <span class="tag_font_class">{{ biz_item["_section_name"] }}
                    </span>
                  </div>

                  <el-col>
                    <proc-simple-list @proc-simple-list-loaded="
                        onProcSimpleListLoad(biz_item._uuid, $event)
                      " :name="'stepr' + step_item.step_no + 'i' + index" :foreign-key="biz_item._foreign_key[0]" :service="biz_item.select_service" list-type="procdetaillist" :default-condition="[
                        {
                          colName: 'parent_proc_instance_no',
                          ruleType: 'eq',
                          value: proc_instance_no,
                        },
                      ]">
                    </proc-simple-list>
                  </el-col>
                </el-row>
              </div>
              <!--流程列表-->
              <div label-width="130px" v-if="biz_item.type == 'procgrid'" :key="step_item.step_no + index + '_list'">
                <el-row v-if="biz_item.type == 'procgrid'">
                  <div class="el-col el-col-24 el-col-xl-24" :key="step_item.step_no + index + '_list'">
                    <span class="tag_font_class">{{ biz_item["_section_name"] }}
                    </span>
                  </div>

                  <el-col>
                    <proc-simple-list @proc-simple-list-loaded="
                        onProcSimpleListLoad(biz_item._uuid, $event)
                      " :name="'stepr' + step_item.step_no + 'i' + index" :foreign-key="biz_item._foreign_key[0]" :service="biz_item.select_service" list-type="procreadlist" :default-condition="[
                        {
                          colName: 'parent_proc_instance_no',
                          ruleType: 'eq',
                          value: proc_instance_no,
                        },
                      ]">
                    </proc-simple-list>
                  </el-col>
                </el-row>
              </div>

              <!--审批表单详情-->
              <div v-if="
                  biz_item.type == 'form' &&
                  biz_item.select_service == 'srvprocess_record_select'
                " :key="step_item.step_no + index + '_record_result'" v-show="opinion==null?true:(opinion.show!==false)">

                <el-form label-width="130px" label-suffix=":">
                  <el-row>
                    <div class="el-col el-col-24 el-col-xl-24" :key="step_item.step_no + index + '_list_section'">
                      <div class="el-form-item">
                        <span class="section-title">审批说明</span>
                      </div>
                    </div>

                    <el-col :span="6">
                      <el-form-item label="意见" prop="proc_result">
                        <!-- <el-input
                          :readonly="1 == 1"
                          :value="
                            step_item.proc_result[
                              step_item._record_data.proc_result
                            ]
                          "
                        ></el-input> -->

                        <!-- opinion -->
                        <el-input :readonly="1 == 1" :value="opinion==null?step_item.proc_result[step_item._record_data.proc_result]:opinion.disp"></el-input>
                      </el-form-item>

                    </el-col>
                    <el-col :span="24" v-show="opinion==null?true:(opinion.remark!==false)">
                      <el-form-item label="说明" prop="remark">
                        <el-input type="textarea" :value="step_item._record_data.remark" :readonly="1 == 1" :autosize="{ minRows: 6, maxRows: 8 }"></el-input>
                      </el-form-item>
                    </el-col>
                    <el-col :span="24" v-if="opinion==null?true:(opinion.biz_form!==false)">
                      <el-form-item label="附件" prop="remark">
                        <a v-for="(file, index) in step_item._record_data
                            ._fileList" :key="index + '_file'" :href="serviceApi().downloadFile + file.fileurl">
                          {{ file.src_name }}</a>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form>
              </div>

              <!--业务详情-->
              <div v-else-if="
                  (step_item.step_no != proHanleData.step_no ||
                    proc_basic.is_finsh) &&
                  biz_item.type == 'form'
                " v-show="
                  bizDataStepReadVisible[step_item.step_no] !== false &&
                  '否' != biz_item.is_show
                " :key="step_item.step_no + index + '_detail'">
                <div class="el-col el-col-24 el-col-xl-24" :key="step_item.step_no + index + '_form'">
                  <span class="tag_font_class">{{ biz_item["_section_name"] }}
                  </span>
                </div>

                <detail :approvalFormMode="approvalFormRun" form-type="procdetail" :name="'stepr' + step_item.step_no + 'i' + index" ref="proc-simple-detail" :service="biz_item.select_service" :default-conditions="
                    getFormViewCondition(biz_item, step_item.step_no)
                  " :is_view_title="1 == 2"></detail>
              </div>
            </template>
          </div>

          <!--start_proc提交流程表单-->
          <el-form label-width="100px" label-suffix=":" v-if="
              step_item.step_no == proHanleData.step_no &&
              proHanleData._handle_type == 'start_proc' &&
              initload
            ">
            <el-row>
              <!--collaps模式-->
              <template v-for="(biz_item, collapse_index) in proHanleData.biz_cfg_data" v-if="biz_item.show_ui_model == 'collapse'">
                <el-col v-if="biz_item.type == 'grid'" :key="step_item.step_no + collapse_index + '_list'">
                  <div :key="step_item.step_no + collapse_index + '_list_section'">
                    <div class="el-form-item">
                      <span class="section-title">{{ biz_item["_section_name"] }}
                      </span>
                    </div>
                  </div>

                  <el-col>
                    <proc-simple-list :name="'apply_list' + collapse_index" @proc-simple-list-loaded="
                        onProcSimpleListLoad(biz_item._uuid, $event)
                      " :foreign-key="biz_item._foreign_key[0]" :service="biz_item.select_service" :list-type="
                        biz_item['_type_grid'] == 'readGrid'
                          ? 'procdetaillist'
                          : 'prochandlelist'
                      " :default-condition="[
                        {
                          colName: 'parent_proc_instance_no',
                          ruleType: 'eq',
                          value: proc_instance_no,
                        },
                      ]">
                    </proc-simple-list>
                  </el-col>
                </el-col>

                <el-col v-if="biz_item.type == 'procgrid'" :key="step_item.step_no + collapse_index + '_list'">
                  <div :key="step_item.step_no + collapse_index + '_list_section'">
                    <div class="el-form-item">
                      <span class="section-title">{{ biz_item["_section_name"] }}
                      </span>
                    </div>
                  </div>

                  <el-col>
                    <proc-simple-list :name="'apply_list' + collapse_index" :foreign-key="biz_item._foreign_key[0]" :service="biz_item.select_service" list-type="procreadlist" :default-condition="[
                        {
                          colName: 'parent_proc_instance_no',
                          ruleType: 'eq',
                          value: proc_instance_no,
                        },
                      ]">
                    </proc-simple-list>
                  </el-col>
                </el-col>

                <el-col v-if="biz_item.type == 'form'" :key="step_item.step_no + collapse_index + '_list'">
                  <update @child-loaded="childDataLoadedRun($event)" :approvalFormMode="approvalFormRun" v-show="'否' != biz_item.is_show" v-if="biz_item._type_form == 'update'" :name="'collapse_apply_update' + collapse_index" :ref="'collapse-proc-update-form-submit_' + collapse_index" :service="biz_item.update_service" :pk-col="
                      biz_item.biz_type == 'main'
                        ? 'proc_instance_no'
                        : 'parent_proc_instance_no'
                    " :pk="proc_instance_no" @form-loaded="onProcFormLoad(biz_item._uuid, $event)"></update>
                  <detail :approvalFormMode="approvalFormRun" v-show="'否' != biz_item.is_show" v-else-if="biz_item._type_form == 'select'" :name="'collapse_apply_detail' + collapse_index" form-type="procdetail" name="collapse-proc-simple-detail" :service="biz_item.select_service" :default-conditions="
                      getFormViewCondition(biz_item, step_item.step_no)
                    "></detail>
                  <add :approvalFormMode="approvalFormRun" v-show="'否' != biz_item.is_show" v-else :name="'collapse_apply_add' + collapse_index" :def-data-para="defDataPara" :default-values="startProcDefaultValue" :ref="'collapse-proc-add-form-submit_' + collapse_index" :service="biz_item.add_service" @form-loaded="onProcFormLoad(biz_item._uuid, $event)"></add>
                </el-col>
              </template>
            </el-row>

            <!--tabs模式编辑-->
            <el-tabs :value="getInitTabNum(proHanleData.biz_cfg_data) - 1 + '_edit'" v-if="getInitTabNum(proHanleData.biz_cfg_data) > 0" type="border-card" :key="step_item.step_no + index + '_tabs_model'">
              <template v-for="(biz_item, tab_index) in proHanleData.biz_cfg_data" v-if="biz_item.show_ui_model == 'tabs'">
                <el-tab-pane :key="step_item.step_no + tab_index + '_tab'" :label="biz_item['_section_name']" :name="tab_index + '_edit'">
                  <el-col v-if="biz_item.type == 'grid'" :key="step_item.step_no + index + '_list'">
                    <div :key="step_item.step_no + index + '_list_section'">
                      <div class="el-form-item">
                        <span class="section-title">{{ biz_item["_section_name"] }}
                        </span>
                      </div>
                    </div>

                    <el-col>
                      <proc-simple-list :name="'apply_list' + tab_index" @proc-simple-list-loaded="
                          onProcSimpleListLoad(biz_item._uuid, $event)
                        " :foreign-key="biz_item._foreign_key[0]" :mainData="mainData" :service="biz_item.select_service" :list-type="
                          biz_item['_type_grid'] == 'readGrid'
                            ? 'procdetaillist'
                            : 'prochandlelist'
                        " :default-condition="[
                          {
                            colName: 'parent_proc_instance_no',
                            ruleType: 'eq',
                            value: proc_instance_no,
                          },
                        ]">
                      </proc-simple-list>
                    </el-col>
                  </el-col>

                  <el-col v-if="biz_item.type == 'form'" :key="step_item.step_no + tab_index + '_form'">
                    <update @child-loaded="childDataLoadedRun($event)" :approvalFormMode="approvalFormRun" v-if="biz_item._type_form == 'update'" :name="'tabs_apply_update' + tab_index" :ref="'tabs-proc-update-form-submit_' + tab_index" :service="biz_item.update_service" :pk-col="
                        biz_item.biz_type == 'main'
                          ? 'proc_instance_no'
                          : 'parent_proc_instance_no'
                      " :pk="proc_instance_no" @form-loaded="onProcFormLoad(biz_item._uuid, $event)"></update>
                    <add :approvalFormMode="approvalFormRun" v-else :name="'tabs_apply_add' + tab_index" :def-data-para="defDataPara" :default-values="startProcDefaultValue" :ref="'tabs-proc-add-form-submit_' + tab_index" :service="biz_item.add_service" @form-loaded="onProcFormLoad(biz_item._uuid, $event)"></add>
                  </el-col>
                </el-tab-pane>
              </template>
            </el-tabs>

            <el-row type="flex" class="row-bg" justify="center">
              <el-button :disabled="submitStatus === 'occupy'" type="primary" @click="
                  submitProc(
                    proc_instance_no == '' || proc_instance_no == undefined
                      ? 'add'
                      : 'update',
                    'submit'
                  )
                ">
                提交
              </el-button>

              <el-button type="primary" @click="
                  submitProc(
                    proc_instance_no == '' || proc_instance_no == undefined
                      ? 'add'
                      : 'update',
                    'save'
                  )
                ">
                保存草稿
              </el-button>
            </el-row>
          </el-form>

          <!--(operate)审核流程Form以及业务表单-->
          <el-form label-width="10rem" label-suffix=":" :model="approval_form" ref="approval_form" v-if="
              step_item.step_no == proHanleData.step_no &&
              proHanleData._handle_type == 'approval_proc'
            ">
            <el-row v-if="proHanleData.authority">
              <!-- collapse模式编辑-->
              <template v-for="(biz_item, index) in proHanleData.biz_cfg_data">
                <div v-if="biz_item.show_ui_model == 'collapse'" :key="step_item.step_no + index + '_collapse_model'">
                  <div :key="step_item.step_no + index + '_list_section'">
                    <div class="el-form-item">
                      <span class="section-title">{{ biz_item["_section_name"] }}
                      </span>
                    </div>
                  </div>

                  <!--子表数据-->
                  <div v-if="biz_item.type == 'grid'" :key="step_item.step_no + index + '_list'">
                    <proc-simple-list :name="'apv' + step_item.step_no + 'i' + index" @proc-simple-list-loaded="
                        onProcSimpleListLoad(biz_item._uuid, $event)
                      " :foreign-key="biz_item._foreign_key[0]" :list-type="
                        biz_item['_type_grid'] == 'readGrid'
                          ? 'procdetaillist'
                          : 'prochandlelist'
                      " :storage-type="step_item.list_storage_type || 'mem'" :service="biz_item.select_service" :default-condition="[
                        {
                          colName: 'parent_proc_instance_no',
                          ruleType: 'eq',
                          value: proc_instance_no,
                        },
                      ]">
                    </proc-simple-list>
                  </div>

                  <!--流程列表-->
                  <div label-width="130px" v-if="biz_item.type == 'procgrid'" :key="step_item.step_no + index + '_list'">
                    <proc-simple-list :name="'stepr' + step_item.step_no + 'i' + index" @proc-simple-list-loaded="
                        onProcSimpleListLoad(biz_item._uuid, $event)
                      " :foreign-key="biz_item._foreign_key[0]" :service="biz_item.select_service" list-type="procreadlist" :default-condition="[
                        {
                          colName: 'parent_proc_instance_no',
                          ruleType: 'eq',
                          value: proc_instance_no,
                        },
                      ]">
                    </proc-simple-list>
                  </div>

                  <!--from表单-->
                  <div v-if="biz_item.type == 'form'" :key="step_item.step_no + index + '_list'">
                    <update @child-loaded="childDataLoadedRun($event)" :approvalFormMode="approvalFormRun" v-if="biz_item._type_form == 'update'" :selectSrvName="biz_item.select_service" :name="'apv' + step_item.step_no + 'i' + index" ref="proc-update-form-approval" :service="biz_item.update_service" :pk-col="
                        biz_item.biz_type == 'main'
                          ? 'proc_instance_no'
                          : 'parent_proc_instance_no'
                      " :pk="proc_instance_no" @form-loaded="onProcFormLoad(biz_item._uuid, $event)"></update>
                    <add :approvalFormMode="approvalFormRun" v-if="biz_item._type_form == 'add'" :name="'apv' + step_item.step_no + 'i' + index" ref="proc-add-form-approval" :service="biz_item.add_service" @form-loaded="onProcFormLoad(biz_item._uuid, $event)"></add>
                    <detail :approvalFormMode="approvalFormRun" :is_view_title="1 == 2" v-if="biz_item._type_form == 'select'" :name="'apv' + step_item.step_no + 'i' + index" form-type="procdetail" name="proc-simple-detail" :service="biz_item.select_service" :default-conditions="
                        getFormViewCondition(biz_item, step_item.step_no)
                      "></detail>
                  </div>
                </div>
              </template>
              <!--tabs模式编辑-->

              <el-tabs :value="getInitTabNum(proHanleData.biz_cfg_data) - 1 + '_edit'" v-if="getInitTabNum(proHanleData.biz_cfg_data) > 0" type="border-card" :key="step_item.step_no + index + '_tabs_model'">
                <template v-for="(biz_item, tab_index) in proHanleData.biz_cfg_data" v-if="biz_item.show_ui_model == 'tabs'">
                  <el-tab-pane :key="step_item.step_no + tab_index + '_tab'" :label="biz_item['_section_name']" :name="tab_index + '_edit'">
                    <!--子表数据-->
                    <div v-if="biz_item.type == 'grid'" :key="step_item.step_no + index + '_list'">
                      <proc-simple-list :name="'apv' + step_item.step_no + 'i' + index" @proc-simple-list-loaded="
                          onProcSimpleListLoad(biz_item._uuid, $event)
                        " :foreign-key="biz_item._foreign_key[0]" :list-type="
                          biz_item['_type_grid'] == 'readGrid'
                            ? 'procdetaillist'
                            : 'prochandlelist'
                        " :storage-type="step_item.list_storage_type || 'mem'" :service="biz_item.select_service" :default-condition="[
                          {
                            colName: 'parent_proc_instance_no',
                            ruleType: 'eq',
                            value: proc_instance_no,
                          },
                        ]">
                      </proc-simple-list>
                    </div>

                    <!--from表单-->
                    <div v-if="biz_item.type == 'form'" :key="step_item.step_no + index + '_list'">
                      <update @child-loaded="childDataLoadedRun($event)" :approvalFormMode="approvalFormRun" v-if="biz_item._type_form == 'update'" :selectSrvName="biz_item.select_service" :name="'apv' + step_item.step_no + 'i' + index" ref="proc-update-form-approval" :service="biz_item.update_service" :pk-col="
                          biz_item.biz_type == 'main'
                            ? 'proc_instance_no'
                            : 'parent_proc_instance_no'
                        " :pk="proc_instance_no" @form-loaded="onProcFormLoad(biz_item._uuid, $event)"></update>
                      <add :approvalFormMode="approvalFormRun" v-if="biz_item._type_form == 'add'" :name="'apv' + step_item.step_no + 'i' + index" ref="proc-add-form-approval" :service="biz_item.add_service" @form-loaded="onProcFormLoad(biz_item._uuid, $event)"></add>
                      <detail :approvalFormMode="approvalFormRun" :is_view_title="1 == 2" v-if="biz_item._type_form == 'select'" :name="'apv' + step_item.step_no + 'i' + index" form-type="procdetail" name="proc-simple-detail" :service="biz_item.select_service" :default-conditions="
                          getFormViewCondition(biz_item, step_item.step_no)
                        "></detail>
                    </div>
                  </el-tab-pane>
                </template>
              </el-tabs>
            </el-row>

            <!--审批表单-->
            <el-row v-if="
                proHanleData.authority &&
                proHanleData.approval_options.length > 0
              ">
              <div class="el-col el-col-24 el-col-xl-24" :key="step_item.step_no + index + '_list_section'" v-show="showRemark||showApproval">
                <div class="el-form-item">
                  <span class="section-title">审批操作</span>
                </div>
              </div>

              <el-col :span="24">
                <el-form-item label="意见" prop="proc_result" :rules="{
                    required: true,
                    message: '说明不能为空',
                    trigger: 'change',
                  }" v-show="showApproval">
                  <el-radio border v-for="item in proHanleData.approval_options" :key="item.value" v-model="approval_form.proc_result" :label="item.value">{{ item.disp }}
                  </el-radio>
                </el-form-item>
              </el-col>

              <el-col :span="6" v-if="approval_form.proc_result == 'turn'">
                <el-form-item label="转派用户" prop="turn_user_no" :rules="{
                    required: true,
                    message: '用户不能为空',
                    trigger: 'change',
                  }">
                  <el-select @focus="findTurnUser('')" v-model="approval_form.turn_user_no" filterable remote placeholder="请选择转派用户" :remote-method="findTurnUser">
                    <el-option v-for="item in approval_form.userOptions" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="24" v-if="approval_form.proc_result == 'return'">
                <el-form-item label="返回步骤" prop="step_no" :rules="{
                    required: true,
                    message: '步骤不能为空',
                    trigger: 'change',
                  }">
                  <el-radio border v-for="item in proHanleData.return_options" :key="item.value" v-model="approval_form.step_no" :label="item.value">{{ item.disp }}
                  </el-radio>
                </el-form-item>
              </el-col>

              <el-col :span="24" v-if="
                  getRemarkFileShow('remark') &&
                  Object.keys(procHanleStepConfigJson).length > 0 &&
                  procHanleStepConfigJson[approval_form.proc_result].remark
                ">
                <el-form-item label="说明" prop="remark" :rules="getRemarkRules()">
                  <el-input type="textarea" v-model="approval_form.remark" :autosize="{ minRows: 4, maxRows: 6 }"></el-input>
                </el-form-item>
              </el-col>

              <el-col :span="24" v-if="
                  approval_form.proc_result !== '' &&
                  Object.keys(procHanleStepConfigJson).length > 0 &&
                  procHanleStepConfigJson[approval_form.proc_result].attachment
                ">
                <el-form-item label="附件" prop="file_no" v-if="getRemarkFileShow('files')">
                  <upload-file :field="uplaodFiled"></upload-file>
                </el-form-item>
              </el-col>

              <el-col :span="24">
                <el-row type="flex" class="row-bg" justify="center">
                  <el-form-item>
                    <el-button type="primary" @click="submitApprovalForm('approval_form', false)">提交
                    </el-button>
                    <!--
                    <el-button type="primary" @click="submitApprovalForm('approval_form',true)">保存草稿
                    </el-button>-->

                    <el-button @click="resetForm('approval_form')">重置
                    </el-button>
                  </el-form-item>
                </el-row>
              </el-col>
            </el-row>

            <el-row type="flex" class="row-bg" justify="center" v-else-if="!proHanleData.authority && !proc_basic.is_finsh">
              {{ getNoAuthorityMessage() }}
            </el-row>
          </el-form>
        </div>
      </template>
    </el-card>

    <!--流程审批记录-->
    <el-card class="box-card" v-if="record_default_condition.length > 0" v-show="appvalResult > 0">
      <div slot="header" class="clearfix">
        <span class="tag_font_class">流程审批结果</span>
      </div>

      <div class="text item">
        <proc-simple-list v-if="recordShow" service="srvprocess_record_select" v-show="appvalResult > 0" @list-loaded="onRecordListLoaded" list-type="procdetaillist" :default-order="[{ colName: 'id', orderType: 'desc' }]" :default-condition="record_default_condition">
        </proc-simple-list>
      </div>

      <div class="text item">
        <proc-simple-list v-if="resultShow" v-show="appvalResult > 0" @list-loaded="onRecordListLoaded" service="srvprocess_result_select" list-type="procdetaillist" :default-order="[{ colName: 'id', orderType: 'desc' }]" :default-condition="record_default_condition">
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
import flowStep from "./flowStep.vue";
import simpleDetail from "./simple-detail.vue";
import detail from "./detail.vue";
import SimpleAdd from "./simple-add";
import add from "./add";
import update from "./update";
import SimpleUpdate from "./simple-update";
import UploadFile from "../ui/upload-file";
import ProcV2Mixin from "../mixin/proc-v2-mixin";

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
    flowStep
  },
  props: {
    name: {
      type: String,
      default: "main"
    }
  },
  mixins: [ProcV2Mixin],
  watch: {
    proHanleData: function(data) {
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
      handler: function(data) {
        if (
          data.proc_result == "return" &&
          this.proHanleData.return_options.length == 1
        ) {
          data.step_no = this.proHanleData.return_options[0]["value"];
        }
      },
      deep: true
    }
  },
  data() {
    return {
      submitStatus: "unwanted", //unwanted 空闲 // occupy 占用
      urgent: false,
      viewFlowChart: true,
      noAuthorityErrorMessage: null,
      apvTurnUserOtionsFunc: null,
      bizDataStepReadVisible: {},
      hideOnlyApvOption: true,
      timeId: null,
      interval: null,
      save_data_str: "",
      loadbizNum: [],
      time_save_cycle: 0,
      proc_instance_no: this.$route.params.proc_instance_no,
      mainData: {},
      startProcDefaultValue: {},
      initload: false,
      service_name: this.$route.params.service_name,
      record_activeNames: ["1"],
      record_default_condition: [],
      existsGridButton: false,
      handle_active_step_name: "",
      handle_active_step_no: "",
      proCharData: [],
      proHanleData: {},
      proHanleDataList: [],
      processTempl: {},
      urgentStep:[],
      proc_basic: {},
      startFrom: null,
      icon: "el-icon-s-fold",
      recordShow: false,
      resultShow: true,
      defDataPara: null,
      uplaodFiled: {
        info: {
          editable: true
        },
        fileDesc: "请上传文件,大小不超过50MB",
        fileSize: 6200,
        fileType: "",
        model: ""
      },
      approval_form: {
        proc_result: "",
        remark: "",
        file_no: "",
        turn_user_no: "",
        turn_step_no: "",
        step_no: "",
        userOptions: []
      },
      button_info: null,
      page_type: "approval",
      viewTab: {},
      editTab: {},
      appvalResult: 1,
      childDataLoaded: {},
      procHanleStepConfigJson: {},
      validateFunOpertion: { valid: true, msg: "" },
      validateFun: new Function("return " + this.validateFunOpertion),
      opinion: null
    };
  },
  computed: {
    showApproval: function() {
      return (
        this.proHanleData.approval_options.length > 1 ||
        (this.proHanleData.approval_options.length === 1 &&
          this.proHanleData.approval_options[0].show !== false)
      );
    },
    showRemark: function() {
      return (
        this.getRemarkFileShow("remark") &&
        Object.keys(this.procHanleStepConfigJson).length > 0 &&
        this.procHanleStepConfigJson[this.approval_form.proc_result].remark
      );
    },
    approvalFormRun: function() {
      let approval = this.bxDeepClone(this.approval_form);
      let mainMode = this.mainData;
      let handleStep = {
        step_name: this.handle_active_step_name,
        step_no: this.handle_active_step_no
      };
      approval["_mainModel"] = this.bxDeepClone(mainMode);
      approval["_handleStep"] = this.bxDeepClone(handleStep);
      return approval;
    },
    showNostartStep: function() {
      let res = this.processTempl.hasOwnProperty("show_nostart_step")
        ? this.processTempl.show_nostart_step
        : true;
      if (this.mainData.proc_status === "完成") {
        return res;
      } else {
        return true;
      }
    }
  },
  methods: {
    updateShowHelp(e) {
      // console.log('updateShowHelp',e)
    },
    childDataLoadedRun(e) {
      if (e) {
        this.childDataLoaded[e.name] = e.data;
      }
    },
    detail_form_loaded(instacne) {
      if (instacne.actions && instacne.actions.nav2update) {
        instacne.actions.nav2update.visible = false;
      }
    },
    onRecordListLoaded: function(listIns) {
      this.appvalResult = listIns.gridData.length;
    },
    onProcSimpleListLoad(uuid, simpleList) {
      for (var item_biz of this.proHanleData.biz_cfg_data) {
        if (item_biz["_uuid"] == uuid) {
          item_biz._simpleListInstance = simpleList;
          this.removeByValue(this.loadbizNum, uuid);
          if (this.loadbizNum.length == 0) {
            this.timedSave();
          }
          break;
        }
      }
    },
    getStepConfigJson() {
      let data = {};
      if (this.proHanleData.approval_options) {
        for (var item_biz of this.proHanleData.approval_options) {
          let item = item_biz;
          item["attachment"] = item.hasOwnProperty("attachment")
            ? item.attachment
            : false; // 附件默认 不显示
          item["remark"] = item.hasOwnProperty("remark") ? item.remark : true; // 附件默认 显示
          item["biz_form"] = item.hasOwnProperty("biz_form")
            ? item.attachment
            : true; // 附件默认 显示
          data[item.key] = item;
        }
        this.procHanleStepConfigJson = data;
      }
    },
    onProcFormLoad(uuid, simpleForm) {
      // 将子表组件挂到模型上
      for (var item_biz of this.proHanleData.biz_cfg_data) {
        if (item_biz["_uuid"] == uuid) {
          item_biz._simpleFormInstance = simpleForm;
          if (simpleForm.actions.submit != undefined) {
            simpleForm.actions.submit.visible = false;
          }
          if (simpleForm.actions.reset != undefined) {
            simpleForm.actions.reset.visible = false;
          }

          if (item_biz.proc_main_form == true) {
            this.removeByValue(this.loadbizNum, uuid);
            if (this.loadbizNum.length == 0) {
              this.timedSave();
            }
            //主表
          } else {
            // this.onStepFormLoaded(
            //   item_biz._type_form,
            //   item_biz["_uuid"],
            //   simpleForm
            // );
          }
        }
      }
    },

    async submitApprovalForm(formName, is_draft, timerSave) {
      var me = this;
      let proc_result = "";
      let result_key = "";
      for (var item_result of me.proHanleData.approval_options) {
        if (item_result["value"] == me.approval_form.proc_result) {
          proc_result = item_result["key_value"];
          result_key = item_result["key"];
          break;
        }
      }

      if (is_draft) {
        var bxRequests = me.buildApprovalData(proc_result, result_key, "save");
        //任务自动保存
        if (timerSave) {
          if (this.time_save_cycle == 0) {
            this.save_data_str = JSON.stringify(bxRequests);
            this.time_save_cycle = this.time_save_cycle + 1;
            return;
          } else {
            this.time_save_cycle = this.time_save_cycle + 1;
            var str = JSON.stringify(bxRequests);
            if (this.save_data_str == str) {
              return;
            } else {
              this.save_data_str = str;
            }
          }
        }
        //提交审批草稿
        this.approval(bxRequests).then(response => {
          var state = response.body.state;
          if ("SUCCESS" == state) {
            this.$message({
              type: "success",
              message: "保存成功!"
            });
            window.location.reload();
          } else {
            this.$message({
              type: "error",
              message: response.body.resultMessage
            });
          }
        });

        //保存草稿
      } else {
        var validate_result = true;
        //如果当前处理位通过校验业务表单输入
        if (proc_result == "pass") {
          for (var biz_item of this.proHanleData.biz_cfg_data) {
            if (biz_item.type == "grid") {
              var instacneListCom = biz_item._simpleListInstance;
            } else {
              if ("srvprocess_record_select" == biz_item.select_service) {
                //流程审批记录form
              } else if (biz_item._simpleFormInstance) {
                var instacneFormCom = biz_item._simpleFormInstance;
                await instacneFormCom
                  .validateForm()
                  .then(function() {
                    validate_result = true;
                  })
                  .catch(function() {
                    validate_result = false;
                  });
              }

              if (!validate_result) {
                break;
              }
            }
          }
        }
        /**
         * 处理表单验证函数
         */
        if (
          this.proHanleData.validate_fun !== null &&
          this.proHanleData.validate_fun !== ""
        ) {
          let funStr = this.proHanleData.validate_fun;
          let testFun = new Function("return " + funStr);
          this.validateFun = testFun();
        } else {
          // let funStrb = ""
          // let testFun = new Function('return '+ funStrb)
          this.validateFun = function() {
            return { valid: true, msg: "" };
          };
        }
        //
        var bxRequests = me.buildApprovalData(
          proc_result,
          result_key,
          "submit"
        );
        let datas = bxRequests;
        let childDatas = this.childDataLoaded;
        if (Object.keys(childDatas).length > 0) {
          for (let key in childDatas) {
            let item = childDatas[key];
            if (item.length > 0) {
              item = item.filter(row => {
                // 过滤掉内存表删除的数据
                if (
                  !row.hasOwnProperty("_dirtyFlags") &&
                  !(row._dirtyFlags === "delete")
                ) {
                  return row;
                }
              });
            }
          }
        }

        let vFun = this.validateFun(datas, childDatas);
        if (!vFun.valid) {
          this.$message({
            type: "error",
            message: vFun.msg
          });
          return;
        }

        if (validate_result) {
          this.$refs[formName][0].validate(valid => {
            if (valid) {
              var bxRequests = me.buildApprovalData(
                proc_result,
                result_key,
                "submit"
              );
              me.submitStatus = "occupy"; //unwanted 空闲 // occupy 占用
              //提交流程
              this.approval(bxRequests).then(response => {
                var state = response.body.state;
                if ("SUCCESS" == state) {
                  this.$message({
                    type: "success",
                    message: "审批成功!"
                  });
                  window.location.reload();
                } else {
                  this.$message({
                    type: "error",
                    message: response.body.resultMessage
                  });
                }
              });
            }
          });
        }
      }
    },
    buildApprovalData(proc_result, result_key, submitType) {
      var me = this;
      //console.log("buildApprovalData", 1);
      var bxRequests = [];
      var bxRequest = {
        proc_instance_no: me.proc_instance_no,
        step_no: me.proHanleData.step_no,
        proc_data_type: submitType
      };
      bxRequest["data"] = [];
      var data = {
        remark: me.approval_form.remark,
        proc_result: proc_result,
        key: result_key,
        file_no: this.uplaodFiled.model
      };

      if (data.proc_result == "turn") {
        data["turn_user_no"] = me.approval_form.turn_user_no;
      }
      if (data.proc_result == "return") {
        data["step_no"] = me.approval_form.step_no;
      }

      data["child_data_list"] = [];
      //查询看是否存在相关子表数据
      var biz_cfg_data = this.proHanleData.biz_cfg_data;

      for (let item of biz_cfg_data) {
        if (item["type"] == "grid" && item["biz_type"] == "child") {
          var simpleList = item._simpleListInstance;
          if (simpleList != undefined) {
            var childDataList = simpleList.getListData();

            for (var itemData of childDataList) {
              var childRequest = {};

              if ("add" == itemData._dirtyFlags) {
                childRequest["serviceName"] = item["add_service"];
                var dataArray = [];
                var dataMap = {};
                for (var datakey in itemData) {
                  if (!datakey.startsWith("_") && datakey != "id") {
                    dataMap[datakey] = itemData[datakey];
                  }
                }
                dataArray.push(dataMap);
                childRequest.data = dataArray;
                let depend_keys = this.getDependKey(item["_foreign_key"]);
                childRequest["depend_keys"] = depend_keys;
              } else if ("update" == itemData._dirtyFlags) {
                childRequest["serviceName"] = item["update_service"];
                var dataArray = [];
                var dataMap = {};
                for (var datakey in itemData) {
                  if (!datakey.startsWith("_") && datakey != "id") {
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
                    value: itemData.id
                  }
                ];
              } else if ("delete" == itemData._dirtyFlags) {
                childRequest["serviceName"] = item["delete_service"];

                childRequest["condition"] = [
                  {
                    colName: "id",
                    ruleType: "in",
                    value: itemData.id
                  }
                ];
              }

              // if (JSON.stringify(childRequest) != "{}") {
              if (Object.keys(childRequest).length > 0) {
                data["child_data_list"].push(childRequest);
              }
            }
          }
        } else if (
          item["type"] == "form" &&
          item["_type_form"] == "update" &&
          (item["biz_type"] == "child" || item["biz_type"] == "main")
        ) {
          if (item["biz_type"] == "main") {
            var childdata = item._simpleFormInstance.buildRunQuries();
            // var childDataFrom = this.getChildDataForm(item, "data");
            if (JSON.stringify(childdata) != "[]") {
              data["child_data_list"] = data["child_data_list"].concat(
                childdata
              );
            }
          } else if (item["biz_type"] == "child") {
            var childdata = item._simpleFormInstance.buildRunQuries();
            // var childDataFrom = this.getChildDataForm(item, "data");
            if (JSON.stringify(childdata) != "[]") {
              data["child_data_list"] = data["child_data_list"].concat(
                childdata
              );
            }
          }
        } else if (
          item["type"] == "form" &&
          item["_type_form"] == "add" &&
          item["biz_type"] == "child"
        ) {
          var childdata = item._simpleFormInstance.buildRunQuries();
          //var childDataFrom = this.getChildDataForm(item, "data");
          if (JSON.stringify(childdata) != "[]") {
            data["child_data_list"] = data["child_data_list"].concat(childdata);
          }
        }
      }

      bxRequest["data"].push(data);
      bxRequests.push(bxRequest);

      if (this.button_info != null) {
        var result = this.prevalidate(bxRequests);
        if (typeof result == "boolean") {
          if (result) {
          }
        } else {
          this.$message({
            type: "error",
            message: result
          });
          return;
        }
      }
      return bxRequests;
    },
    async submitProc(operate_type, procState) {
      var me = this;

      if (procState == "submit") {
        me.submitStatus = "occupy"; //unwanted 空闲 // occupy 占用
        var validate_result = false;

        var tab_index = 0;
        for (var biz_item of this.proHanleData.biz_cfg_data) {
          if (biz_item.type == "grid" || biz_item.type == "procgrid") {
            var instacneListCom = biz_item._simpleListInstance;
          } else {
            if (biz_item.type == "form" && biz_item._type_form == "select") {
              var instacneFormCom = biz_item._simpleFormInstance;
            } else {
              var instacneFormCom = biz_item._simpleFormInstance;
              await instacneFormCom
                .validateForm()
                .then(function() {
                  validate_result = true;
                })
                .catch(function() {
                  let msg = "请检查输入项";
                  let tab_name = biz_item["_section_name"];
                  if (tab_name) {
                    msg = "请检查" + tab_name + "信息";
                  }
                  me.$message({
                    type: "error",
                    message: msg
                  });
                  validate_result = false;

                  me.submitStatus = "unwanted"; //unwanted 空闲 // occupy 占用
                });
            }

            if (!validate_result) {
              break;
            }
          }
          tab_index = tab_index + 1;
        }
        if (validate_result) {
          this.$confirm("是否确认提交", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "info"
          })
            .then(() => {
              this.start(operate_type, procState);
            })
            .catch(() => {
              this.$message({
                type: "info",
                message: "已取消操作"
              });
              me.submitStatus = "unwanted"; //unwanted 空闲 // occupy 占用
            });
        }
      } else {
        this.$confirm("是否确认提交", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "info"
        })
          .then(() => {
            this.start(operate_type, procState);
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消操作"
            });
            me.submitStatus = "unwanted"; //unwanted 空闲 // occupy 占用
          });
      }
      setTimeout(function() {
        console.log("定时处理");
        me.submitStatus = "unwanted"; //unwanted 空闲 // occupy 占用
      }, 1200);
    },

    getInitTabNum(bizdatas) {
      var result = 0;
      for (var item of bizdatas) {
        if (item.show_ui_model == "tabs") {
          result++;
          break;
        }
      }
      return result;
    },
    getNoAuthorityMessage() {
      // let defaultMsg = `您无权限处理......当前责任人【${this.proHanleData
      //   ._approval_user}】正在处理请等待......`;
      let defaultMsg = `流程审批中...`;
      return this.noAuthorityErrorMessage
        ? this.noAuthorityErrorMessage
        : defaultMsg;
    },
    isStepDataReady() {
      return !_.isEmpty(this.proHanleData) && !_.isEmpty(this.proCharData);
    },
    hideFlowchart(data) {
      if (this.viewFlowChart) {
        this.icon = "el-icon-s-unfold";

        this.viewFlowChart = false;
      } else {
        this.icon = "el-icon-s-fold";
        this.viewFlowChart = true;
      }
    },
    isShowFrom() {
      let fun = new Function();
      /**
       * 未使用
       */
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
    showRecord() {
      this.handle_active_step_no = "_approval_record_";
    },
    getRemarkFileShow(type) {
      var selectResult = this.approval_form.proc_result;
      if (selectResult == "") {
        return false;
      }
      var isShow = true;
      for (var item of this.proHanleData.approval_options) {
        if (item.value == selectResult) {
          var type_value = item[type];

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
      let proc_result = this.approval_form.proc_result;

      if (
        proc_result == "reject" ||
        proc_result == "return_to_start" ||
        proc_result == "return_to_last" ||
        proc_result == "return" ||
        proc_result == "turn"
      ) {
        return { required: true, message: "说明不能为空", trigger: "blur" };
      } else {
        return {};
      }
    },
    step_switch(stepItem, index) {
      this.opinion = null;
      let proChar = this.proCharData;
      for (let i = 0; i < proChar.length; i++) {
        if (proChar[i].step_name == stepItem.step_name) {
          // pass
          if (
            proChar[i]._record_data &&
            proChar[i]._record_data.constructor === Object
          ) {
            let proc_result = proChar[i]._record_data.result_key;
            if (proChar[i].approval_options) {
              let options = proChar[i].approval_options;
              for (let j = 0; j < options.length; j++) {
                if (options[j].key == proc_result) {
                  this.opinion = options[j];
                } else if (!options[j].key && options[j].value == proc_result) {
                  this.opinion = options[j];
                }
              }
            }
          }
        }
      }
      console.log(this.opinion);

      this.handle_active_step_name = stepItem.step_name;
      this.handle_active_step_no = stepItem.step_no;
      for (var item of this.proHanleDataList) {
        if (stepItem.step_no == item.step_no) {
          this.proHanleData = item;
          break;
        }
      }

      this.loadbizNum = [];
      for (var item of this.proHanleData.biz_cfg_data) {
        if (item._uuid) {
          if (item._uuid) {
            this.loadbizNum.push(item._uuid);
          }
        }
      }
      this.getStepConfigJson(); // 加载当前步骤重载信息json
    },

    findTurnUser(query) {
      var service_name = "srvsso_user_select";
      var condition = [
        { colName: "user_disp", value: query, ruleType: "like" }
      ];
      var page = { pageNo: 1, rownumber: 50 };

      setTimeout(() => {
        let url = window.backendIpAddr + "/sso/select/" + service_name;
        let selectPromise = this.doSelect(url, service_name, condition, page);
        if (this.apvTurnUserOtionsFunc) {
          selectPromise = this.apvTurnUserOtionsFunc.bind(this)();
        }
        selectPromise.then(response => {
          this.approval_form.userOptions = [];
          var dataList = response.body.data;
          for (var item of dataList) {
            var option = { label: item.user_disp, value: item.user_no };
            this.approval_form.userOptions.push(option);
          }
        });
      }, 200);
    },
    onStepFormLoaded(operate_type, uuid, instanceFormCom) {
      var me = this;

      if (instanceFormCom.actions.submit != undefined) {
        instanceFormCom.actions.submit.visible = false;
      }
      if (instanceFormCom.actions.reset != undefined) {
        instanceFormCom.actions.reset.visible = false;
      }

      if (operate_type == "add") {
        let form = instanceFormCom;
        var i = 0;
        form.$watch(
          function() {
            form.srvValFormModel();
          },
          function(newData, oldData) {
            if (i == 0) {
              for (var item of me.proHanleData.biz_cfg_data) {
                var addData = form.srvValFormModel();

                if (item._uuid == uuid) {
                  for (var key in addData) {
                    item._data_form[key] = addData[key];
                    item._old_data_form[key] = addData[key];
                  }
                }
              }
            } else {
              for (var item of me.proHanleData.biz_cfg_data) {
                var addData = form.srvValFormModel();

                if (item._uuid == uuid) {
                  for (var key in addData) {
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
        let form = instanceFormCom;

        //初始化数据值
        for (var item of me.proHanleData.biz_cfg_data) {
          var updateFromData = form.srvValFormModel4Update;

          if (item._uuid == uuid) {
            for (var key in updateFromData) {
              item._data_form[key] = updateFromData[key];
              item._old_data_form[key] = updateFromData[key];
            }
          }
        }

        form.$watch(
          function() {
            form.srvValFormModel4Update;
          },
          function(newData, oldData) {
            for (var item of me.proHanleData.biz_cfg_data) {
              var updateFromData = form.srvValFormModel4Update;

              if (item._uuid == uuid) {
                for (var key in updateFromData) {
                  item._data_form[key] = updateFromData[key];
                }
              }
            }
          },
          { deep: true }
        );
      }

      this.removeByValue(this.loadbizNum, uuid);
      if (this.loadbizNum.length == 0) {
        this.timedSave();
      }
    },
    getFormViewCondition(item, step_no) {
      var conditions = [];
      var condition = null;

      if (item.biz_type == "child") {
        condition = {
          colName: "parent_proc_instance_no",
          ruleType: "eq",
          value: this.proc_instance_no
        };
      } else {
        condition = {
          colName: "proc_instance_no",
          ruleType: "eq",
          value: this.proc_instance_no
        };
      }

      conditions.push(condition);

      if (item["select_service"] == "srvprocess_record_select") {
        var condition = { colName: "step_no", ruleType: "eq", value: step_no };
        conditions.push(condition);
      }

      return conditions;
    },
    async initProcData() {
      //第一次申请查询基本信息
      if (this.service_name != "" && this.service_name != undefined) {
        this.page_type = "approval";
        let proc_basic_srv = "srvProcess_basic_cfg_v2_select";
        let condition = [
          {
            colName: "service_name",
            ruleType: "eq",
            value: this.service_name
          }
        ];

        //
        await this.select(proc_basic_srv, condition).then(response => {
          var respData = response.body;
          if (respData.state == "SUCCESS") {

  this.proc_basic = response.body.proc_basic;
            this.proCharData = response.body.proCharData;

            this.proHanleDataList = response.body.proHanleData;
            if(response.body.urgentStep){
              this.urgentStep=response.body.urgentStep
              for(var item of this.urgentStep){
                  
            
                  for(var it of this.proCharData){

                          if(item["step_no"]==it["step_no"]&& this.proc_basic.init_step_no!=it["step_no"]){
                            it["step_name"]=it["step_name"]+"(紧急)";
                            if(it["simple_step_name"]!=null){
                               it["simple_step_name"]=it["simple_step_name"]+"(紧急)";
                            }else{
                               it["simple_step_name"]=it["step_name"];
                            }
                           
                            break;
                          }
                  }

              }

            }
            
            this.button_info = response.body.button;
            this.processTempl = response.body.processTempl;

          
            var more_config = this.proc_basic.more_config;
            if (more_config && more_config.approval) {
              this.recordShow = more_config.approval.record;
              this.resultShow = more_config.approval.result;
            }
            if (this.proHanleDataList) {
              for (var listItem of this.proHanleDataList) {
                if (listItem.approval_options != undefined) {
                  for (var item of listItem.approval_options) {
                    var key = item.key;

                    if (key == undefined) {
                      var key_value = item["value"];
                      item["key"] = key_value;
                      item["key_value"] = key_value;
                    } else {
                      var key_value = item["value"];
                      item["value"] = key;
                      item["key_value"] = key_value;
                    }
                  }
                }
              }
            }

            this.proHanleDataList = this.getShowBizForm(
              this.proHanleDataList,
              this.startProcDefaultValue,
              this.proc_basic.init_step_no
            );
            if (this.proHanleDataList.length > 0) {
              this.proHanleData = this.proHanleDataList[0];
            }
            this.loadbizNum = [];
            for (var item of this.proHanleData.biz_cfg_data) {
              if (item._uuid) {
                this.loadbizNum.push(item._uuid);
              }
            }

            this.handle_active_step_name = this.proHanleData.step_name;
            this.handle_active_step_no = this.proHanleData.step_no;
            if (this.proc_basic) {
              if (
                this.proc_basic.save_period == undefined ||
                this.proc_basic.save_period == null ||
                this.proc_basic.save_period == ""
              ) {
                this.interval == null;
              } else {
                this.interval = this.proc_basic.save_period;
              }
            }
          }
          this.mainData = this.startProcDefaultValue;
          /**
           * 处理默认表单是否显示
           */
          this.proCharData = this.getShowBizForm(
            this.proCharData,
            this.startProcDefaultValue,
            this.proc_basic.init_step_no
          );
          this.emitEvent("metadata-loaded", this);
        });
      } else {
        this.page_type = "detail";
        //流程详情页面
        this.record_default_condition = [
          {
            colName: "proc_instance_no",
            value: this.proc_instance_no,
            ruleType: "eq"
          }
        ];
        let proc_basic_srv = "srvProcess_basic_cfg_v2_select";
        let condition = [
          {
            colName: "proc_instance_no",
            ruleType: "eq",
            value: this.proc_instance_no
          }
        ];
        //
        await this.select(proc_basic_srv, condition).then(response => {
          this.proCharData = response.body.proCharData;
          let hanleDatas = response.body.proHanleData;
          
          hanleDatas.forEach(item => {
            if (item.authority) {
              this.proHanleDataList.unshift(item);
            } else {
              this.proHanleDataList.push(item);
            }
          });
          this.processTempl = response.body.processTempl;

         this.proc_basic = response.body.proc_basic;

          if(response.body.urgentStep&&response.body.urgent=='是'){
                this.urgentStep=response.body.urgentStep
              for(var item of this.urgentStep){
                  
            
                  for(var it of this.proCharData){

                          if(item["step_no"]==it["step_no"]&&this.proc_basic.init_step_no!=it["step_no"]){
                            it["step_name"]=it["step_name"]+"(紧急)";
                           

                            if(it["simple_step_name"]!=null){
                               it["simple_step_name"]=it["simple_step_name"]+"(紧急)";
                            }else{
                               it["simple_step_name"]=it["step_name"];
                            }
                            break;
                          }
                  }

              }
          }

        

     
          var more_config = this.proc_basic.more_config;
          if (more_config && more_config.approval) {
            this.recordShow = more_config.approval.record;
            this.resultShow = more_config.approval.result;
          }
          this.mainData = response.body.mainData;
          if (this.proHanleDataList) {
            for (var listItem of this.proHanleDataList) {
              if (listItem.approval_options != undefined) {
                for (var item of listItem.approval_options) {
                  var key = item.key;

                  if (key == undefined) {
                    var key_value = item["value"];
                    item["key"] = key_value;
                    item["key_value"] = key_value;
                  } else {
                    var key_value = item["value"];
                    item["value"] = key;
                    item["key_value"] = key_value;
                  }
                }
              }
            }
          }

          this.proHanleDataList = this.getShowBizForm(
            this.proHanleDataList,
            this.mainData,
            this.proc_basic.init_step_no
          );
          if (this.proHanleDataList.length > 0) {
            this.proHanleData = this.proHanleDataList[0];
          }

          this.loadbizNum = [];
          for (var item of this.proHanleData.biz_cfg_data) {
            if (item._uuid) {
              this.loadbizNum.push(item._uuid);
            }
          }

          this.handle_active_step_name = this.proHanleData.step_name;
          this.handle_active_step_no = this.proHanleData.step_no;

          if (this.proc_basic) {
            if (
              this.proc_basic.save_period == undefined ||
              this.proc_basic.save_period == null ||
              this.proc_basic.save_period == ""
            ) {
              this.interval == null;
            } else {
              this.interval = this.proc_basic.save_period;
            }
          }
          /**
           * 处理默认表单是否显示
           */
          this.proCharData = this.getShowBizForm(
            this.proCharData,
            this.mainData,
            this.proc_basic.init_step_no
          );

          this.emitEvent("metadata-loaded", this);
        });
      }
      this.proHanleDataList = this.getShowBizForm(
        this.proHanleDataList,
        this.mainData,
        this.proc_basic.init_step_no
      );
      if (this.proHanleDataList.length > 0) {
        this.proHanleData = this.proHanleDataList[0];
      }
      this.getStepConfigJson(); // 获取当前步骤审批表单配置信息
    },
    start(operate_type, procState, timerSave) {
      let self = this;
      var bxRequests = [];
      var bxRequest = {};
      bxRequests.push(bxRequest);
      setTimeout(function() {
        self.submitStatus = "unwanted"; //unwanted 空闲 // occupy 占用
      }, 1200);
      //构建主表数据
      var mainData = {};
      for (var biz_item of this.proHanleData.biz_cfg_data) {
        if (biz_item.proc_main_form == true) {
          var instacneFormCom = biz_item._simpleFormInstance;

          if ("add" == operate_type) {
            bxRequest["serviceName"] = biz_item.add_service;
          } else {
            bxRequest["serviceName"] = biz_item.update_service;
            bxRequest["condition"] = [
              {
                colName: "proc_instance_no",
                ruleType: "eq",
                value: this.proc_instance_no
              }
            ];
            bxRequest["proc_instance_no"] = this.proc_instance_no;
          }

          bxRequest["data"] = [];

          // var formData = instacneFormCom.srvValFormModel();
          var formData = instacneFormCom.buildRunQuries();

          var formmainData = formData[0];
          mainData = formmainData.data[0];
          bxRequest["data"].push(mainData);
          if(this.urgent){
           bxRequest["urgentProc"]="是";
          }else{
             bxRequest["urgentProc"]="否";
          }
         
          break;
        }
      }

      // mainData["child_data_list"] = [];  // 主表可能存在自身主子表数据，无需置空
      //查询看是否存在相关子表数据
      var biz_cfg_data = this.proHanleData.biz_cfg_data;
      for (var item of biz_cfg_data) {
        if (item["biz_type"] == "child" && item["type"] == "grid") {
          var simpleList = item._simpleListInstance;
          if (simpleList != undefined) {
            var childDataList = simpleList.getListData();

            for (var itemData of childDataList) {
              var childRequest = {};

              if ("add" == itemData._dirtyFlags) {
                childRequest["serviceName"] = item["add_service"];
                var dataArray = [];
                var dataMap = {};
                for (var datakey in itemData) {
                  if (!datakey.startsWith("_") && datakey != "id") {
                    dataMap[datakey] = itemData[datakey];
                  }
                }
                dataArray.push(dataMap);
                childRequest.data = dataArray;
                let depend_keys = this.getDependKey(item["_foreign_key"]);
                childRequest["depend_keys"] = depend_keys;
              } else if ("update" == itemData._dirtyFlags) {
                childRequest["serviceName"] = item["update_service"];
                var dataArray = [];
                var dataMap = {};
                for (var datakey in itemData) {
                  if (!datakey.startsWith("_") && datakey != "id") {
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
                    value: itemData.id
                  }
                ];
              } else if ("delete" == itemData._dirtyFlags) {
                childRequest["serviceName"] = item["delete_service"];

                childRequest["condition"] = [
                  {
                    colName: "id",
                    ruleType: "in",
                    value: itemData.id
                  }
                ];
              }

              if (Object.keys(childRequest).length > 0) {
                mainData.child_data_list.push(childRequest);
              }
            }
          }
        } else if (item["biz_type"] == "child" && item["type"] == "form") {
          // } else if ((item["biz_type"] == "child" || item["biz_type"] == "main") && item["type"] == "form") {
          {
            if (item["_type_form"] == "update") {
              var childdata = item._simpleFormInstance.buildRunQuries();
              mainData["child_data_list"].push(childdata[0]);
            } else if (item["_type_form"] == "add") {
              var childdata = item._simpleFormInstance.buildRunQuries();
              mainData["child_data_list"].push(childdata[0]);
            }
          }
        }
      }
      /**
       * 处理表单验证函数
       */
      if (
        this.proHanleData.validate_fun !== null &&
        this.proHanleData.validate_fun !== ""
      ) {
        let data = bxRequests;
        let funStr = this.proHanleData.validate_fun;
        let testFun = new Function("return " + funStr);
        this.validateFun = testFun();
      } else {
        // let funStrb = ""
        // let testFun = new Function('return '+ funStrb)
        this.validateFun = function() {
          return { valid: true, msg: "" };
        };
      }

      //提交数据

      if (procState == "submit") {
        let datas = bxRequests;
        let childDatas = this.childDataLoaded;
        if (Object.keys(childDatas).length > 0) {
          for (let key in childDatas) {
            let item = childDatas[key];
            if (item.length > 0) {
              item = item.filter(row => {
                // 过滤掉内存表删除的数据
                if (
                  !row.hasOwnProperty("_dirtyFlags") &&
                  !(row._dirtyFlags === "delete")
                ) {
                  return row;
                }
              });
            }
          }
        }

        let vFun = this.validateFun(datas, childDatas);

        if (this.button_info != null && !vFun.valid) {
          var result = this.prevalidate(bxRequests);
          let funResult = this.validateFun(bxRequests, childDatas);
          if (typeof result == "boolean" && funResult) {
            if (result) {
            }
          } else {
            this.$message({
              type: "error",
              message: result + (funResult ? "" : "请填写完整的信息后再提交")
            });
            return;
          }
        }

        if (this.timeId != null) {
          clearInterval(this.timeId);
        }

        // if (vFun.valid || bxRequests[0].serviceName.indexOf("update") !== -1) {
        if (vFun.valid) {
          // 启动编辑校验子表
          this.startProc(bxRequests).then(response => {
            var state = response.body.state;
            if ("SUCCESS" == state) {
              this.$message({
                type: "success",
                message: "提交成功!"
              });
              var response = response.body["data"];
              var proc_instance_no = response[0]["proc_instance_no"];
              this.$router.push({
                name: "procdetail_v2",
                params: { proc_instance_no: proc_instance_no }
              });
              window.location.reload();
            } else {
              this.$message({
                type: "error",
                message: response.body.resultMessage
              });
            }
          });
        } else {
          this.$message({
            type: "error",
            message: vFun.msg
          });
        }
      } else {
        if (timerSave) {
          if (this.time_save_cycle == 0) {
            this.save_data_str = JSON.stringify(bxRequests);
            this.time_save_cycle = this.time_save_cycle + 1;

            return;
          } else {
            this.time_save_cycle = this.time_save_cycle + 1;
            var str = JSON.stringify(bxRequests);
            if (this.save_data_str == str) {
              return;
            } else {
              this.save_data_str = str;
            }
          }
        }

        this.saveDraft(bxRequests).then(response => {
          var state = response.body.state;

          if ("SUCCESS" == state) {
            this.$message({
              type: "success",
              message: "保存成功!"
            });

            var response = response.body["data"];
            var proc_instance_no = response[0]["proc_instance_no"];
            this.proc_instance_no = proc_instance_no;
            this.$router.push({
              name: "procdetail_v2",
              params: { proc_instance_no: proc_instance_no }
            });
            if (timerSave) {
            } else {
              setTimeout(() => {
                window.location.reload();
              }, 500);
            }
          } else {
            this.$message({
              type: "error",
              message: response.body.resultMessage
            });
          }
        });
      }
    },
    getChildDataForm(item, fill_type) {
      var childRequests = [];
      var childRequest = {};
      if (item["_type_form"] == "update") {
        var olddata = item._old_data_form;
        var newData = item._data_form;
        if (JSON.stringify(olddata) != JSON.stringify(newData)) {
          var updateData = {};

          for (var key in newData) {
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
              value: newData.id
            }
          ];
          childRequests.push(childRequest);
        }
      } else if (item["_type_form"] == "add") {
        childRequest["serviceName"] = item["add_service"];

        var newData = item._data_form;
        var addData = {};

        for (var key in newData) {
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
      var depend_keys = [];
      for (var foreign_item of foreignKeyList) {
        var depend = {};
        depend["type"] = "column";
        depend["depend_key"] = foreign_item["referenced_column_name"];
        depend["add_col"] = foreign_item["column_name"];
        depend_keys.push(depend);
      }
      return depend_keys;
    },
    fillOperateData(data, foreignKeyList) {
      for (var item of data) {
        for (var foreign_item of foreignKeyList) {
          item[foreign_item["column_name"]] = this.mainData[
            foreign_item["referenced_column_name"]
          ];
        }
      }
    },
    resetForm(formName) {
      this.$refs[formName][0].resetFields();
      this.uplaodFiled.model = "";
    },
    timedSave() {
      var me = this;

      if (this.proHanleData.authority == true && this.interval != null) {
        if (this.proHanleData.step_no == this.proc_basic.init_step_no) {
          this.timeId = setInterval(() => {
            if (me.proc_instance_no) {
              me.start("update", "save", true);
            } else {
              me.start("add", "save", true);
            }
          }, this.interval * 1000);

          if (me.proc_instance_no) {
            me.start("update", "save", true);
          } else {
            me.start("add", "save", true);
          }
        } else {
          // //审批流程定时保存草稿
          // this.timeId = setInterval(() => {
          //   me.submitApprovalForm("approval_form", true, true);
          // }, this.interval * 1000);  //startProcDefaultValue
          // me.submitApprovalForm("approval_form", true, true);
        }
      }
    }
  },
  created: function() {
    if (this.$route && this.$route.query) {
      this.startProcDefaultValue = {};
      var operate_params = this.getOperateParams();
      if (operate_params != "" && operate_params != null) {
        var operate_Object = JSON.parse(operate_params);
        this.startProcDefaultValue = operate_Object;
      }
      var temp_str = this.getVueUrlParams("defDataPara");
      if (temp_str != null && temp_str != "") {
        this.defDataPara = JSON.parse(temp_str);
      }
    }
    this.initload = true;
    this.initProcData();
  }
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

.tag_font_class {
  display: block;
  min-width: 10rem;
  color: #409eff;
  font-weight: 600;
  line-height: 1.5rem;
  font-size: 13px;
  padding: 4px;
  border-bottom: 1px solid #d8e6f5;
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
