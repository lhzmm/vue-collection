<template>
  <div class="page-layout">
    <div class="page-header">
      <div
        class="nav-item"
        v-for="item in categories"
        :key="item.path"
        :class="{'active': item.path === route.path}"
        @click="handleClick(item)"
      >
        {{item.label}}
      </div>
    </div>
    <div class="page-content">
      <RouterView></RouterView>
    </div>
  </div>
</template>

<script setup>
import { RouterView, useRouter, useRoute } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()
const route = useRoute()
const categories = ref([
  { path: '/calendar', label: '日历' },
  { path: '/loop', label: 'Loop方法' },
])

function handleClick(item) {
  router.push(item.path)
}

</script>

<style lang="less" scoped>
.page-layout{
  height: 100%;
  display: grid;
  grid-template-rows: 84px 1fr;
  grid-template-columns: 232px 1fr;
  .page-header{
    grid-column: ~'1/3';
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #dfd9d9;
    text-align: center;
    gap: 20px;
    .nav-item{
      font-size: 20px;
      color: #fff;
      padding: 0 12px;
      line-height: 36px;
      min-width: 80px;
      border-radius: 4px;
      background-color: #3d3b3b;
      cursor: pointer;
    }
    .active{
      background-color: #2851cf;
    }
  }
  .page-content{
    grid-column: ~'1/3';
    z-index: 0;
    padding: 20px;
  }
}
</style>