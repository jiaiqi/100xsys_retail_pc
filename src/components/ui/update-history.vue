<template>
  <div class="update-history">
    <el-card>
      <div class="text-bold card-title">
        <span>历史记录</span>
        <span @click="changeOrder">
          <i class="el-icon-top" :class="{ 'text-blue': order === 'asc' }"></i>
          <i
            class="el-icon-bottom"
            :class="{ 'text-blue': order === 'desc' }"
          ></i>
        </span>
      </div>

      <el-collapse v-model="activeNames">
        <el-collapse-item
          :name="time.modify_time"
          v-for="(time, tIndex) in setList"
          :key="time.modify_time"
        >
          <template slot="title"
            ><span> {{ time._index }}. </span>
            <span class="m-l">
              {{ time._date_time }} 由
              <span class="text-bold">{{ time._create_user || "-" }} </span>
            </span>
            <span v-if="time._is_first == true">创建</span>
            <span v-else>编辑</span>
          </template>
          <div class="block-list">
            <div
              class="list-item"
              v-for="(item, index) in time.list"
              :key="index"
            >
              <span v-html="setText(item, setList, tIndex)"></span>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>

      <!-- <div
        class="history-block"
        v-for="(time, tIndex) in historyData"
        :key="time.modify_time"
      >
        <div class="block-title">
          <span> {{ tIndex + 1 }}. </span>
          <span>
            {{ time._date_time }} 由
            <span class="text-bold">{{ time._create_user || "-" }} </span>
          </span>
          <span v-if="tIndex == 0">创建</span>
          <span v-else>编辑</span>
          <span
            class="m-l el-icon-plus"
            plain
            type="primary"
            size="mini"
          ></span>
          <span
            class="m-l el-icon-minus"
            plain
            type="primary"
            size="mini"
          ></span>
        </div>
        <div class="block-list">
          <div
            class="list-item"
            v-for="(item, index) in time.list"
            :key="index"
          >
            <span v-html="setText(item, time.list, index)"></span>
          </div>
        </div>
      </div> -->
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeNames: [""],
      order: "asc",
    };
  },
  props: {
    historyData: {
      type: Array,
    },
    allFields: {
      type: Object,
    },
    srvCols: {
      type: Array,
    },
  },
  methods: {
    changeOrder() {
      if (this.order == "asc") {
        this.order = "desc";
      } else {
        this.order = "asc";
      }
    },
    setText(e, list, index) {
      if (this.labelMap) {
        if (Array.isArray(e._diff_cols) && e._diff_cols.length > 0) {
          let str = "";
          e._diff_cols.forEach((col) => {
            let oldVal = "";
            let curIndex = this.order === "asc" ? index - 1 : index + 1;
            if (list && list[curIndex] && list[curIndex][col]) {
              oldVal = list[curIndex][col];
            }

            let newVal = e[col];
            if (
              this.allFields[col].options &&
              Array.isArray(this.allFields[col].options) &&
              this.allFields[col].options.length > 0
            ) {
              let oldText = this.allFields[col].options.find(
                (item) => item.value === oldVal
              );
              if (oldText && oldText.label) {
                oldVal = oldText.label;
              }
              let newText = this.allFields[col].options.find(
                (item) => item.value === newVal
              );
              if (newText && newText.label) {
                newVal = newText.label;
              }
            }
            str += `修改了<i><strong>${
              this.labelMap[col]
            }</strong></i>,旧值为 ${oldVal || "null"} ,新值为 ${newVal ||
              "null"} ;</br>`;
          });
          return str;
        }
      }
    },
  },
  computed: {
    setList() {
      let res = [];
      if (Array.isArray(this.historyData) && this.historyData.length > 0) {
        this.historyData.forEach((item, index) => {
          res.push({
            _index: index + 1,
            _is_first: index === 0,
            ...item,
          });
        });
        if (this.order === "desc") {
          res.reverse();
        }
      }
      return res;
    },
    labelMap() {
      if (this.allFields) {
        let res = {};
        Object.keys(this.allFields).forEach((key) => {
          res[key] = this.allFields[key].info.label;
        });
        return res;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.text-blue {
  color: #409eff;
}
.card-title {
  display: flex;
  justify-content: space-between;
}
.text-bold {
  font-weight: bold;
}
.m-l {
  margin-left: 10px;
}
.update-history {
  min-height: 200px;
  padding: 20px 0;
}
.history-block {
  padding: 10px;
}
.list-item {
  padding: 0 30px;
  line-height: 30px;
}
</style>
