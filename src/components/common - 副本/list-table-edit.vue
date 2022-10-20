<template>
  <div v-show="evalVisible()">
    <div class="table-list-row">
      <div>
        <el-row type="flex" class="row-bg" justify="center">
          <el-table :data="gridDataRun" stripe border style="width: 100%" :row-class-name="tableRowClassName" row-key="id" highlight-current-row @selection-change="handleSelectionChange" @filter-change="filterChange" @row-dblclick="onRowDbClicked"
           :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
          >

            <!-- v-if="(item.show && (!item.evalVisible || item.evalVisible()))" ---↓-->
            <el-table-column v-for="(item, index) in gridHeader" :key="index" header-align="left" v-if="getGridHeaderDispExps(item,listMainFormDatas)" :width="item.width ? item.width : getListShowFileList(item) ? item.list_min_width ? item.list_min_width : 180 : ''" :filter-method="item.filters ? filterHandler : null" :prop="item.column" :align="item.align" :fixed="item.rowFixed ? true : null" :show-overflow-tooltip="getListShowFileList(item) === true ? false : true" :label="item.label" :min-width="item.list_min_width + 'px'" :filters="item.filters" :column-key="item.column" >
              <template slot-scope="scope">
                <div v-if="isInplaceEdit()  && findEditField(scope.row, item.column)" class="is-InplaceEdit">
                  <!-- <raw-field-editor :field="findEditField(scope.row, item.column)"
                          @field-value-changed="onCellValueChanged(scope.row, item.column)"
                          @blur="onCellBlur(scope.row, item.column)">
                    </raw-field-editor> -->
                  {{formatValue(scope.row, item)}}
                </div>
                <div v-else-if="item.col_type === 'progress'">
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

                <!-- <div v-else-if="item.col_type === 'FileList'">
                    <upload-file :field="wrapCellIntoField(item.column, scope.row[item.column])"></upload-file>
                  </div> 1116隐藏-->
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

            <el-table-column label="操作" header-align="left" width="240" fixed="right" v-if="!readOnly && listType!='selectlist' && !hideButtons&&sortedRowButtons.length>0">
              <template slot-scope="scope">
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
              </template>
            </el-table-column>

          </el-table>

        </el-row>

      </div>

    </div>
    
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

import RawFieldEditor from "./raw-field-editor.vue"; // 表单元件
import InlineList from "./inline-list.vue"; // 废弃
import ImportDialog from "../ui/import-form.vue"; // 导入ui
import UploadFile from "../ui/upload-file.vue"; // 上传文件
import PopupMemList from "./popup-mem-list"; // 弹出内存列表
import exportLayout from "./export-layout"; // 自定义导出 || 导入
import batchApprove from "../ui/batch-approve.vue"; // 流程审批
// import batchApprove from "../ui/batch-approve.vue";   // 流程审批
import pdf from "vue-pdf";
import CMapReaderFactory from "vue-pdf/src/CMapReaderFactory.js";

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
    update: () => import("./update.vue"),
    Add: () => import("./add.vue"),
    batchApprove
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
    ListMixin
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
      imagesRun: [],
      tableInitalData:[{
          "id":0,
          "seq":"一",
          "dev_dict":"直接费",
          "child":[
              {
                "id":1,
              "seq":"1",
              "dev_dict":"直接费"
              },{
                "id":2,
              "seq":"2",
              "dev_dict":"人工费"
              },{
                "id":3,
              "seq":"3",
              "dev_dict":"材料费"
              },{
                "id":4,
              "seq":"4",
              "dev_dict":"机械费"
              },{
                "id":5,
              "seq":"5",
              "dev_dict":"分包费"
              }
            ]
          },{
            "id":6,
          "seq":"二",
          "dev_dict":"其他直接费",
          "child":[
              {
                "id":7,
              "seq":"1",
              "dev_dict":"承包商临时设施费"
              },{
                "id":8,
              "seq":"2",
              "dev_dict":"提供给业主/监理的服务"
              },{
                "id":9,
              "seq":"3",
              "dev_dict":"调遣费"
              },{
                "id":10,
              "seq":"4",
              "dev_dict":"试验检测费"
              },{
                "id":11,
              "seq":"5",
              "dev_dict":"HSE专项经费"
              }
            ]
        }],
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


