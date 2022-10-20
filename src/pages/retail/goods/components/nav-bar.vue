<template>
  <div class="nav-bar">
    <div class="nav-bar-content">
      <div class="left" @click="$router.back()">
        <i class="el-icon-back"></i>返回
      </div>
      <div class="nav-bar-content-title">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.nav-bar {
  padding-top: 45px;
  &-content {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    padding: 10px;
    background-color: #fff;
    z-index: 1;
    display: flex;
    display: flex;
    align-items: center;
    .left {
      display: flex;
      align-items: center;
      cursor: pointer;
    }
    i {
      font-size: 24px;
      margin-right: 5px;
    }
    &-title {
      display: flex;
      align-items: center;
      padding: 0 10px;
      border-left: 1px solid #999;
      margin-left: 10px;
    }
  }
}
</style>
