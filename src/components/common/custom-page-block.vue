<template>
  <div style="border: 1px solid darkgrey; margin: 5px" >
    <component v-if="!!inputPropsObject" v-bind:is="componentType"
               v-bind="inputPropsObject"
    >
    </component>

  </div>



</template>

<script>
  import SimpleAdd from "./simple-add";
  import SimpleDetail from "./simple-detail";
  import List from "./list";
  import HtmlViewer from "../ui/html-viewer";
  import Treegrid from "./treegrid";
  import QueryChart from "../../pages/query-chart";
  import SimpleUpdate from "./simple-update";

  export default {
    name: "custom-page-block",
    components: {
      SimpleUpdate,
      QueryChart,
      Treegrid,
      HtmlViewer,
      List,
      SimpleDetail,
      SimpleAdd
    },
    props: {
      componentType: {
        type: String
      },

      inputProps: {
        type: String,
        default: null,
      },

      dataSelectService: {
        type: String,
        default: null,
      }
    },

    computed: {},

    data() {
      return {
        inputPropsObject: null,
      }
    },


    created: function () {

      // test data !!!!!!!!!
      let defaultUser = {user_no: "songxm"}
      let user = top.user || defaultUser

      // if there is data_service, invoke it
      if (this.dataSelectService) {
        let templ = this.toTemplateString(this.dataSelectService);
        let json = this.parseJson(eval(templ));
        let data = {}
        this.select(json.serviceName, json.condition)
          .then((response) => {
            if (response && response.data && response.data.data) {
              data = response.data.data;
            }

            // eval inputProps template string to object,
            let templ = this.toTemplateString(this.inputProps)
            this.inputPropsObject = this.parseJson(eval(templ))
          })

      } else {

        // eval inputProps template string to object,
        let templ = this.toTemplateString(this.inputProps)
        this.inputPropsObject = this.parseJson(eval(templ))
      }
    }


  }
</script>

<style scoped>

</style>