<template>
  <div>
    <template v-if="isEdit === false" padding="10px">
      <ul class="form-imgs">
        <li v-for="(o, index) in fileLists" :key="index" class="imgs-item">
          <div v-on:click="imageDialogUrl=o.url;imageDialog = true"><img
                  :src="o.url" min-width="70" height="70"/></div>
        </li>
      </ul>
    </template>
    <el-dialog title="图片预览" :visible.sync="imageDialog" width="60%" height="65%"
               style="text-align: center;">
      <img :src="imageDialogUrl" width="80%" height="70%"
           style="margin: 0 auto"/><br>
      <el-button type="primary" @click="imageDialog = false">确 定</el-button>
      <el-button type="primary" @click="dowmlaodUrl()">下载</el-button>

    </el-dialog>
    <el-upload v-if="isEdit"
               class="upload-demo"
               :action="uploadFile"
               :with-credentials="true"
               :headers="getHeaders()"
               :on-preview="handlePreview"
               :before-remove="beforeRemove"
               :before-upload="beforeAvatarUpload"
               :on-remove="handleRemove"
               :on-success="handleSuccess"
               :file-list="fileLists"
               :data="uploadParams"
               clearable
               :disabled="!field.info.editable"
               list-type="picture-card">
      <el-button size="small" type="primary">点击上传</el-button>
      <div slot="tip" class="el-upload__tip">{{fileDesc}}</div>
    </el-upload>
  </div>

</template>
<script>
  import {FieldInfo} from '../model/FieldInfo'
  import {Field} from '../model/Field'


  export default {
    props: {
      field: {
        type: Object,
        default: null,
      },

      // $srvApp: {
      //   type: String,
      //   default: "file",
      // },
    },
    data() {
      return {
        fileLists: [],
        fileDesc: this.field.info.moreConfig &&  this.field.info.moreConfig !== null && this.field.info.moreConfig.fileMaxSize ?  '请上传jpg/png/svg格式的图片,大小不超过' + this.field.info.moreConfig.fileMaxSize +'MB' : '请上传jpg/png/svg格式的图片,大小不超过2Mb',
        fileType: 'jpg/png/svg',
        fileSize: this.field.info.moreConfig &&  this.field.info.moreConfig !== null && this.field.info.moreConfig.fileMaxSize ? this.field.info.moreConfig.fileMaxSize * 1024 : 2 * 1024,
        imageDialog: false,
        imageDialogUrl: '',
        uploadFile: this.serviceApi().uploadFile,
        uploadParams: {
          serviceName: "srv_bxfile_service",
          interfaceName: "add",
          app_no: this.resolveDefaultSrvApp(),
          table_name:"",
          thumbnailType:"fwsu_100",
          columns:""
        },
        isEdit: true
      }
    },
    created: function () {
      // 获取数据，
      this.getData()
    },
    methods: {
      getHeaders() {
        let bx_auth_ticket = sessionStorage.getItem("bx_auth_ticket");
        return {
          bx_auth_ticket: bx_auth_ticket
        };
      },

      getData() {
        this.uploadParams.table_name=this.field.info.srvCol.table_name;
        this.uploadParams.columns=this.field.info.srvCol.columns;

  
       
        this.fileLists = []//初始化文件列表
        if (this.field.fileDesc != null) {
          this.fileDesc = this.field.fileDesc
        }
        if (this.field.fileSize != null) {
          this.fileSize = this.field.fileSize
        }
        if (this.field.fileType != null) {
          this.fileType = this.field.fileType
        }
        if (this.field.info.editable) {//判断是否是编辑
          this.isEdit = true
          if (this.field.model != null) {//如果有file_no则查询出相关的图片信息
            this.uploadParams.file_no = this.field.model
            this.queryData()
          }
        } else {
          this.isEdit = false
          this.queryData()
        }
      },
      queryData() {
        this.selectFileList(this.field.model)
          .then(response => {
            for (let i in response.body.data) {
              let file = response.body.data[i]
              file.name = response.body.data[i].src_name
              file.url = this.serviceApi().downloadFile + response.body.data[i].fileurl
              this.fileLists.push(file)
            }
          })
      },
      beforeAvatarUpload(file) {
        if (file.size / 1024 > this.fileSize) {
          this.$message.error('文件大小不能超过' + this.fileSize + 'kb');
          return false
        }
        let flag = false
        for (let i in this.fileType.split('/')) {
          if (file.name.split('.')[1] === this.fileType.split('/')[i]) {
            flag = true
            break
          }
        }
        if (!flag) {
          this.$message.error('只能上传' + this.fileType + '文件!');
          return false
        }
      },
      handleRemove(file, fileList) {

      },
      handlePreview(file) {
        if (file.url == null) {
          //如果是新上传的文件需要获取url
          file.url = this.serviceApi().downloadFile + file.response.fileurl
        }
        window.open(file.url)

      },
      async beforeRemove(file, fileList) {
        if (file && file.status === "success") {
          //删除
          let fileurl
          if (file.response) {
            fileurl = file.response.fileurl
          } else {
            fileurl = file.url.split('filePath=')[1]
          }
          let params = {
            fileurl: fileurl
          }
          const response = await this.deleteFile(params)
          if (response && response.body.resultCode === 'SUCCESS') {
            this.$message.info(response.body.state)
            return true
          } else {
            this.$message.info(response.body.state)
            return false
          }
        }
      },
      handleSuccess(response, file, fileList) {
        if (response.state === undefined) {
          this.$message.info('上传成功！')
          this.uploadParams.file_no = response.file_no
          this.field.model = response.file_no
        } else {
          this.$message.error('上传失败！');
          this.fileLists.splice(this.fileLists.length - 1, 1)
        }
      },

      setSrvVal(srvVal) {
        this.field.model = srvVal;
        this.getData();
      },

      getSrvVal() {
        return this.field.model
      },
      dowmlaodUrl() {
        window.open(this.imageDialogUrl)
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  .el-table th {
    text-align: center;
  }

  .el-table tbody tr td:first-child {
    text-align: center;
  }
 .form-imgs{
   padding: 0;
 }
</style>
