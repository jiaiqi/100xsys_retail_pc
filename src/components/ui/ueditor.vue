/* */
<template>
  <div>
    <div v-if="field.info.editable"
         :id="eleId" type="text/plain">
    </div>
    <div class="item-note-view" style="border-radius: 4px; border:1px solid #dcdfe6; overflow: auto"
         v-else
         v-html="field.model"></div>
  </div>
</template>

<script>
  // noinspection ES6UnusedImports, needed by ueditor.all.js
  import jQuery from 'jQuery';
  export default {
    props: {
      field: {
        type: Object,
        default: null,
      },


    },
    data() {
      return {
        selected: null,
        ue: null,
        eleId: null,
      };
    }
    ,
    methods: {
      setSrvVal(srvVal) {
        if (this.ue) {
          srvVal = srvVal || "";
          this.ue.setContent(srvVal);
        } else {
          this.field.model = srvVal;
        }
      }
      ,

      getSrvVal() {
        return this.field.model;
      }
      ,

      async initUeditor() {
       const config = await import( "../../../public/ueditor/ueditor.config.js");
        const all = await import("../../../public/ueditor/ueditor.all.js");
        const parser = await import ("../../../public/ueditor/ueditor.parse.js");

        this.ue = UE.getEditor(this.eleId, {
          // BaseUrl: "/",
          UEDITOR_HOME_URL: "ueditor/",
          toolbars: [[
            'fullscreen', 'source', '|', 'undo', 'redo', '|','bold', 'italic', 'underline', 'removeformat',  'autotypeset', 'blockquote', '|', 'forecolor', 'insertorderedlist', 'insertunorderedlist', 'lineheight', '|','paragraph', 'fontfamily', 'fontsize', '|','justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|', 'link', 'unlink','simpleupload', 'simpleuploadvideo', 'horizontal', 'spechars','inserttable', 'deletetable',  'insertrow', 'deleterow', 'insertcol', 'deletecol', 'mergecells', 'splittocells',  'drafts']],
          theme: "default", //皮肤
          lang: "zh-cn", //语言
          initialFrameHeight: 300,
          scaleEnabled: true, //缩放
          catchRemoteImageEnable: false,
        });
        this.setSrvVal(this.field.model);
        let self = this;
        this.ue.srvApp = this.resolveDefaultSrvApp();
        this.ue.addListener("blur", _ => {
          let currContent = self.ue.getContent();
          if (currContent != self.field.model) {
           
            self.field.model = currContent;
            self.$emit('field-value-changed', this.field.info.name, this.field);
          }
        });
      }
    }
    ,

    created: function () {
      this.eleId = "ueditor" + this._uid;
    }
    ,


    mounted: function () {
      // path config
      window.pathConfig = window.pathConfig || {};
      window.pathConfig.fileServer = this.serviceApi().uploadFile.replace("upload", "");


      setTimeout(_ => {
        if (this.field.info.editable) {
          this.initUeditor();
        }
      });

    }
  }
  ;
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
.item-note-view{
    img{
      width: 100%;
    }
  }
  .el-table th {
    text-align: center;
  }

  .el-table tbody tr td:first-child {
    text-align: center;
  }
</style>
