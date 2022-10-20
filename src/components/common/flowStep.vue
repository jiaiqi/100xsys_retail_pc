<template>
  <div>
    <div>
       <div id="myChart" :style="{width: '100%', height:processTempl.height==0?140 + 60 +  'px':processTempl.height + 60 + 'px'}"></div>
       <!-- <div id="myChart" :style="{width: '100%', height:processTempl.height==0?140+'px':processTempl.height +'px',}"></div> -->
    </div>
   
    <el-row v-if="stepDataRun !== null " style="border:1px solid rgb(200, 229, 245);padding:10px;font-size: 18px;
    font-weight: bold;">
      <el-col>
        <i type="primary" class="el-icon-caret-right"></i>
        <!-- <span style="font-size:18px;">选中节点：</span> -->
        <!-- <el-tag :type="iconStateRun" size="medium">{{stepDataRun.step_name}}</el-tag> -->
        <span :class="'text-'+iconStateRun">{{stepDataRun.step_name}} - {{stepDataRun.state}}</span>
        <!-- <el-tag :type="iconStateRun" size="medium">{{stepDataRun.step_name}}[{{stepDataRun.state}}]</el-tag> -->
        </el-col>
      <el-col><i class="el-icon-caret-right"></i>{{textRun}}：{{stepDataRun._approval_user}}</el-col>
      <el-col v-if="stepDataRun.info_desc" style="color:rgb(255, 87, 22);font-size:15px;font-weight:0;line-height:18px;"><i class="el-icon-warning"></i>操作说明：{{stepDataRun.info_desc}}</el-col>
      <!-- <el-col v-if="stepDataRun.state === '已处理'"><i class="el-icon-caret-right"></i>{{`处理时间`}}：{{stepDataRun._record_data ? stepDataRun._record_data.create_time : ''}}</el-col> -->
    </el-row>
  </div>

</template>

<script>


import echarts from 'echarts'

import iconReturn from "../../assets/return.png"


var myChart = null
export default {
  data() {
    return {
      echarts: null,
      processedColor: "#67c23a", //已处理颜色
      processingColor: "#409eff", //正在处理的颜色
      unprocessedColor: "#c0c4cc", //未处理的颜色
      notReadyColor: "#e6e052", //未就绪的处理颜色
      handStepColor: "#d42828", //未就绪的处理颜色
      rejectStepColor: "#f30505", //未就绪的处理颜色
      returnStepColor: "#e85f3a", //退回处理颜色
      clickStepName: "",
      // x_space: 500,
      x_space: 120,
      y_sapce: 0,
      cloneData: [],
      data: [],
      links: [],
      node_info_desc: {},
      onStopData:null,
      stateIcon:{
        return:""
      },
    };
  },
  props: {
    stepData: {
      type: Array,
      default: function() {
        return [];
      }
    },
    processTempl: {
      type: Object,
      default: function() {
        return {};
      }
    },
    proc_status:{
      type: String,
      default: null

    },
    activatStepNo:{
      type: String,
      default: null
    },
    showNostartStep:{
      type:Boolean,
      default(){
        return true
      }
    }
  },
  created() {
    if(this.proc_status=='关闭'){
      
      this.processedColor="#c0c4cc"; //已处理颜色
     this. processingColor="#c0c4cc"; //正在处理的颜色
     this. unprocessedColor="#c0c4cc"; //未处理的颜色
      this.notReadyColor="#c0c4cc"; //未就绪的处理颜色
      this.handStepColor="#c0c4cc"; //未就绪的处理颜色
      this.rejectStepColor="#c0c4cc"; //未就绪的处理颜色
      this.returnStepColor="#c0c4cc"; //退回处理颜色
    }
    this.initStepData();
    this.initLinksData();
    
  },
  computed:{
     textRun:function(){
        let text = '处理人'
        this.cloneData.forEach((item) =>{
          if(item.step_no === this.activatStepNo && item.state == '正在处理'){
            text = '待处理人'
          }
        })
        return text
     },
     stepDataRun:function(){
        let step = null
        step = this.stepData
        step = step.filter((item) =>{
          if(item.step_no === this.activatStepNo){
            return item
          }
        })
        return step[0] ? step[0] : null
     },
     iconStateRun:function(){
      //  success/info/warning/danger
       let state = this.stepDataRun.state
       if(state === '正在处理' || state === '重新处理'){
         return 'action'
       }else if(state === '已处理'){
         return 'success'
       }else if(state === '未就绪'){
         return 'info'
       }
     }

  },
  mounted() {
      // import(/* webpackChunkName: "echarts" */ "echarts").then(resp => {
      //   this.echarts = resp;
      //   this.$nextTick(function(){
          
      //    this.drawLine();
      //   })
      // });
      this.echarts = echarts;
        this.$nextTick(function(){
         myChart = this.echarts.init(document.getElementById("myChart")); 
         this.drawLine();
        })
  },
  methods: {
    initStepData() {
      if (this.processTempl.flow_chart_customize == "是") {
        var nodeDatas = [];
        var linkDatas = [];
        var step_y_position = {};
        var i = 0;
        for (var item of this.stepData) {
          var node = {};
          node.step_no = item["step_no"];
          node.state = item["state"];
          node._record_data = item["_record_data"];
          if (item["info_desc"]) {
            this.node_info_desc[node.step_no] = item["info_desc"];
          } else {
            this.node_info_desc[node.step_no] = "";
          }
          node.step_name = item["step_name"];
          node.name = item["step_no"];
          node.out_step_nos = item["out_step_nos"];

          var x_level = parseInt(item["x_position"]);
          node.x = x_level * this.x_space;
          node.fixed = false
          node.label = {
            offset: [0, 24], // 文字偏移
            // fontSize: 14
          };
          var label = node["label"];
          label["lineOverflow"] = 'truncate'
          // label["borderColor"] = '#000000' 
          // label["borderWidth"] = 1 
           
          let stepNameRun = item.hasOwnProperty('simple_step_name') && item.simple_step_name ? item.simple_step_name : item.step_name
          var y_level = parseInt(item["y_position"]);
          if (y_level == 0) {
            node.y = this.y_sapce;
          } else if (y_level == 1) {
            // node.y = -240;
            node.y = -(this.processTempl.height==0?140:this.processTempl.height)/4;
            // node.y = -50;
          } else if (y_level == -1) {
            node.y = (this.processTempl.height==0?140:this.processTempl.height)/4;
            // node.y = 50;
          } else {
            node.y = this.y_sapce;
          }
          let user_dis = ''
          // if(item.hasOwnProperty('_approval_user') && item["_approval_user"] !== null && item["_approval_user"].length >15){
          //   user_dis = "(" + item["_approval_user"].slice(0,15) + "...)"
          // }else{
          //   user_dis = "(" + item["_approval_user"] + ")"
          // }
          let stateName = []
          let text = item["state"]
          //console.log("==>",text,text.length)
          if(text.length > 3){
            stateName.push(text.substring(0,2))
            stateName.push(text.substring(2,text.length))
            
            label.formatter = [
              "{a|" + stateName[0] + "\n" + stateName[1] + "}",
              "{b|" + stepNameRun + "}"
            ].join("\n");
            label['on_formatter'] = [
              "{a|" + stateName[0] + "\n" + stateName[1] + "}",
              "{b|" + stepNameRun + "}"
            ].join("\n");
            label['off_formatter'] = [
              "{a|" + stateName[0] + "\n" + stateName[1] + "}",
              "{b|" + "▲}"
            ].join("\n");
            // console.log("文字",stateName,label)
          }else{
            label.formatter = [
              "{a|" + item["state"] + "}",
              "{b|" + stepNameRun + "}"
            ].join("\n");
            label['on_formatter'] = [
              "{a|" + item["state"] + "}",
              "{b|" + stepNameRun + "}"
            ].join("\n");

            label['off_formatter'] = [
              "{a|" + item["state"] + "}",
              "{b|" + "▲}"
            ].join("\n");
          }
          if (item["state"] == "已处理") {
            if (
              item._record_data &&
              item._record_data.proc_result == "reject"
            ) {
              label.color = this.rejectStepColor;
              node.itemStyle = { color: this.rejectStepColor };
            } else {
              label.color = this.processedColor;
              node.itemStyle = { color: this.processedColor };
            }
          } else if (item["state"] == "正在处理" || item["state"] == "重新处理") {
            node.itemStyle = { color: this.processingColor };
            label.color = this.processingColor;
            
          } else if (item["state"] == "未就绪") {
            node.itemStyle = { color: this.notReadyColor };
            label.color = this.notReadyColor;
            
          } else {

          if (
              item._record_data &&
              item._record_data.proc_result&&
              item._record_data.proc_result.startsWith("return")
            ) {

               node.itemStyle = { color: this.returnStepColor };
              label.color = this.returnStepColor;
              label.formatter = [
                // "{a|" + item["state"] + "(回退)}",
                "{a|" + "回退}",
                "{b|" + stepNameRun + "}"
              ].join("\n");
              label['on_formatter'] = [
                // "{a|" + item["state"] + "(回退)}",
                "{a|" + "回退}",
                "{b|" + stepNameRun + "}"
              ].join("\n");

              label['off_formatter'] = [
                // "{a|" + item["state"] + "(回退)}",
                "{a|" + "回退}",
                "{b|" + "▲}"
              ].join("\n");
              

            }else{
              node.itemStyle = { color: this.unprocessedColor };
              label.color = this.unprocessedColor;
            }
          }
          label.rich = {
            a: {
                fontSize: 12,
                color: "#ffffff",
                align: "center",
                zIndex:999,
                borderBottom:"1px solid #222222"
            },
            b: {
                height: 52,
                fontSize: 16,
                // color: "#ffffff",
                align: "center",
            }
          };
          if(text.length > 3){
            label.rich.b.height = 40
            
          }else{
            node.label.offset = [0, 29] // 文字偏移
          }
          i++;
          nodeDatas.push(node);
        }
        this.data = nodeDatas;
        this.cloneData = JSON.parse(JSON.stringify(this.data));
      } else {
        //自动设置节点坐标
      }
    },
    initLinksData() {
      var me = this;
      var linkDatas = [];
      for (var item of this.data) {
        var info_desc = item["info_desc"];
        if (item["out_step_nos"] && item["out_step_nos"] != "") {
          var out_step_nos = item["out_step_nos"];

          out_step_nos.forEach(function(value, i) {
            var link = {};
            link.source = item["name"];
            var valueStepMap = me.getStepNameByNo(value);
            link.target = valueStepMap["step_no"];
            if (item.state == "正在处理" || item.state == "未就绪") {
              link.lineStyle = { color: me.unprocessedColor };
            } else if (item.state == "未开始"  ||  item.state == "跳过") {
              link.lineStyle = { color: me.unprocessedColor };
              //link.lineStyle = item["itemStyle"];
            } else if (item.state == "已处理") {
              if (valueStepMap["state"] == "未开始"  ||  item.state == "跳过") {
                link.lineStyle = { color: me.unprocessedColor };
              } else {
                link.lineStyle = { color: me.processedColor };
              }
            }
            // 取消 连线的说明文字 210317
            // link.label = {
            //   show: true,
            //   fontSize: 12,
            //   formatter: [me.node_info_desc[value]].join("\n")
            // };

            linkDatas.push(link);
          });
        }
      }
      this.links = linkDatas;
    },
    setClickColor(clickStep) {
      this.cloneData = JSON.parse(JSON.stringify(this.data));
      for (var item of this.cloneData) {
        if (item.step_no == clickStep) {
          item.itemStyle.color = this.handStepColor;
          node.itemStyle.normal={
                                borderColor: '#04f2a7',
                                borderWidth: 4,
                                shadowBlur: 10,
                                shadowColor: '#04f2a7',
                                color: '#001c43',
                            } 
        }
      }
    },
    getStepNameByNo(step_no) {
      var data = "";
      for (var item of this.stepData) {
        if (item["step_no"] == step_no) {
          data = item;
          break;
        }
      }
      return data;
    },
    updatedChart(e){
      let me = this
      //console.log('updatedChart',me.cloneData)
      let activeStepNo = e || me.activatStepNo
      if(me.proc_status == '完成' && !me.showNostartStep){
          me.cloneData = me.cloneData.filter(item => item.state !== '未开始')  
      }
      me.cloneData = me.cloneData.map((item) =>{
          let style = item.itemStyle
          let rich = item.label.rich
          let label = item.label
          if(item.step_no == activeStepNo){
            if(label.hasOwnProperty('off_formatter')){
                label.formatter = label['off_formatter']
            }
          }else{
            if(label.hasOwnProperty('on_formatter')){
                label.formatter = label['on_formatter']
            }
          }
          if(item.step_no === activeStepNo && item.state !== "未开始" && item.state !== "未就绪"  && item.state !== "跳过"){
            
                style.normal={
                    borderColor: '#409EFF',
                    borderWidth: 4,
                    shadowBlur: 10,
                    shadowColor: '#409EFF',
                    color: '#29732c',
                }
                rich.b.fontSize= 22
                rich.b.fontWeight ="bold"
                rich.b.color ="#0f76e0"  
                
                


                
            }else{
              rich.b.fontSize = 16
              if(rich.b.hasOwnProperty('fontWeight')){

                delete rich.b.fontWeight
              }
              if(rich.b.hasOwnProperty('color')){
                delete rich.b.color 
              }
              if(style.hasOwnProperty('normal')){
                
                  delete style.normal
                  // return item
              }
            } 
            return item
          
        })
        myChart.setOption({
          // title: {
          //     text: "审核流程 ",
          // },
            tooltip: {
              formatter: "{c}"
          },
          animationDurationUpdate: 1500,
          animationEasingUpdate: "quinticInOut",
          series: [{
              type: "graph",
              layout: "none",
              symbolSize: 50,
              roam: false,
              zoom:0.85,
              label: {
                  show: true,
              },
              edgeSymbol: ["circle", "arrow"],
              edgeSymbolSize: [4, 8],
              edgeLabel: {
                  fontSize: 10,
              },
              data: me.cloneData,
              links: me.links,
              lineStyle: {
                  color: "#12b5d0",
                  opacity: 0.9,
                  width: 1,
                  curveness: 0,
                  type: "solid",
              },
              // 图形样式
              itemStyle: {
                  normal: {
                      color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
                              offset: 0,
                              color: "#157eff",
                          },
                          {
                              offset: 1,
                              color: "#35c2ff",
                          },
                      ]),
                  },
              },
          }, ],
      })
    },
    drawLine() {
      var me = this;
      // 基于准备好的dom，初始化echarts实例

      
    
      // let myChart = this.echarts.init(document.getElementById("myChart"));



  
      myChart.on("click", function(params) {
        // me.cloneData = me.cloneData.map((item) =>{
        //   let style = item.itemStyle
        //   if(item.step_no === params.data.step_no && params.data.state !== "未开始" && params.data.state !== "未就绪"){
            
        //     style.normal={
        //                         borderColor: '#04f2a7',
        //                         borderWidth: 4,
        //                         shadowBlur: 10,
        //                         shadowColor: '#04f2a7',
        //                         color: '#001c43',
        //                     }
        //   }else if(style.hasOwnProperty('normal')){
        //       delete style.normal
        //   }
        //   return item
        // })
        if (params.data && params.data.step_no) {
          var paramsData = {};
          paramsData.step_name = params.data.step_name;
          paramsData.step_no = params.data.step_no;
          //console.log(params.data);
          params.data.itemStyle.normal={
                                borderColor: '#04f2a7',
                                borderWidth: 4,
                                shadowBlur: 10,
                                shadowColor: '#04f2a7',
                                color: '#001c43',
                            }


          if (params.data.state != "未开始" && params.data.state != "未就绪" && params.data.state !== "跳过") {
            if (me.clickStepName == "") {
              myChart.dispatchAction({
                type: "highlight",
                name: paramsData.step_name
              });
              me.clickStepName = paramsData.step_name;
            } else {
              myChart.dispatchAction({
                type: "downplay",
                name: me.clickStepName
              });
              myChart.dispatchAction({
                type: "highlight",
                name: paramsData.step_name
              });
              me.clickStepName = paramsData.step_name;
            }
            me.onStopData = paramsData

            me.updatedChart(params.data.step_no)
            me.$emit("node-click", paramsData);
          } else {
            if (params.data["_record_data"]) {
              if (me.clickStepName == "") {
                myChart.dispatchAction({
                  type: "highlight",
                  name: paramsData.step_name
                });
                me.clickStepName = paramsData.step_name;
              } else {
                myChart.dispatchAction({
                  type: "downplay",
                  name: me.clickStepName
                });
                myChart.dispatchAction({
                  type: "highlight",
                  name: paramsData.step_name
                });
                me.clickStepName = paramsData.step_name;
              }
              me.onStopData = paramsData
              
              me.$emit("node-click", paramsData);
            }
          }
        }
      });


      me.updatedChart()
      // 绘制图表
      // myChart.setOption({
      //   tooltip: {
      //       formatter: "{c}"
      //   },
      //   grid:{
      //     top: '10%',
      //     bottom: '10%',
      //     left:'10%',
      //     right:'10%'
      //   },
      //   series: [
      //     {
      //       type: "graph",
      //       layout: 'none',
      //       top:20,
      //       bottom:20,
      //       symbolSize: 46,
      //       label: {
      //          normal: {
      //             color: "#333333",
      //             show: true
      //           },
      //       },
      //       edgeSymbol: ["none", "arrow"],
      //       edgeSymbolSize: [20, 20],
      //       edgeLabel: {
      //         normal: {
      //           textStyle: {
      //             fontSize: 20,
      //             color:"#f2f2f2"
      //           },
      //            formatter: "{a}次"
      //         }
      //       },
            
      //       data: me.cloneData,
      //       links: me.links,
      //       lineStyle: {
      //         curveness: 0.2,
      //         z: 1,
      //               zlevel: 2,
      //         normal: {
      //           opacity: 0.9,
      //           width: 2,
      //           curveness: 0
      //         }
      //       }
      //     }
      //   ]
      // });

      
    }
  }
};
</script>
<style scoped>
.text-success{
  color: rgb(0, 206, 92);
  font-weight: bold;
}
.text-info,.text-action{
  color: rgb(12, 125, 253);
  font-weight: bold;
}
</style>
