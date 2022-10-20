<template>
  <div>
    <el-row :gutter="10" >
      <!-- <el-col :xs="24" :sm="12" :md="6" :lg="4" :xl="3" v-for="(item,col_index) in gridData" :key="col_index + 1"> -->
      <el-col :xs="property_col.el_col === null ? 24 : property_col.el_col.xs" 
      :sm="property_col.el_col === null ? 12 : property_col.el_col.sm" 
      :md="property_col.el_col === null ? 6 : property_col.el_col.md" 
      :lg="property_col.el_col === null ? 4 : property_col.el_col.lg" 
      :xl="property_col.el_col === null ? 3 : property_col.el_col.xl" 
      v-for="(item,col_index) in gridData" :key="col_index + 1">
        <el-card shadow="always" body-style="{padding: '20px';padding-top:5px;}">
          <!-- <img :src="item[property_col.img]" class="image"> -->
          <div slot="header" class="clearfix" style="color:rgb(76, 128, 163);font-size:0.8rem;">
            <span>{{item[property_col.header]}}</span>
            <span class="right" :type="getStateType(item[property_col.type.colName],property_col.type.dispExps)">{{item[property_col.type.colName]}}</span>
          </div>
          <div class="title">{{item[property_col.title]}}</div>
          <div class="text item">{{item[property_col.content_one]}}</div>
          <div class="text item"> {{item[property_col.content_two]}}</div>
          <div class="bottom clearfix">
            <time class="time">{{item[property_col.footer]}}</time>
            <div class="footer-btn">
              <el-button v-for="(operate_item, operate_index) in row_button" :key="operate_index" @click="cardButtonClick(operate_item,item)" type="text" size="small" v-if="getDispExps(operate_item,item)&&operate_item.permission">
                {{operate_item.button_name}}
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<style scoped>
.el-card__header {
    color:rgb(76, 128, 163);
}
.el-badge{
  float:right;
}
.right {
    background-color: #0f93eb;
    color:#fff;
    border-radius: 9px;
    padding: 2px 8px;
    float:right;
    line-height: 1rem;
}
span[type=success]{
  background-color: #67c23a;
}
span[type=primary]{
  background-color: #0f93eb;
}
span[type=danger]{
  background-color: #f56c6c;
}
span[type=warning]{
  background-color: #e6a23c;
}
.bottom {
    margin-top: 13px;
    line-height: 12px;
  }
  .el-row{
    padding-bottom: 12px;
    
  }
  .el-row>div{
      margin-bottom: 5px;
    }
  .title{
    padding: 6px 0;
    padding-bottom:10px;
  }
  .footer-btn {
    padding: 8px;
    float: right;
  }
  .el-button{
    padding: 0;

  }
  .el-button:last-child,.el-buttom:first-child{
    margin-left:0.5rem;
  }
  .text {
      font-size: 14px;
    }
  .time{
    font-size: 0.8rem;
    color: #9E9E9E;
  }
  .item {
    /* margin-bottom: 18px; */
    padding: 2px 0;
    color:rgb(76, 128, 163);
    white-space:nowrap;
    overflow: hidden;
    text-overflow: ellipsis; 
  }
</style>

<script>
export default {
  data() {
    return {
      cols_span: 24,
      card_data: [],
      gridData: [],
      row_card_num: null,
      property_col: {
        "header":"",
        "type":"",
        "title":"",
        "content_one":"",
        "content_two":"",
        "footer":"",
        "el_col":null
      }
    };
  },
  props: {
    card_cfg: {
      type: Object
    },
    row_button: {
      type: Array,
      default: function() {
        return [];
      }
    },
    data_list: {
      type: Array,
      default: function() {
        return [];
      }
    }
  },
  methods: {
    setCardData: function(dataList) {
      this.gridData = dataList;
      this.buidlCardData();
    },
    getStateType: function(col,exps){
      let data = col
       if(exps || exps !== null){
          let exp = eval(exps)
          return exp
       }else{
         return 'primary'
       }
    },
    cardButtonClick: function(butinfo, row) {
      this.$emit("card-row-button", butinfo, row);
    },
    getDispExps(item, data) {
      var result = true;

      try {
        var disp_exps = item.disp_exps;
        if (disp_exps != undefined && disp_exps != "" && disp_exps != null) {
          result = eval(disp_exps);
        }
      } catch (err) {
       
      }

      return result;
    },

    buidlCardData: function() {
      if (
        this.row_card_num != undefined &&
        this.row_card_num != "" &&
        this.row_card_num != null
      ) {
        this.cols_span = 24 / this.row_card_num;
        let rows = Math.ceil(this.gridData.length / this.row_card_num);

        this.card_data = [];
        var index = 0;
        for (var i = 0; i < rows; i++) {
          var data = [];
          for (var j = 0; j < this.row_card_num; j++) {
            if (index < this.gridData.length) {
              data[j] = this.gridData[index];
            } else {
              break;
            }
            index++;
          }
          this.card_data.push(data);
        }
      }
    }
  },
  created: function() {
    let card_cfg_relation = JSON.parse(this.card_cfg.property_relation);
    for (var key in this.property_col) {
      this.property_col[key] = card_cfg_relation[key];
    }
    //构造二维数组数据
    this.row_card_num = this.card_cfg.row_card_num;
    this.gridData = this.data_list;
    this.$emit("card-loaded", this);
    this.buidlCardData();
  }
};
</script>



