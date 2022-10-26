<template>
  <div v-show="evalVisible()">
    <el-tabs v-if="isDraft" v-model="activeTabName" @tab-click="onTabshandleClick">
      <el-tab-pane v-for="(tabItem,index) in tabsConfig" :key="index" :label="tabItem.label" :name="tabItem.key">
        <span slot="label"> {{tabItem.label}}({{tabItem.len}})</span>
      </el-tab-pane>
    </el-tabs>
    <div v-if="searchForm" v-show="selectFormShow">
      <simple-filter v-if="srv_cols" :srv_cols="srv_cols" :supportGroup="false" v-on:search-clicked="query" ref="filter-form" @form-loaded="onFilterFormLoaded($refs['filter-form'])">
      </simple-filter>
    </div>

    <div v-if="list_inner_add">
      <add name="list-inner-add" ref="add-form" :service="getAddService" :submit2-db="storageType == 'db'" @action-complete="onAddFormActionComplete($event)" @form-loaded="onAddFormLoaded" @submitted2mem="onAdd2MemSubmitted">
      </add>
    </div>
    <el-row v-if="groupByLayoutRun.length > 0" type="flex" class="row-bg-group-layout" justify="left">
         <el-col :xs="8" :sm="6" :md="4" :lg="3" :xl="1" v-for="(item,index) in groupByLayoutRun" :key="index">
           <div class="grid-content bg-purple group-by-layout">
             {{item.aliasName}}:{{item.value}}{{item.unit}}
           </div>
           </el-col>
    </el-row>
    <el-row v-show="!hideButtons" type="flex" class="row-bg" justify="space-between" v-if="gridButtonPos == 'top'">
       <div class="table-head-btns">
          <el-button type="primary" size="small" v-if="(defaultDirtyFlags == 'add' || listType ==  'updatechildlist') && batchAddButton && batchAddButton.hasOwnProperty('batchAdd') && batchAddButton.batchAdd.isDisp" @click.stop="onBatchAddCheckButton()">
            {{batchAddButton.batchAdd.buttonName}}
          </el-button>
        </div>
      <div class="table-head-btns">
       
        <template v-for="(item, index) in sortedGridButtons">
          <el-button :key="index" :size="item._moreConfig.size" :type="selectFormShow && item.button_type === 'select' ? 'success' : item._moreConfig.type " :icon="item._moreConfig.icon" :round="item._moreConfig.style !== '' &&  item._moreConfig.style === 'round'" :plain="item._moreConfig.style !== '' && item._moreConfig.style === 'plain'" :circle="item._moreConfig.style !== '' && item._moreConfig.style === 'circle'" v-show="item.evalVisible()" :disabled="item.evalDisable()" v-if="(!readOnly && existsGridButton && item.permission && getDispExps(item)) || !item.permission && item.hasOwnProperty('always_show') && item.always_show === true" @click="gridButtonClick(item)">
            {{item.button_name}}
          </el-button>

        </template>
      </div>

      <!-- <div>
            <el-button  @click="gridButtonClick({'button_type':'export'})">
                导出测试
              </el-button>
          </div> -->
    </el-row>
    <div class="table-list-row">
      <div v-if="card_no!=undefined">

        <simple-card v-if="init_card_data" name="cardlist" ref="cardlist" :card_cfg="card_cfg" :row_button="rowButton" :data_list="gridData" @card-loaded="cardLoadinit" @card-row-button="rowButtonClick"></simple-card>

      </div>

      <div v-else>
        <el-row type="flex" class="row-bg" justify="center">
          <el-table header-row-class-name="header-row" :data="gridDataRun" stripe border style="width: 100%" :row-class-name="tableRowClassName" row-key="id" highlight-current-row @selection-change="handleSelectionChange" @filter-change="filterChange" :sortable="tabBasicsConfig.sortable" @sort-change="handleSortChange" :show-summary="getShowTableSummary()" :summary-method="onSummaryMethod" @row-dblclick="onRowDbClicked">
            <el-table-column type="selection" label="全选" header-align="left" width="50px" v-if="(selection && !readOnly) || listType=='selectlist'">
            </el-table-column>
            <!-- v-if="(item.show && (!item.evalVisible || item.evalVisible()))" ---↓-->
            <el-table-column v-for="(item, index) in gridHeader" :key="index" header-align="left" v-if="getGridHeaderDispExps(item,listMainFormDatas)" :width="item.width ? item.width : getListShowFileList(item) ? item.list_min_width ? item.list_min_width : 180 : ''" :filter-method="item.filters && tabBasicsConfig.sortable ? filterHandler : null" :prop="item.column" :align="item.align" :fixed="item.rowFixed ? true : null" :show-overflow-tooltip="getListShowFileList(item) === true ? false : true" :label="item.label" :min-width="item.list_min_width + 'px'"  :column-key="item.column" :sortable="tabBasicsConfig.sortable && item.sortable && !isMem() ? 'custom' : false">
              <template slot-scope="scope">
                <!-- v-if="isInplaceEdit()  &&findEditField(scope.row, item.column)" -->
                <div v-if="(listType == 'addchildlist' || listType == 'updatechildlist') && item.srvcol.hasOwnProperty('updatable') && item.srvcol.updatable == 1" class="is-InplaceEdit">
                  <raw-field-editor v-if="findEditField(scope.row, item.column)" :field="findEditField(scope.row, item.column)"
                          @field-value-changed="onCellValueChanged(scope.row, item.column)"
                          @blur="onCellBlur(scope.row, item.column)">
                    </raw-field-editor>
                  <!-- {{formatValue(scope.row, item)}} -->
                </div>
                <div v-else-if="item.col_type === 'progress'">  
                    <!-- 进度条 -->
                  <el-progress :text-inside="true" :stroke-width="18" :percentage="scope.row[item.column]"></el-progress>
                </div>
                <!-- Enum | Dict 根据配置显示图标 -->
                <div v-else-if="(item.col_type === 'Enum' || item.col_type === 'Dict') && item.show_option_icon !== false">
                  <div v-for="(optionIcon,index) in item.show_option_icon" :key="index" class="row-icons">
                    <img fit="contain" v-if="scope.row[item.column] === optionIcon.value" :src="optionIcon.icon" />
                  </div>
                </div>
                <div v-else-if="item.col_type === 'Image'" class="list-image">
                  <img v-if="scope.row[item.column]" :src="serviceApi(scope.row[item.column]).downloadFileNo+scope.row[item.column]" />
                </div>

              
                <div v-else-if="item.col_type === 'FileList' && getListShowFileList(item)" class="list-image">
                  <div :title="fileItem.src_name" v-for="(fileItem,index) in getListFileDatas(item,scope.row)" :key="index">
                    <i v-show="getFileType(fileItem) === 'img' || getFileType(fileItem) === 'pdf'" class="el-icon-view" @click.stop="onPreView(fileItem,index,getListFileDatas(item,scope.row))">

                    </i>
                    <el-link type="primary" @click="getDownloadFile(fileItem)" v-if="getListFileDatas(item,scope.row).length > 0">

                      <i :class="getFileType(fileItem) === 'img' ? 
                        'el-icon-picture-outline' : getFileType(fileItem) === 'doc' ? 
                        'el-icon-tickets' : getFileType(fileItem) === 'media' ? 
                        'el-icon-picture-outline':'el-icon-folder'"></i>
                      {{getStrIntercept(fileItem.src_name,0)}}

                    </el-link>
                    <!-- <span></span> -->
                  </div>
                </div>
                <template v-else>
                  <div v-if="header_view_model=='group'" class="group-table">

                    <pre>{{formatValue(scope.row, item)}}</pre>

                  </div>
                  <div v-else>
                    <a v-if="item.linkUrlFunc" v-show="scope.row[item.column]" style="white-space: normal; color: dodgerblue; cursor: pointer;" @click="onLinkClicked(scope.row, item)">
                      {{formatValue(scope.row, item)}}
                    </a>
                    <div style="display:flex;flex-wrap:wrap;" v-else-if="isFkJson(scope.row,item)">
                      <el-tag style="margin-right:4px;margin-bottom:2px;" size="mini" :type="['','success','warning','danger'][tIndex%4]" v-for="(tag,tIndex) in getFkJson(scope.row,item)" :key="tIndex">{{tag||''}}</el-tag>
                    </div>
                    <span v-else>{{formatValue(scope.row, item)}}</span>

                  </div>

                </template>
              </template>

            </el-table-column>

            <el-table-column label="操作" header-align="left" width="240" fixed="right" v-if="isShowRowButtons && !readOnly && listType!='selectlist' && !hideButtons&&sortedRowButtons.length>0">
              <template slot-scope="scope">
                <!-- <el-button v-for="(button, index) in sortedRowButtons"
                            :key="index"
                            @click="rowButtonClick(button,scope.row)"
                            :size="button._moreConfig.size" 
                            :type="button._moreConfig.type" 
                            :icon="button._moreConfig.icon" 
                            :round="button._moreConfig.style !== '' &&  button._moreConfig.style === 'round'"
                            :plain="button._moreConfig.style !== '' && button._moreConfig.style === 'plain'"
                            :circle="button._moreConfig.style !== '' && button._moreConfig.style === 'circle'"
                            :disabled="button.evalDisable()"
                            v-if="getDispExps(button, scope.row) && button.permission"
                            v-show="isRowButtonVisible(button, scope.row)">
                    {{ getButtonName(button, scope.row) }}
                  </el-button> -->
                <span v-for="(button, index) in sortedRowButtons" :key="index" style="margin-right:10px" v-if="getDispExps(button, scope.row) && button.permission" v-show="button.button_type === '_btn_group' || isRowButtonVisible(button, scope.row)">
                  <el-button @click="rowButtonClick(button,scope.row)" :size="button._moreConfig.size" :type="button._moreConfig.type" :icon="button._moreConfig.icon" :round="button._moreConfig.style !== '' &&  button._moreConfig.style === 'round'" :plain="button._moreConfig.style !== '' && button._moreConfig.style === 'plain'" :circle="button._moreConfig.style !== '' && button._moreConfig.style === 'circle'" :disabled="button.evalDisable()" v-if="button.button_type !== '_btn_group'  && getButtonOptSrv(button,scope.row,'isShow')">
                    {{ getButtonName(button, scope.row) }}
                  </el-button>
                  <el-dropdown v-else-if="button.button_type === '_btn_group' && button.buttons.length > 0 && getButtonDispExps(button.buttons, scope.row)">
                    <el-button :type="button.type" :size="button.size" plain>
                      {{button.button_name}}
                      <i class="el-icon-arrow-down el-icon--right"></i>
                    </el-button>

                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item v-for="(subtns,i) in button.buttons" :key="i">
                        <el-button @click="rowButtonClick(subtns,scope.row)" :size="subtns._moreConfig.size" :type="subtns._moreConfig.type" :icon="subtns._moreConfig.icon" :round="subtns._moreConfig.style !== '' &&  subtns._moreConfig.style === 'round'" :plain="subtns._moreConfig.style !== '' && subtns._moreConfig.style === 'plain'" :circle="subtns._moreConfig.style !== '' && subtns._moreConfig.style === 'circle'" :disabled="subtns.evalDisable()" v-show="isRowButtonVisible(subtns, scope.row) && ( getDispExps(subtns, scope.row) && subtns.permission) && getButtonOptSrv(subtns,scope.row,'isShow')">{{subtns.button_name}}</el-button>
                      </el-dropdown-item>
                    </el-dropdown-menu>

                  </el-dropdown>
                </span>
                <!-- <el-badge  class="table-row-badge" 
                      v-if="isMem() && isDirtyRow(scope.row)"
                      :value="getDirtyRowTagText(scope.row)"
                      :type="getDirtyRowTagType(scope.row)"> 
                      -->
                <!-- {{getDirtyRowTagText(scope.row) === '添加' ? 'new' : getDirtyRowTagText(scope.row)}} -->
                <!-- <el-tag v-if="isMem() && isDirtyRow(scope.row)"
                          :type="getDirtyRowTagType(scope.row)">
                    {{getDirtyRowTagText(scope.row) === '添加' ? 'new' : getDirtyRowTagText(scope.row)}}
                  </el-tag> -->

                <!-- </el-badge> -->
              </template>
            </el-table-column>

          </el-table>

        </el-row>

      </div>
      <el-row v-show="!hideButtons" type="flex" class="row-bg" justify="space-between" v-if="gridButtonPos == 'bottom'">
       <!-- <div class="table-head-btns">
          <el-button type="primary" size="small" v-if="(defaultDirtyFlags == 'add' || listType ==  'updatechildlist') && batchAddButton && batchAddButton.hasOwnProperty('batchAdd') && batchAddButton.batchAdd.isDisp" @click.stop="onBatchAddCheckButton()">
            {{batchAddButton.batchAdd.buttonName}}
          </el-button>
        </div> -->
      <div class="table-head-btns">
       
        <template v-for="(item, index) in sortedGridButtons">
          <el-button :key="index" :size="item._moreConfig.size" :type="selectFormShow && item.button_type === 'select' ? 'success' : item._moreConfig.type " :icon="item._moreConfig.icon" :round="item._moreConfig.style !== '' &&  item._moreConfig.style === 'round'" :plain="item._moreConfig.style !== '' && item._moreConfig.style === 'plain'" :circle="item._moreConfig.style !== '' && item._moreConfig.style === 'circle'" v-show="item.evalVisible()" :disabled="item.evalDisable()" v-if="(!readOnly && existsGridButton && item.permission && getDispExps(item)) || !item.permission && item.hasOwnProperty('always_show') && item.always_show === true" @click="gridButtonClick(item)">
            {{item.button_name}}
          </el-button>

        </template>
      </div>

      <!-- <div>
            <el-button  @click="gridButtonClick({'button_type':'export'})">
                导出测试
              </el-button>
          </div> -->
    </el-row>
      <!-- <el-row type="flex" class="row-bg" justify="center" v-if="!isMem()" -->
      <el-row type="flex" class="row-bg" justify="center" v-if="showPagination" v-show="!hidePagination && gridPage.total>0">

        <el-pagination background @current-change="handleCurrentChange" @size-change="handleSizeChange" :current-page="gridPage.currentPage" :page-sizes="gridPage.pageSizes" :page-size="gridPage.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="gridPage.total">
        </el-pagination>

      </el-row>
    </div>
    <el-dialog  custom-class="bxdialog" title="添加" :width="dialogWidth(listDialogWidth)" :close-on-click-modal="1==2" append-to-body :visible="activeForm == 'add'" @close="activeForm = 'xx'">
      <add name="list-add" ref="add-form" v-if="activeForm == 'add'" :service="getAddService" :submit2-db="storageType == 'db'" :defaultCondition='defaultCondition' :form-model-decorator="formModelDecorator" :defaultValues="listMainFormDatas" :haveDraft="isDraft" :pageIsDraft="activeTabName" :childForeignkey="childForeignkey" :parentPageType="listType" :parentMainFormDatas="listMainFormDatas" @action-complete="onAddFormActionComplete($event)" @form-loaded="onAddFormLoaded" @submitted2mem="onAdd2MemSubmitted">
      </add>
    </el-dialog>
    <el-dialog  custom-class="bxdialog" title="复制" width="90%" :close-on-click-modal="1==2" append-to-body :visible="activeForm == 'duplicate'" @close="activeForm = 'xx'">
      <simple-add name="list-duplicate" ref="duplicate-form" :pageName="'list-duplicate'" v-if="activeForm == 'duplicate'" :service="getAddService" :default-conditions="getDefaultCondition4Duplicate" :submit2-db="storageType == 'db'" :parentPageType="listType" :defaultValues="activeData"  :parentMainFormDatas="listMainFormDatas" @action-complete="onAddFormActionComplete($event)" @form-loaded="onDuplicateFormLoaded" @submitted2mem="onAdd2MemSubmitted">
      </simple-add>
    </el-dialog>

    <el-dialog  custom-class="bxdialog" title="深度复制" width="90%" :close-on-click-modal="1==2" append-to-body :visible="activeForm == 'duplicatedeep'" @close="activeForm = 'xx'">
      <add name="list-duplicatedeep" ref="duplicatedeep-form" v-if="activeForm == 'duplicatedeep'" :service="getAddService" :default-conditions="getDefaultCondition4DuplicateDeep" :submit2-db="storageType == 'db'" :parentPageType="listType" :haveDraft="isDraft" :pageName="'list-duplicatedeep'" :parentMainFormDatas="listMainFormDatas" :pageIsDraft="activeTabName" :defaultValues="activeData" @action-complete="onAddFormActionComplete($event)" @form-loaded="onDuplicateFormLoaded" @submitted2mem="onAdd2MemSubmitted">
      </add>
    </el-dialog>

    <el-dialog  custom-class="bxdialog" title="编辑" :width="dialogWidth(listDialogWidth)" :visible="activeForm == 'update'" :close-on-click-modal="1==2" append-to-body @close="activeForm = 'xx'">
    
      <update name="list-update" ref="update-form" v-if="activeForm == 'update' " :service="getUpdateService" :pk="getClickedRowPk('update')" :pageIsDraft="activeTabName" :initLoad="initLoad" :defaultValues="clickedRow['update']" :submit2-db="storageType == 'db'" :parentPageType="listType" :haveDraft="isDraft" :parentMainFormDatas="listMainFormDatas" :override-data="clickedRow.update._dirtyFlags ? clickedRow.update : null" @action-complete="onUpdateFormActionComplete($event)" @form-loaded="onUpdateFormLoaded($refs['update-form'])" @submitted2mem="onUpdate2MemSubmitted">
      </update>
      <!-- <simple-update name="list-update" ref="update-form"
                     v-if="activeForm == 'update' " :service="getUpdateService"
                     :pk="getClickedRowPk('update')"
                     :submit2-db="storageType == 'db'"
                     :parentAddMainFormDatas="listMainFormDatas"
                     :override-data="clickedRow.update._dirtyFlags ? clickedRow.update : null"
                     @action-complete="onUpdateFormActionComplete($event)"
                     @form-loaded="onUpdateFormLoaded($refs['update-form'])"
                     @submitted2mem="onUpdate2MemSubmitted">
      </simple-update> -->
    </el-dialog>

    <el-dialog  custom-class="bxdialog" title="导入" width="90%" :visible="activeForm == 'import'" append-to-body @close="activeForm = 'xx'">
      <import-dialog :service="addService" :sign-service-name="addService" v-if="activeForm == 'import'" :button="actionGridButton" @close="onImportDialogClosed">
      </import-dialog>
    </el-dialog>
    <el-dialog  custom-class="bxdialog" title="自定义导入" width="90%" :visible="activeForm == 'customizeImport'" append-to-body @close="activeForm = 'xx'">
      <import-dialog :service="importService" :sign-service-name="addService" :importPageType="'customize'" v-if="activeForm == 'customizeImport'" :button="actionGridButton" @close="onImportDialogClosed">
      </import-dialog>
    </el-dialog>
    <el-dialog  custom-class="bxdialog" title="导出" width="90%" :visible="activeForm ==  'export'" append-to-body @close="onExportDialogClosed">
      <exportLayout :columns="gridHeader" :type="'exprot'" @on-export-clicked="onExportClicked($event)"></exportLayout>
    </el-dialog>
    <el-dialog  custom-class="bxdialog" title="管理子表" width="90%" :visible="activeForm == 'manageChildList'" append-to-body @close="activeForm = 'xx'">
      <popup-mem-list list-type="detaillist" name="inlinelist" v-if="activeForm == 'manageChildList'" ref="inlineList" :service="props4ActivePopupMemList.inline_list_select_service" :foreign-key="props4ActivePopupMemList.foreign_key" :read-only="false" :search-form="false" :is-tree="false" :inplace-edit="true" :should-load-from-db="false" @list-loaded="onPopupMemListLoaded" @close-pop="activeForm = 'xx'">
      </popup-mem-list>
    </el-dialog>
    <el-dialog  custom-class="bxdialog" ref="batchApprove" title="审批" width="90%" :visible="activeForm == 'batchApprove'" append-to-body @close="activeForm = 'xx'">
      <batchApprove @action-success="actionSuccess()" :approvaList="approvaList" :approvalOptions="approvalOptions">测试</batchApprove>
    </el-dialog>

    <div>
      <popup-mem-list v-show="false" v-for="inlineList in inlineLists" :key="inlineList.foreign_key.constraint_name" ref="inlineLists" :service="inlineList.inline_list_select_service" :foreign-key="inlineList.foreign_key" :read-only="false" :search-form="false" :is-tree="false" :inplace-edit="true" :default-inplace-edit-mode="true">
      </popup-mem-list>
    </div>
    <!-- 增加列表可以直接预览文件 -->
    <viewer v-show="false" :images="imagesListRun" ref="viewer" clsss="image-list">

      <img style="height:1rem;width:1rem;" :class="'image-'+ src.id" @error="onerror" @load="onerror(src.url)" :src="src.url" v-for="(src,index) in imagesListRun" :key="index">
    </viewer>
    <el-dialog   custom-class="preview-dialog bxdialog" :title="currentType === 'pdf' ? '第'+currentPage+'页/共'+pageCount+'页' : '预览'" :visible.sync="centerDialogVisible" width="50%" lock-scroll center>

      <el-row type="flex" align="middle" v-if="currentType === 'pdf'">
        <el-col :span="2" class="grid-content">
          <el-button icon="el-icon-arrow-left" circle :disabled="currentPage === 1" @click="changePdfPage('up')"></el-button>
        </el-col>
        <el-col :span="20" style="">
          <div style="text-align:right;display: flex;justify-content: space-between;">
            <el-button icon="el-icon-minus" circle :disabled="scale === 10" @click="scaleX"></el-button>
            <span>当前比例：{{scale}}%</span>
            <el-button icon="el-icon-plus" circle :disabled="scale === 200" @click="scaleD"></el-button>
          </div>
          <div style="text-align:center;overflow: auto;border:1px solid #eee;height: 735px;">
            <pdf ref="wrapper" :src="currentUrl" :page="currentPage" @num-pages="pageCount=$event">
            </pdf>

          </div>

        </el-col>
        <el-col :span="2" class="grid-content" style="text-align:right;">
          <el-button icon="el-icon-arrow-right" circle :disabled="currentPage === pageCount" @click="changePdfPage('next')"></el-button>
        </el-col>

      </el-row>

      <!-- <el-image v-else  :src="currentUrl" lazy></el-image> -->
    </el-dialog>
     <el-dialog  custom-class="bxdialog"  title="选择" width="90%" :visible="batchCheckDialogVisible" append-to-body @close="batchCheckDialogVisible = false">
       
        <batch-edit-list-select  ref="check-list" :mainType="'add'" :searchColumn="batchAddButton && batchAddButton.hasOwnProperty('batchAdd') ? batchAddButton.batchAdd.searchColumn : ''" :service="batchAddButton && batchAddButton.hasOwnProperty('batchAdd') ? batchAddButton.batchAdd.service : ''" :childservice="batchAddButton && batchAddButton.hasOwnProperty('batchAdd') ? batchAddButton.batchAdd.childservice : ''" @on-save="onSelectSave($event)" @on-clancel="onSelectClancel($event)" :type="batchAddButton && batchAddButton.hasOwnProperty('batchAdd') ? batchAddButton.batchAdd.type : 'list'"></batch-edit-list-select>
    </el-dialog>
  </div>
</template>

<script>
import simpleFilter from "./simple-filter.vue";
import simpleCard from "./simple-card.vue";
import SimpleAdd from "./simple-add.vue";
import SimpleUpdate from "./simple-update.vue";
import update from "./update.vue";
import ListPopupMixin from "../mixin/list-popup-mixin"; // 弹出列表js
import CustButtonMinx from "../mixin/cust-button-minx"; // 自定义按钮js
import MemListMixin from "../mixin/mem-list-mixin"; // 内存列表js
import FieldRedundantMixin from "../mixin/field-redundant-mixin"; // 字段上下游js
import ListMixin from "../mixin/list-mixin"; // 列表js

import RawFieldEditor from "../common/raw-field-editor.vue"; // 表单元件
import InlineList from "../common/inline-list.vue"; // 废弃
import ImportDialog from "../ui/import-form.vue"; // 导入ui
import UploadFile from "../ui/upload-file.vue"; // 上传文件
import PopupMemList from "./popup-mem-list"; // 弹出内存列表
import exportLayout from "./export-layout"; // 自定义导出 || 导入
import batchApprove from "../ui/batch-approve.vue"; // 流程审批
// import batchApprove from "../ui/batch-approve.vue";   // 流程审批
import pdf from "vue-pdf";
import CMapReaderFactory from "vue-pdf/src/CMapReaderFactory.js";

// 批量编辑列表场景 扩展 10-18
import batchEditList from "@/components/mixin/batch-edit-child-list-mixin.js";
import batchEditListSelect from "@/pages/retail/checkEditPlus/select-list.vue";
export default {
  name: "list",
  components: {
    PopupMemList,
    UploadFile,
    ImportDialog,
    SimpleUpdate, 
    SimpleAdd,
    simpleFilter,
    simpleCard,
    RawFieldEditor,
    InlineList,
    exportLayout,
    update: () => import("../common/update.vue"),
    Add: () => import("../common/add.vue"),
    batchApprove,
    batchEditListSelect
  },
  props: {
    childForeignkey: Object,
    defaultCondition: Array
  },

  mixins: [
    ListPopupMixin,
    CustButtonMinx,
    MemListMixin,
    FieldRedundantMixin,
    ListMixin,
    batchEditList
  ],
  data() {
    return {
      centerDialogVisible: false, // 是否显示预览
      currentUrl: "",
      currentType: "",
      currentPage: 1,
      pageCount: 0,
      scale: 100, //放大系数
      currentUrlLike: "",
      imagesRun: []
    };
  },

  computed: {
    props4ActivePopupMemList() {
      let fk = this.activePopupMemList.foreign_key;
      return {
        inline_list_select_service: this.activePopupMemList
          .inline_list_select_service,
        foreign_key: fk
      };
    },
    imagesListRun: function() {
      let self = this;
      let list = this.imagesRun.length > 0 ? this.imagesRun : [];
      list = list.filter(item => {
        if (item.hasOwnProperty("response")) {
          item = Object.assign(item, item.response);
        }
        if (
          item.file_type === "png" ||
          item.file_type === "jpeg" ||
          item.file_type === "jpg" ||
          item.file_type === "gif" ||
          item.file_type === "JPG"
        ) {
          let fileUrl = item.hasOwnProperty("fileurl")
            ? self.serviceApi().downloadFile + item.fileurl
            : self.serviceApi().downloadFile + item.response.fileurl;
          item.url = fileUrl;
          return {
            title: item.name,
            url: fileUrl,
            type: item.file_type
          };
        }
      });
      return list;
    }
  },

  methods: {
    
    wrapCellIntoField(column, value) {
      let info = {
        editable: false
      };
      return {
        model: value,
        info: info
      };
    },
    moreFileRun: function() {
      let list = this.fileLists;
      list = list.filter(item => {
        return item;
      });
      return list;
    },
    onerror(e) {
      // console.log("显示失败",e)
    },
    inited(viewer) {
      this.$viewer = viewer;
    },
    show() {
      this.$viewer.show();
    },
    onPreView(file, index, files) {
      let self = this;
      let fileType = file.hasOwnProperty("file_type")
        ? file.file_type
        : file.response.file_type;
      self.imagesRun = files.map(item => item);
      if (
        fileType === "jpg" ||
        fileType === "png" ||
        fileType === "gif" ||
        fileType === "JPG"
      ) {
        // const viewer = self.$el.$viewer
        const viewer2 = self.$el.querySelector(".image-" + file.id);
        //  view.setdefaults
        // const viewer2 = self.$el.querySelector('.image-list')
        let imgIndex = 0;

        self.imagesListRun.forEach((item, i) => {
          if (item.id == file.id) {
            imgIndex = i;
          }
        });
        const viewer = self.$refs.viewer.$viewer;
        viewer.index = imgIndex;
        //console.log(viewer,imgIndex,viewer2,self.$refs.viewer)
        viewer.show();
      } else if (
        fileType === "pdf" ||
        fileType === "jpg" ||
        fileType === "png" ||
        fileType === "gif" ||
        fileType === "JPG"
      ) {
        if (fileType === "pdf") {
          self.handlePreview(file);
        } else {
          this.currentUrl = file.url;

          this.centerDialogVisible = true;
        }
        this.currentUrlLike = file.url;
        this.currentType = fileType;
        // console.log(file)
      } else {
        this.$message({
          message: "只支持【pdf】/【jpg】/【png】格式预览，其他格式请点击文件名下载查看",
          type: "warning"
        });
      }
    },
    handlePreview(file) {
      //点击文件时触发
      //console.log('handlePreview',file)

      let fileType = file.file_type;
      if (!file.hasOwnProperty("url")) {
        file.url = file.fileurl;
      }
      if (file.url.toLowerCase().endsWith(".pdf")) {
        let currLocation = window.location.href;
        let hashIndex = currLocation.indexOf("#");
        if (hashIndex > 0) {
          let pdfPreviewUrl =
            currLocation.substring(0, hashIndex) +
            "#/viewpdf?pdfsrc=" +
            encodeURIComponent(file.url);
          this.addTabByUrl(pdfPreviewUrl, "文件预览");
          return;
        }
      } else if (
        fileType === "jpg" ||
        fileType === "png" ||
        fileType === "gif" ||
        fileType === "JPG"
      ) {
        let fileData = null;
        if (file.hasOwnProperty("response")) {
          fileData = Object.assign(file, file.response);
        } else {
          fileData = file;
        }
        this.onPreView(fileData);
      } else {
        this.download(file.url, file.name);
      }
    },
    //放大
    scaleD() {
      this.scale += 5;
      // this.$refs.wrapper.$el.style.transform = "scale(" + this.scale + ")";
      this.$refs.wrapper.$el.style.width = parseInt(this.scale) + "%";
    },

    //缩小
    scaleX() {
      if (this.scale == 100) {
        return;
      }
      this.scale += -5;
      this.$refs.wrapper.$el.style.width = parseInt(this.scale) + "%";
      // this.$refs.wrapper.$el.style.transform = "scale(" + this.scale + ")";
    },
    // 改变PDF页码,val传过来区分上一页下一页的值,0上一页,1下一页
    changePdfPage(type) {
      this.currentPage;
      // console.log(val)
      if (type === "next") {
        if (this.currentPage < this.pageCount) {
          this.currentPage++;
          // console.log(this.currentPage)
        }
      } else {
        if (this.currentPage > 1) {
          this.currentPage--;
          // console.log(this.currentPage)
        }
      }
    }
  }
};
</script>

<style lang="less">
#app {
  > div {
    > .el-row {
      > .isFixed.el-table {
        > .el-table__header-wrapper {
          position: fixed;
          top: 0;
          z-index: 3;
        }
        .el-table__fixed-header-wrapper {
          top: 0;
          position: fixed;
          // padding: 12px 0;
          z-index: 4;
          // overflow: hidden;
          right: 0.5rem;
          > table {
            > thead {
              tr {
                background-color: transparent;
                th {
                  background-color: transparent;
                  opacity: 0;
                  // display: none;
                }
                th:last-child {
                  background-color: #fff;
                  opacity: 1;
                  padding: 12px 0;
                }
              }
            }
            > tbody {
            }
          }
        }
      }
    }
  }
}
.table-row-badge {
  .el-badge__content.is-fixed {
    position: relative;
    top: 5px;
    right: 5px;
  }
}
.el-table th.gutter {
  display: table-cell !important;
}

.el-table td,
.el-table th {
  padding: 2px !important;
  div.row-icons {
    // max-height: 1rem;
    text-align: center;
    img {
      max-height: auto;
      max-width: 1.6rem;
    }
  }
  .list-image {
    img {
      max-height: 2rem;
      max-width: 2rem;
    }
  }
}
.el-table .cell > div.list-image {
  text-overflow: -o-ellipsis-lastline;
  /* overflow: hidden; */
  /* text-overflow: ellipsis; */
  display: table-cell;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
}
</style>


