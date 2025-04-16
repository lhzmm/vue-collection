<script setup>
import { RouterView } from 'vue-router'

// 测试ajax调用
// import { createAjax } from '@/utils/ajax'

// createAjax('/api/sso/v1/ticket')({}).then(res => {
//   console.log(res)
// })
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
