/* */
<template>
  <div>
    <editor v-model="field.model" ref='ace' @init="editorInit"
            theme="chrome"
            :lang="lang" :width="width" :height="height"
            :options="options"></editor>
  </div>
</template>

<script>
  export default {
      name: "CodeEditor",
      components: {
        editor: () =>  import(/* webpackChunkName: "ace" */'vue2-ace-editor'),
      },

      props: {
        field: {
          type: Object,
          default: null,
        },

        width: {
          type: String,
          default: "100%",
        },

        height: {
          type: Number,
          default: 130,
        },

        lang: {
          type: String,
        }


      },

      data() {
        return {
          options: {
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: true,
            fontFamily: "consolas",
            fontSize: "15pt"
          }
        };
      }
      ,
      methods: {

        supportAutoFormat() {
          return this.lang === "json";
        },

        formatCode() {
          let editor = this.$refs.ace.editor
          let val = editor.session.getValue();
          if (this.lang === "json") {
            let o = JSON.parse(val);
            return JSON.stringify(o, null, '\t');
          } else {
            throw  "not supported"
          }
        },

        editorInit(editor) {
          const language_tools =  import(/* webpackChunkName: "ace" */'brace/ext/language_tools')
          const html =  import(/* webpackChunkName: "ace" */'brace/mode/html')
          const javascript =  import(/* webpackChunkName: "ace" */'brace/mode/javascript')
          const json =  import(/* webpackChunkName: "ace" */'brace/mode/json')
          const mysql =  import(/* webpackChunkName: "ace" */'brace/mode/mysql')
          const chrome =  import(/* webpackChunkName: "ace" */'brace/theme/chrome')

          // add command to auto format code
          let vm = this;
          editor.commands.addCommand({
            name: "prettify",
            bindKey: {win: "Ctrl-Alt-l", mac: "Command-Alt-l"},
            exec: function (editor) {
              try {
                if (vm.supportAutoFormat()) {
                  editor.session.setValue(vm.formatCode());
                }

              } catch (e) {
                
              }
            }
          })

          // TODO: if need editable be reactive watch the evalEditable and sync
          editor.setReadOnly(!this.field.evalEditable())

          // automatic adjust height when ace content changed
          let ace = this.$refs.ace;
          let initHeight = this.height;
          var heightUpdateFunction = function () {
            let newHeight =
              editor.getSession().getScreenLength()
              * editor.renderer.lineHeight
              + editor.renderer.scrollBar.getWidth();

            newHeight = Math.min(Math.max(newHeight, initHeight), 500);

            (ace.$el).style.height = (newHeight.toString() + "px");

            // This call is required for the editor to fix all of
            // its inner structure for adapting to a change in size
            editor.resize();
          };

          // Set initial size to match initial content
          heightUpdateFunction();

          // Whenever a change happens inside the ACE editor, update
          // the size again
          editor.getSession().on('change', heightUpdateFunction);

        }
      }
      ,

      created: function () {
        this.field.model = this.field.model || "";
      }
      ,


      mounted: function () {
      }
  }
  ;
</script>

