<template>
  <div class="page-layout">
    <div class="page-header">header</div>
    <div class="page-content">
      <RouterView></RouterView>
    </div>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'

</script>

<style lang="less" scoped>
.page-layout{
  height: 100%;
  display: grid;
  grid-template-rows: 84px 1fr;
  grid-template-columns: 232px 1fr;
  .page-header{
    grid-column: ~'1/3';
  }
  .page-content{
    grid-column: ~'1/3';
    z-index: 0;
  }
}
</style>