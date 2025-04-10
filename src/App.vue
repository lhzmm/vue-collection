<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView></RouterView>
</template>

<style lang="less">
html,body,#app{
  height:100%;
  margin:0;
  font-size: 14px;
}
.over-flow{
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
