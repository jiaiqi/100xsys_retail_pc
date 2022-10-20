<template>
  <div>

    <el-form ref="msgform" :model="form" label-width="100px">

      <el-form-item label="接收对象" prop="receive_packet" :rules="[{ required: true, message: '请选择接收对象', trigger: 'blur' }]">
        <el-select v-model="form.receive_packet" placeholder="选择接收对象">
          <el-option v-for="(item,index) in regions " :key="index" :label="item.title" :value="item.num"></el-option>
        </el-select>
        <span class="tip">选择您要发送的分组</span>
      </el-form-item>

      <el-form-item label="发送速度">
        <el-radio-group v-model="form.send_rate">
          <el-radio label="0">随机速度</el-radio>
          <el-radio label="1">1x</el-radio>
          <el-radio label="3">3x</el-radio>
          <el-radio label="5">5x</el-radio>
          <el-radio label="7">7x</el-radio>
          <el-radio label="9">9x</el-radio>
        </el-radio-group>
      </el-form-item>

      <div v-for="(item,index) in form.contents" :key="index">
        <el-form-item :prop="'contents.' + index +'.value'" :rules="[{ required: true, message: '请输入...', trigger: 'blur' }]" :label="item.label">
          <el-input style="width: 850px" placeholder="变量：当前时间{time},当前日期{date},换行符\n" v-model="item.value">
          </el-input>
        </el-form-item>
      </div>

      <el-form-item label="链接网址">
        <el-input style="width: 850px" v-model="form.link_address" placeholder="消息点击后打开的网址"></el-input>
        <span class="tip">请以http://或https://开头，没有请留空 若地址较长请使用工具缩短后填写</span>

      </el-form-item>
      <el-form-item label="小程序APPID">
        <el-input style="width: 450px" v-model="form.pro_app_id" placeholder="小程序后台基本设置里面"></el-input>
        <span class="tip">小程序appid如wx1b1d...,必须与当前公众号是关联关系，没有请留空</span>

      </el-form-item>
      <el-form-item label="小程序页面">
        <el-input style="width: 450px" v-model="form.pro_pages" placeholder="填写小程序跳转页面"></el-input>
        <span class="tip">小程序页面地址如 pages/index , 没有请留空</span>

      </el-form-item>
      <el-form-item v-if="type!='detail'">
        <el-button type="primary" @click="onSubmit">保存</el-button>
      </el-form-item>
    </el-form>

  </div>
</template>
<script>
export default {
  data() {
    return {
      form: {
        receive_packet: "",
        send_rate: "0",
        link_address: "",
        pro_app_id: "",
        pro_pages: "",
        title: "",
        template_no: "",
        app_no: "",
        contents: []
      },

      type: "",
      batch_no: "",
      regions: [
        { num: 1, title: "按顺序0万-5万" },
        { num: 2, title: "按顺序5万-10万" },
        { num: 3, title: "按顺序10万-15万" },
        { num: 4, title: "按顺序15万-20万" },
        { num: 5, title: "按顺序25万-30万" },
        { num: 6, title: "按顺序30万-35万" },
        { num: 7, title: "按顺序35万-40万" }
      ]
    };
  },

  methods: {
    portInput() {
      this.$forceUpdate();
    },
    async initContentData() {
      var me = this;

      await this.select("srvwx_app_parse_template_select", [
        {
          colName: "template_no",
          value: me.form.template_no,
          ruleType: "eq"
        }
      ]).then(response => {
        var dataList = response.data.data;

        for (let item of dataList) {
          item.value = "";
        }
        me.form.contents = dataList;
      });

      if (this.type == "update" || this.type == "detail") {
        var condition = [
          {
            colName: "batch_no",
            value: this.batch_no,
            ruleType: "eq"
          }
        ];
        this.select(
          "srvwx_app_template_msg_cfg_data_select",
          condition
        ).then(response => {
          var dataMap = response.data.data[0];
          me.form.receive_packet = dataMap.receive_packet;
          me.form.send_rate = dataMap.send_rate;
          me.form.link_address = dataMap.link_address;
          me.form.pro_app_id = dataMap.pro_app_id;
          me.form.pro_pages = dataMap.pro_pages;
          me.form.title = dataMap.title;
          me.form.template_no = dataMap.template_no;
          me.form.app_no = dataMap.app_no;

          let content = dataMap.content;

          for (var item of me.form.contents) {
            for (var key in content) {
              if (item.col == key) {
                item.value = content[key];
              }
            }
          }
        });
      }
    },
    onSubmit() {
      var me = this;
      this.$refs["msgform"].validate(valid => {
        if (valid) {
          if (this.type == "add") {
            var bxrequest = [
              {
                serviceName: "srvwx_app_template_msg_cfg_add",
                data: [
                  {
                    receive_packet: me.form.receive_packet,
                    send_rate: me.form.send_rate,
                    link_address: me.form.link_address,
                    pro_app_id: me.form.pro_app_id,
                    pro_pages: me.form.pro_pages,
                    title: me.form.title,
                    template_no: me.form.template_no,
                    app_no: me.form.app_no
                  }
                ]
              }
            ];
            bxrequest[0].data[0].content = {};
            for (var item of me.form.contents) {
              bxrequest[0].data[0].content[item.col] = item.value;
            }

            this.operate(bxrequest).then(response => {
              if (response.data.state == "SUCCESS") {
                this.$message({
                  type: "success",
                  message: "任务创建成功!"
                });

                // this.addTab(
                //   "list",
                //   null,
                //   "群发消息",
                //   "srvwx_app_template_msg_cfg_select"
                // );

                this.forwardAddTab(
                  "/vpages/index.html#/list/srvwx_app_template_msg_cfg_select?menuapp=wx&srvApp=wx&time="+(new Date()).getTime(),
                  "群发消息"
                );
              } else {
                this.$message.error("任务创建失败");
              }
            });
          } else {
            var bxrequest = [
              {
                serviceName: "srvwx_app_template_msg_cfg_update",
                data: [
                  {
                    receive_packet: me.form.receive_packet,
                    send_rate: me.form.send_rate,
                    link_address: me.form.link_address,
                    pro_app_id: me.form.pro_app_id,
                    pro_pages: me.form.pro_pages,
                    title: me.form.title,
                    template_no: me.form.template_no,
                    app_no: me.form.app_no
                  }
                ],
                condition: [
                  {
                    colName: "batch_no",
                    value: me.batch_no,
                    ruleType: "eq"
                  }
                ]
              }
            ];
            bxrequest[0].data[0].content = {};
            for (var item of me.form.contents) {
              bxrequest[0].data[0].content[item.col] = item.value;
            }

            this.operate(bxrequest).then(response => {
              if (response.data.state == "SUCCESS") {
                this.$message({
                  type: "success",
                  message: "任务修改成功!"
                });

                // this.addTab(
                //   "list",
                //   null,
                //   "群发消息",
                //   "srvwx_app_template_msg_cfg_select"
                //);

                this.forwardAddTab(
                  "/vpages/index.html#/list/srvwx_app_template_msg_cfg_select?menuapp=wx&srvApp=wx&time="+(new Date()).getTime(),
                  "群发消息"
                );

              

                
              } else {
                this.$message.error("任务修改失败");
              }
            });
          }
        } else {
          return false;
        }
      });

      console.log(this.form);
    }
  },
  created() {
    if (this.$route && this.$route.query && this.$route.query) {
      this.batch_no = this.$route.query.batch_no;
      this.form.title = this.$route.query.title;
      this.form.template_no = this.$route.query.template_no;
      this.form.app_no = this.$route.query.app_no;
      this.type = this.$route.query.type;
    }

    this.initContentData();
  }
};
</script>
<style scoped>
.tip {
  margin-left: 15px;
  font-size: 13px;
  color: #9a9a9a;
}
</style>