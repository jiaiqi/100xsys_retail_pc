<template>
  <div>
    <template v-if="isEdit === false">
      <div v-for="(file, index) in moreFileRun" :key="index">
        
        <span  @click="handlePreview(file)" class="file-name">
          
           <i class="el-icon-download"></i> 
          {{file.name}}</span>
        <el-button type="text" class="" @click="onPreView(file,index)">

          <i class="el-icon-picture-outline"></i>
          预览
        </el-button>
        
      </div>
      <viewer v-show="false" :images="imagesRun" ref="viewer"  clsss="image-list">
          
          <img style="height:1rem;width:1rem;" :class="'image-'+ src.id" @error="onerror" @load="onerror(src.url)" :src="src.url"  v-for="(src,index) in imagesRun" :key="index">
        </viewer> 
    </template> 
 
    <!-- <el-upload v-if="isEdit"
               class="upload-demo"
               ref="upload"
               :action="uploadFile"
               :with-credentials="true"
               :multiple="true"
               :headers="getHeaders()"
               :on-preview="handlePreview"
               :before-remove="beforeRemove"
               :before-upload="beforeAvatarUpload"
               :on-remove="handleRemove"
               :on-success="handleSuccess"
               :on-change="fileChange"
               :file-list="fileLists"
               :data="uploadParamsRun"
               :disabled="!field.info.editable"
    > -->
    <el-upload v-if="isEdit"
               class="upload-demo"
               ref="upload"
               :action="uploadFile"
               :with-credentials="true"
               :multiple="true"
               :headers="getHeaders()"
               :on-preview="handlePreview"
               :before-remove="beforeRemove"
               :before-upload="beforeAvatarUpload"
               :on-remove="handleRemove"
               :on-success="handleSuccess"
               :on-change="fileChange"
               :data="uploadParamsRun"
               :auto-upload="true"
               :file-list="fileLists"
               :disabled="!field.info.editable"
    >
     <viewer v-show="false" :images="imagesRun" ref="viewer"  clsss="image-list">
          
          <img style="height:1rem;width:1rem;" :class="'image-'+ src.id" @error="onerror" @load="onerror(src.url)" :src="src.url"  v-for="(src,index) in imagesRun" :key="index">
        </viewer> 
      <el-button size="small" type="primary">点击上传</el-button>
      <!-- <el-button style="margin-left: 10px;" size="small" type="success" @click="requestUploadFile">上传到服务器</el-button> -->
      <div slot="tip" class="el-upload__tip">{{fileDesc}}</div>
    </el-upload>
    <el-dialog
      custom-class="preview-dialog"
      :title="currentType === 'pdf' ? '第'+currentPage+'页/共'+pageCount+'页' : '预览'"
      :visible.sync="centerDialogVisible"
      width="50%"
      lock-scroll
      center>
      
        <el-row type="flex" align="middle" v-if="currentType === 'pdf'">
          <el-col :span="2" class="grid-content">
            <el-button icon="el-icon-arrow-left" circle :disabled="currentPage === 1" @click="changePdfPage('up')"></el-button></el-col>
          <el-col :span="20" style="">
            <div style="text-align:right;display: flex;justify-content: space-between;">
              <el-button icon="el-icon-minus" circle :disabled="scale === 10" @click="scaleX"></el-button>
              <span>当前比例：{{scale}}%</span>
              <el-button icon="el-icon-plus" circle :disabled="scale === 200" @click="scaleD"></el-button>
            </div>
            <div   style="text-align:center;overflow: auto;border:1px solid #eee;height: 735px;">
              <pdf
                ref="wrapper"
                :src="currentUrl" 
                :page="currentPage"
                @num-pages="pageCount=$event"> 
                </pdf>
                 
              </div>
             
        </el-col>
          <el-col :span="2"  class="grid-content" style="text-align:right;">
            <el-button icon="el-icon-arrow-right" circle :disabled="currentPage === pageCount" @click="changePdfPage('next')"></el-button>
          </el-col>
            
        </el-row>
        
      <!-- <el-image v-else  :src="currentUrl" lazy></el-image> -->
    </el-dialog>
  </div>

</template>
<script>

import pdf from 'vue-pdf'
import CMapReaderFactory from 'vue-pdf/src/CMapReaderFactory.js'
  export default {
    components:{pdf},
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
    computed:{
      imagesRun:function(){
        let self = this
        let list = this.fileLists.length > 0 ? this.fileLists : this.notUploaded
        // if(this.fileLists.length === 0){
        //   list = list.map((item) =>{
        //     if(item.hasOwnProperty('response')){
        //       return Object.assign(item,item.response)
        //     }
        //   })
        // }
        list = list.filter((item) =>{
          if(item.hasOwnProperty('response')){
              item =  Object.assign(item,item.response)
          }
          if(item.file_type === 'png' || item.file_type === 'jpeg'  || item.file_type === 'jpg'  || item.file_type === 'gif'|| item.file_type === 'JPG'){
            let fileUrl = item.hasOwnProperty('url') ? item.url : self.serviceApi().downloadFile + item.response.fileurl
            item.url = fileUrl
            return {
              title:item.name,
              url:fileUrl,
              type:item.file_type
            }
          }
        })
        return list
      },
      isMultiple:function(){
         if(this.uploadParams.hasOwnProperty('file_no') && this.uploadParams.file_no){
           return true
         }else{
            return false
         }
          
      },
      moreFileRun:function(){
        let list = this.fileLists
        list = list.filter((item) =>{
          return item
        })
        return list
      },
      uploadParamsRun: {
          get:function(){
              let self = this
              if((!self.uploadParams.hasOwnProperty('file_no') || self.uploadParams.hasOwnProperty('file_no')) && !self.uploadParams.file_no){
                self.uploadParams.file_no = self.GenNonDuplicateID('batchno_')   // 
              }
              return this.uploadParams
          },
          set:function(v){
              this.uploadParams[v.key] = v.value
          }
        }
    },
    data() {
      return {
        fileLists: [],
        notUploaded:[],
        initialViewIndex:3,
        upLen:0,
        uploadFile: this.serviceApi().uploadFile,
        fileDesc: this.field.info.moreConfig &&  this.field.info.moreConfig !== null && this.field.info.moreConfig.fileMaxSize ?  '请上传文件,大小不超过' + this.field.info.moreConfig.fileMaxSize +'MB'  : '请上传文件,大小不超过200MB' ,
        fileType: '',
        fileSize: this.field.info.moreConfig &&  this.field.info.moreConfig !== null && this.field.info.moreConfig.fileMaxSize ? this.field.info.moreConfig.fileMaxSize * 1024 : 200 * 1024,
        uploadParams: {
          serviceName: "srv_bxfile_service",
          interfaceName: "add",
          app_no: this.resolveDefaultSrvApp(),
          table_name:"",
          columns:"",
          file_no:"",
        },
        isEdit: true,
        centerDialogVisible: false,  // 是否显示预览
        currentUrl:"",
        currentType:"",
        currentPage:1,
        pageCount: 0,
        scale: 100, //放大系数
        currentUrlLike:'',
      }
    },
    created: function () {
      // 获取数据，
      this.getData()
    },
    methods: {
      onerror(e){
         console.log("显示失败",e)
      },
      inited (viewer) {
        this.$viewer = viewer
      },
      show () {
        this.$viewer.show() 
      },
      getHeaders() {
        let bx_auth_ticket = sessionStorage.getItem("bx_auth_ticket");
        return {
          bx_auth_ticket: bx_auth_ticket
        };
      },
       submitUpload() {
        this.$refs.upload.submit();
      },
       requestUploadFile: function(e){
        let self = this
        let file = e || []
        // this.notUploaded.push(e)
        let files = self.notUploaded
        let fileNo = self.uploadParams.hasOwnProperty('file_no') && this.uploadParams.file_no ? self.uploadParams.file_no : null
        let upLoadFile = function(e){
          let formData = new FormData();
          console.log("requestUploadFile",e.file)
          formData.append('file', e.file);
  　　　　　formData.append('serviceName', "srv_bxfile_service");   // 
  　　　　　formData.append('interfaceName', "add");   // 
  　　　　　formData.append('app_no', self.resolveDefaultSrvApp());   // 
  　　　　　formData.append('table_name', self.field.info.srvCol.table_name);   // 
  　　　　　formData.append('columns', self.field.info.srvCol.columns);   // 
          if(!self.uploadParams.hasOwnProperty('file_no') && !self.uploadParams.file_no){
            formData.append('file_no', self.GenNonDuplicateID(36));   // 
          }
          let url = self.serviceApi().uploadFile;
          let config = {
            headers:{'Content-Type':'multipart/form-data',bx_auth_ticket:sessionStorage.getItem("bx_auth_ticket")}
          };
          return new Promise ((resolve, reject) => {
            self.$http.post(url,formData, config).then((res) => { 
                    // if(!self.uploadParams.hasOwnProperty('file_no')){
                    //   self.uploadParams.file_no = res.data.file_no
                    // }
                    console.log("上传成功",res.data.file_no)
                    resolve(res.data)
                    return res.data
                  },  (err) => {
                    reject(err)
                  })
            })
        }
        // for(let i =0;i<files.length;i++){
        //   self.upLen++
        //   upLoadFile(files[i]).then(res)
        // }
        return  upLoadFile(file)
      },
      onPreView(file,index){
        let self = this
        let fileType = file.hasOwnProperty('file_type') ? file.file_type : file.response. file_type
        if(fileType === 'jpg' || fileType === 'png' || fileType === 'gif' || fileType === 'JPG'){
          // const viewer = self.$el.$viewer
          const viewer2 = self.$el.querySelector('.image-' + file.id)
          //  view.setdefaults
          // const viewer2 = self.$el.querySelector('.image-list')
          let imgIndex = index||0 
          self.imagesRun.forEach((item,i) =>{
            if(item.id == file.id){
              imgIndex = i
            }
          })
          const viewer = self.$refs.viewer.$viewer
          viewer.index = imgIndex
          console.log(viewer,imgIndex,viewer2,self.$refs.viewer)
          viewer.show()
        }else if(fileType === 'pdf' || fileType === 'jpg' || fileType === 'png' || fileType === 'gif' || fileType === 'JPG'){
             if(fileType === 'pdf'){
              //  let link = pdf.createLoadingTask({
              //    url:file.url,
              //    cMapUrl: '../../assets/cmaps/', 
              //    cMapPacked: true
              // //  CMapReaderFactory
              //  })
              // this.currentUrl =  link
              self.handlePreview(file)
             }else{
               this.currentUrl = file.url
               
              this.centerDialogVisible = true
             }
            // this.currentUrl = file.file_type === 'pdf' ? pdf.createLoadingTask({url:file.url,CMapReaderFactory}) : file.url
            this.currentUrlLike = file.url
            this.currentType = fileType
            console.log(file)
        }else{
          this.$message({
            message: '只支持【pdf】/【jpg】/【png】格式预览，其他格式请点击文件名下载查看',
            type: 'warning'
          });
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
          if(this.scale == 100) {
              return;
          }
          this.scale += -5;
          this.$refs.wrapper.$el.style.width = parseInt(this.scale) + "%";
          // this.$refs.wrapper.$el.style.transform = "scale(" + this.scale + ")";
      },
       // 改变PDF页码,val传过来区分上一页下一页的值,0上一页,1下一页
      changePdfPage (type) {
        this.currentPage
        // console.log(val)
        if(type === 'next'){
            if (this.currentPage < this.pageCount) {
            this.currentPage++
            // console.log(this.currentPage)
          }
        }else{
          if (this.currentPage > 1) {
            this.currentPage--
            // console.log(this.currentPage)
          }
        }
        
        
      },
      getData() {

        this.uploadParams.table_name=this.field.info.srvCol.table_name;
        this.uploadParams.columns=this.field.info.srvCol.columns;

        //初始化文件列表
        this.fileLists = []
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
        let self = this
        this.selectFileList(this.field.model).then(response => {
          for (let i in response.body.data) {
            let file = response.body.data[i]
            file.name = response.body.data[i].src_name
            file.url = this.serviceApi().downloadFile + response.body.data[i].fileurl
            this.fileLists.push(file)
            self.$emit("more-info",self.fileLists)
          }
        })
      },

      handleRemove(file, fileList){
        let self = this
        console.log("handleRemove:::",file,fileList)
            if(fileList.length === 0){

              self.field.model = '';
            }
      },

      handlePreview(file) {//点击文件时触发
        console.log('handlePreview',file)

        
        let fileType = file.hasOwnProperty('file_type') ? file.file_type : file.response. file_type
        if(!file.hasOwnProperty('_dl_auth') || (file.hasOwnProperty('_dl_auth') && file['_dl_auth'])){
          if (file.url == null) {//如果是新上传的文件需要获取url
            file.url = this.serviceApi().downloadFile + file.response.fileurl
          }

          if (file.url.toLowerCase().endsWith(".pdf")) {
            let currLocation = window.location.href;
            let hashIndex = currLocation.indexOf("#");
            if (hashIndex > 0) {
              let pdfPreviewUrl = currLocation.substring(0, hashIndex) + "#/viewpdf?pdfsrc=" + encodeURIComponent(file.url)
              this.addTabByUrl(pdfPreviewUrl, "文件预览")
              return;
            }
          }else if(fileType === 'jpg' || fileType === 'png' || fileType === 'gif' || fileType === 'JPG'){
              let fileData = null
              if(file.hasOwnProperty('response')){
                fileData = Object.assign(file,file.response)
              }else{
                fileData = file
              }
              this.onPreView(fileData)
          }else{
            this.download(file.url,file.name)
          }
        }else{
          this.$alert('您无权限下载，请确认后重试！', '提示', {
              confirmButtonText: '确定'
          });
        }
        

        // window.open(file.url)

        
      },


      beforeAvatarUpload(file) {
        if(this.getFileUniqueOnColName(file)){
            if (file.size / 1024 > this.fileSize) {
            this.$message.error('文件大小不能超过' + this.fileSize + 'kb');
            return false
          }
          if (this.fileType != '') {//默认支持所有类型上传
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
          }
        }else{
          this.$message.error('不能上传重复文件');
          return false
        }
        
        
      },
      fileChange(file, fileList){
        console.log("fileChange:::",file,fileList)
        if(fileList.length > 0){
          this.notUploaded = fileList.filter( item => !item.hasOwnProperty('file_no'))
        }
		this.fileLists = fileList
      },
      async beforeRemove(file, fileList) {
        let self = this
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
        let self = this
        if (response.state === undefined) {
          this.$message.info('上传成功！')
          self.uploadParams.file_no = response.file_no
          self.$set(self.uploadParams,'file_no',response.file_no)
          
          this.uploadParamsRun = {
            key:"file_no",
            value:response.file_no
          }
          this.field.model = response.file_no

          console.log('fileList',fileList,this.uploadParams.file_no)
          // self.setSrvVal(response.file_no)
          self.$emit("more-info",self.fileLists)
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
      getFileUniqueOnColName(e){
        console.log("e",e)
        if(this.field.info.moreConfig && this.field.info.moreConfig.hasOwnProperty('fileUniqueOnColName')){
            let cols = this.field.info.moreConfig.fileUniqueOnColName
            let fields = this.field.form.allFields
            let isUnique = true
            if(cols.length > 0){
              for(let i in cols){
                let colName = cols[i]
                let moreInfo = fields[colName].moreInfo
                if(moreInfo){
                  for(let j = 0;j<moreInfo.length;j++){
                    if(e.name === moreInfo[j].name){
                      isUnique =  false
                    }
                  }
                }
              }
            }

            return isUnique
            console.log("cols",cols,fields)
        }else{
          return true
        }
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
  .file-name{
    color:#333;
    border-bottom: 1px solid rgb(25, 119, 243);
  }
  .el-upload-list{
    border: 1px solid #DCDFE6!important;
  }
  .preview-dialog .el-dialog__body {
    text-align: initial;
    padding: 5px 5px 5px!important;
}

</style>
<style>
.image-list > img{
  height: 5rem;
  width: 5rem!important;
}
</style>
