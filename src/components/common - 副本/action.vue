<template>
  <div style="display: inline-block" v-show="this.info.visible" class="bx_action">
    <el-button v-if="info" :size="info._moreConfig.size" :type="info._moreConfig.type" :icon="info._moreConfig.icon" :round="info._moreConfig.style !== '' &&  info._moreConfig.style === 'round'" :plain="info._moreConfig.style !== '' && info._moreConfig.style === 'plain'" :circle="info._moreConfig.style !== '' && info._moreConfig.style === 'circle'" :loading="is_draft && freeze" @click="onClicked()">{{ info.label}}
      <span v-show="is_draft">{{is_draft && realTime ? '(' +realTime +'s)' : ''}}</span>
    </el-button>
    <!-- <el-button v-if="info" 
      :size="info._moreConfig.size" 
      :type="info._moreConfig.type" 
      :icon="info._moreConfig.icon" 
      :round="info._moreConfig.style !== '' &&  info._moreConfig.style === 'round'"
      :plain="info._moreConfig.style !== '' && info._moreConfig.style === 'plain'"
      :circle="info._moreConfig.style !== '' && info._moreConfig.style === 'circle'"
      :loading="this.isDraft.isDraft && freeze"
      @click="onClicked()"
      >{{ info.label}}
    </el-button> -->

    <executor v-if="info && info.executor" ref="executor" v-bind.sync="info.executor" :defaultValues="info.defaultValues" @executor-complete="$emit('executor-complete', $event)">
    </executor>

  </div>
</template>

<script>
import ExecutorMixin from "../mixin/executor-minx";
import { ActionInfo } from "../model/ActionInfo";
import Executor from "./executor.vue";

export default {
  components: {
    executor: Executor
  },
  mixins: [ExecutorMixin],

  props: {
    info: {
      type: ActionInfo
    },
    isDraft: {
      type: String,
      default: function() {
        return "norm";
      }
    },
    draftDataKey: {
      type: Object,
      default: function() {
        return {
          colName: "id",
          value: null
        };
      }
    }
  },

  data() {
    return {
      auto_save: null,
      realTime: null,
      timer: null,
      is_draft: false,
      freeze: false,
      remainingTimes: 0
    };
  },
  updated: function() {
    // if(this.isDraft.auto_save){
    //   this.actionTimer(this.isDraft.timer,this.isDraft)
    // }
  },
  mounted: function() {
    if (
      this.isDraft !== undefined &&
      this.isDraft !== null &&
      (this.info.name === "save_draft" || this.info.name === "update_draft")
    ) {
      this.is_draft = true;
    } else {
      this.is_draft = false;
    }
    if (this.is_draft) {
      this.actionTimer(this.isDraft.timer, this.isDraft);
    }
  },
  destroyed: function() {
    if (this.is_draft) {
      this.clearTimer(this.isDraft.auto_save, this.isDraft, "off");
    }
  },
  methods: {
    onClicked: function() {
      
      let self = this;
      let loading = null;
      let origin = Promise.resolve(true);
      origin
        .then(_ => {
          if (this.info.customPrecheckFunc) {
            let checkResult = this.info.customPrecheckFunc();
            if (checkResult !== true) {
              throw "custom precheck err";
            }
          }
        })
        .then(_ => {
          if (self.info.precheckFunc) {
            return self.info.precheckFunc();
          }
        })
        .catch(err => {
          if (err !== "custom precheck err") {
            self.$message.error("???????????????????????????");
          }
          throw "validate err";
        })
        .then(ret => {
          if (self.info.confirm) {
            return self.$confirm(self.info.confirm, "??????", {
              confirmButtonText: "??????",
              cancelButtonText: "??????",
              type: "warning"
            });
          }
        })
        .then(() => {
          if (self.info.loading) {
            loading = self.$loading({
              lock: self,
              text: "?????????",
              spinner: "el-icon-loading",
              background: "rgba(0, 0, 0, 0.7)"
            });
            // setTimeout(() => {
            //   loading.close();
            // }, 5000);
          }

          if (self.info.executor) {
            // ???????????????
            return self.$refs.executor.run(
              self.info,
              self.draftDataKey,
              self.isDraft
            );
          } else if (self.info.invokeFunc) {
            // return self.$refs.executor.run(self.info,self.draftDataKey,self.isDraft);
            // return Promise.resolve(self.info.invokeFunc());
            return Promise.resolve(self.info.invokeFunc());
          }
        })
        .then(response => {
          if (this.info.executor) {
            if (response && response.data && response.data.state == "SUCCESS") {
              self.$message({
                message: response.data.resultMessage || "???????????????",
                type: "success"
              });
            } else {
              self.$message.error(response.data.resultMessage || "???????????????");
              throw "submit err";
            }
          }
        })
        .then(value => {
          if (self.info.nav2Location && self.$router) {
            self.$router.push(self.info.nav2Location);
          }
        })
        .then(_ => {
          self.$emit("action-complete", self.info.name);
        })
        .catch(() => {})
        .finally(() => {
          if (loading) {
            loading.close();
          }
        });
    },
    clearTimer() {
      let self = this;

      clearInterval(self.timer);
    },
    actionTimer(t, e) {
      let self = this;
      this.auto_save = t;
      this.realTime = t;
      self.clearTimer();

      if (this.is_draft && this.isDraft.auto_save && this.isDraft.isDraft) {
        this.timer = setInterval(function() {
          if (
            self.remainingTimes < 3 &&
            !self.freeze &&
            self.isDraft.auto_save
          ) {
            if (self.realTime === 0) {
              self.autoOnClick();
            } else {
              self.realTime = self.realTime - 1;
            }
          } else {
            self.clearTimer(); //????????????
          }
        }, 1000);
      }
    },
    autoOnClick() {
      let self = this;
      self.clearTimer(); // ???????????????
      self.freeze = true;
      this.$emit("form-is-loaded", {
        loaded: true,
        text: "?????????????????????..."
      });
      this.$refs.executor
        .run(this.info, self.draftDataKey, self.isDraft)
        .then(response => {
          this.$emit("form-is-loaded", {
            loaded: false,
            text: "..."
          });
          if (this.info.executor) {
            if (response && response.data && response.data.state == "SUCCESS") {
              if (
                response.data.response[0].response.hasOwnProperty("ids") &&
                self.info.name === "save_draft"
              ) {
                self.draftDataKey.value =
                  response.data.response[0].response.ids[0];
                this.$emit("is-data-key", self.draftDataKey);
              } else if (
                response.data.response[0].response.hasOwnProperty(
                  "effect_data"
                ) &&
                self.info.name === "save_draft"
              ) {
                self.draftDataKey.value =
                  response.data.response[0].response.effect_data[0].id;
                this.$emit("is-data-key", self.draftDataKey);
              }
              this.$message({
                message: "???????????????????????????",
                type: "success"
              });
              self.freeze = false;
              this.actionTimer(this.auto_save, this.info);
            } else {
              self.remainingTimes += self.remainingTimes;
              this.$message.error(
                "?????????????????????" + response.data.resultMessage || "?????????????????????"
              );
              this.actionTimer(this.auto_save, this.info);
              throw "submit err";
            }
          }
        });
    }
  },
  watch: {
    isDraft: {
      handler: function(val, oldval) {
        if (this.is_draft && val.auto_save) {
          this.actionTimer(val.timer, val);
        } else {
          this.clearTimer();
        }
      },
      deep: true //????????????????????????????????????????????????
    },
    realTime: {
      handler: function(val, oldval) {
        if (val <= 3) {
          this.$emit("form-is-loaded", {
            loaded: true,
            text: "??????????????????????????????????????????"
          });
        }
      }
    }
  }
};
</script>

<style scoped>
.bx_action {
  margin-left: 3px;
  margin-right: 3px;
}
</style>

