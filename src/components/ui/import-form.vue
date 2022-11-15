<template>
  <div>
    <div v-if="importPageType === 'norm'">
      <el-row>
      导入类型：
      <el-radio-group v-model="importType">
        <el-radio v-for="(item,index) in formConfig.importType.options" :key="index" :label="item.value">{{item.label}}</el-radio>
      </el-radio-group>
    </el-row>
    <el-row v-show="importType === 'update'">
      显示字段：
      <el-checkbox-group 
        v-model="viewColsValue"
        :min="1">
        <el-checkbox checked v-for="(item,index) in viewCols" :label="item.columns" :key="index">{{item.label}}</el-checkbox>
      </el-checkbox-group>
    </el-row>
    <el-row  v-show="importType === 'update'">
      更新字段：
      <el-checkbox-group 
      v-model="updateColsValue"
      :min="1">
      <el-checkbox checked v-for="(item,index) in updateCols" :label="item.columns" :key="index">{{item.label}}</el-checkbox>
    </el-checkbox-group>
    </el-row>
    <el-row style="border:1px solid darkgray; padding: 5px; ">



      <el-upload :headers="getHeaders()" class="upload-demo" :action="uploadFileUrl" :with-credentials="true" :file-list="fileLists" :data="uploadParams" :on-success="handleSuccess" :on-error="handleError">
        <el-button size="small" type="primary" style="text-align: right">
          选择上传文件
        </el-button>

        <div slot="tip" class="el-upload__tip">{{fileDesc}}</div>
      </el-upload>
    </el-row>
    <el-row style="margin-top: 10px;text-align:left; ">
      <el-button type="text" style="color:red" @click="downloadImportFail">{{message}}</el-button>
    </el-row>
    <el-row style="margin-top: 10px;text-align: center; ">
      <el-button size="small" type="primary" @click="onImportExcelClose">
        关闭
      </el-button>

      <el-button  v-show="importType === 'add'" size="small" type="primary" @click="onDownloadImportTemplate">
        下载导入模板
      </el-button>
      <el-button v-show="importType === 'update'" size="small" type="primary" @click="onDownloadUpdateImportTemplate">
        下载更新导入模板
      </el-button>
    </el-row>
    </div>
    <div v-else-if="importPageType === 'customize'">
      <el-row style="border:1px solid darkgray; padding: 5px; ">
      <el-upload :headers="getHeaders()" class="upload-demo" :action="uploadFileUrl" :with-credentials="true" :file-list="fileLists" :data="uploadParams" :on-success="handleSuccess" :on-error="handleError">
        <el-button size="small" type="primary" style="text-align: right">
          选择上传文件
        </el-button>
        <div slot="tip" class="el-upload__tip">{{fileDesc}}</div>
      </el-upload>
    </el-row>
    </div>
    
  </div>
</template>


<script>
// ,{
//             label:"更新",
//             value:"update"
//           }
export default {
  props: {
    service: {
      type: String
    },
    button:{
      type:Object,
      default(){
        return null
      }
    },
    importPageType:{
      type:String,
      default(){
        return 'norm'   //  norm  标准  ||  customize
      }
    }
  },
  data() {
    return {
      message: "",
      field: null,
      uploadFile: this.serviceApi().importExcel + "/" + this.service,
      fileLists: [],
      fileDesc: "请上传文件,大小不超过20MB",
      updateSrvV2:null,
      v2Cols:null,
      importType:"add",  //add or update
      updateCols:[],
      updateColsValue:[],
      viewCols:[],
      viewColsValue:[],
      formConfig:{
        importType:{
          value:"add",
          options:[{
            label:"新增",
            value:"add"
          }]
        }
      },
      b:Boolean
    };
  },

  created: function() {
    var page_route=this.$route.path;
    page_route.star
    if(page_route&&page_route.startsWith("/listproc/")){

         this.formConfig.importType.options.splice(1);
    }
    let self = this
    if(self.importPageType !== 'customize'){
      this.loadColsV2(this.updateService, 'update').then(response => {
        if (response && response.data && response.data.data ) {
          console.log(response.data.data)
          this.updateSrvV2 = response.data.data
          this.v2Cols = this.updateSrvV2.srv_cols
          this.v2Cols.forEach((item) =>{
            item._moreConfig = item.more_config ? JSON.parse(item.more_config) : null
            if(item.more_config && item._moreConfig.hasOwnProperty("updateTmpl") && item._moreConfig.updateTmpl.hasOwnProperty('updateCol')){
              item._updateConfig  = 'updateCol'
              self.updateCols.push(item)
            }else if(item.more_config && item._moreConfig.hasOwnProperty("updateTmpl") && item._moreConfig.updateTmpl.hasOwnProperty('viewCol')){
              item._updateConfig  = 'viewCol'
              self.viewCols.push(item)
            }
          })
        } else {
          
        }
      })
    }else{
      self.importType = 'customize'
    }
    
  },

  computed: {
    uploadParams: function() {
      return {
        serviceName: this.service
      };
    },
    updateService:function(){
       if(this.button && this.button.hasOwnProperty("update_service_name")){
         return this.button.update_service_name
       }
    },
    uploadFileUrl:function(){
      let self = this
      let url = self.serviceApi().importExcel + "/" + self.service
      if(self.importType === 'update'){
          url = self.serviceApi().importExcel + "/" + self.button.update_service_name + '?importType=update'
         
      }else if(self.importType === 'customize'){
          url = self.serviceApi().importExcel + "/" + self.service + '?importType=customize'
      }
       return url
    }
  },

  methods: {
    getHeaders() {
      let bx_auth_ticket = sessionStorage.getItem("bx_auth_ticket");
      return {
        bx_auth_ticket: bx_auth_ticket
      };
    },

    onDownloadImportTemplate(){
      let url = window.backendIpAddr + "/" + this.resolveDefaultSrvApp() +  "/downloadTemplate/excel/"  + this.service + '?bx_auth_ticket=' + sessionStorage.getItem('bx_auth_ticket') ;
      window.open(url);
    },
    onDownloadUpdateImportTemplate(e){
       let url = this.service_api.downloadTemplate + this.updateSrvV2.service_name + '?tmplType=dynamic' + '&bx_auth_ticket=' + sessionStorage.getItem('bx_auth_ticket') 
       let params = ""
       let paramsUpdateCols = this.updateColsValue.join(',')
       let paramsViewCols = this.viewColsValue.join(',')
       if(paramsUpdateCols){
          params  += ('&updateCols=' + paramsUpdateCols)
       }
       if(paramsViewCols){
         params  += ('&viewCols=' + paramsViewCols)
       }
       url += params
       console.log(url)
       window.open(url)
    },
    onImportExcelClose() {
      this.$emit("close");
    },

    handleSuccess(response, file, fileList) {
      let state = response.state;
      let resultMessage = response.resultMessage;
      if (state == "SUCCESS") {
        this.$message.success("导入文件保存成功");
        this.message = "";
      } else {
        this.fileLists = _.remove(
          this.fileLists,
          item => item.name === file.name
        );
        this.$message.error(resultMessage);
        this.message = resultMessage + "--点击下载错误文件";
      }
    },
    downloadImportFail() {
      this.downloadFailimport();
    },
    handleError(error, file, fileList) {
      this.$message.error("导入文件失败！");
    },
    
  }
};
</script>
<style scoped>
  .el-row{
    padding:10px;
  }
</style>

