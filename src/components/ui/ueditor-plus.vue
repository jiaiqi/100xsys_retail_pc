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
          UEDITOR_HOME_URL: "ueditor/",
          theme:'om',
          imagePopup:false,   //"source"
          toolbars: [["simpleupload", "simpleuploadvideo", "insertlink", "bold", "removeformat", "undo", "redo", "preview","fullscreen"]],
          labelMap: {
            "simpleupload": "插入图片",
            "simpleuploadvideo": "插入视频",
            "inserturl": "插入超链接",
            "bold": "加粗",
            "h1": "一级标题",
            "h2": "二级标题",
            "summary": "摘要",
            "conclusion": "结语",
            "removeformat": "清除格式",
            "om-paragraphcheck": "段落检查",
            "undo": "撤销",
            "redo": "重做",
            "fullscreen": "全屏",
            "showmsg":"消息",
            "preview":"预览",
          },
          autoHeightEnabled:true,
          enableContextMenu: false,
          elementPathEnabled:false,
          wordCount:false,
          scaleEnabled:false,
          retainOnlyLabelPasted: true,
          pasteplain:false,
          filterTxtRules: function() {
                function e(e) {
                    e.tagName = "p", e.attrs = {}, e.setStyle()
                }
                return {
                    "-": "script style object iframe embed input select table noscript",
                    img: function(e) {
                        var t = e.getAttr("src") || e.getAttr("data-src") || "",
                            n = e.getAttr("desc") || "",
                            i = e.getAttr("class") || "",
                            o = e.getAttr("style") || "";
                        /^(http\:|https\:)*\/\//.test(t) ? (e.attrs = {
                            src: t,
                            desc: n,
                            class: i,
                            style: o
                        }, e.setStyle()) : e.parentNode.removeChild(e)
                    },
                    p: function(e) {
                        "pgc-img-caption" == e.getAttr("class") && "请输入图片描述" == e.innerText() ? e.parentNode.removeChild(e) : (e.attrs = {}, e.setStyle())
                    },
                    a: 0,
                    div: e,
                    strong: {
                        $: {}
                    },
                    ul: e,
                    ol: e,
                    li: e,
                    blockquote: e,
                    caption: e,
                    code: e,
                    h1: e,
                    h2: e,
                    h3: e,
                    h4: e,
                    h5: e,
                    h6: e,
                    br: e
                }
            }(),
          lang: "zh-cn", //语言
          initialFrameHeight: 300,
          catchRemoteImageEnable: false, //远程抓图
        });
        this.setSrvVal(this.field.model);
        let self = this;
        this.ue.srvApp = this.resolveDefaultSrvApp();
        this.ue.addListener("blur", _ => {
          let currContent = self.ue.getContent();
          if (currContent != self.field.model) {
            console.info("ueditor blur event");
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
