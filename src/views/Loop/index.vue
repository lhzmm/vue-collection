<template>
  <div class="loop">
    <div class="btns">
      <div class="start" @click="start">循环开始</div>
      <div class="end" @click="end">循环结束</div>
      <div class="reset" @click="reset">循环重置</div>
    </div>
    <div class="data">
      <div class="item" v-for="item in data" :key="item">{{item}}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {Loop} from '@lhzmm/tools'

let timer = null
const data = ref([])

function addData() {
  const index = data.value.length
  data.value.push(`每隔2秒循环一次，最多10次自动结束，这是第${index + 1}次`)

  if (data.value.length > 9) { // 结束循环
    timer?.stop()
  }
}

function start() {
  timer?.stop()
  timer = new Loop(addData, { interval: 2 * 1000, leading: true })
}
function end() {
  timer?.stop()
}
function reset() {
  data.value = []
  timer?.reset()
}

</script>

<style lang="less" scoped>
.loop{
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: center;
  .btns{
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    margin: 20px 0 20px;
    .start,
    .end,
    .reset{
      font-size: 16px;
      color: #ffffff;
      min-width: 80px;
      line-height: 32px;
      background-color: #808185;
      border-radius: 4px;
      cursor: pointer;
    }
  }
  .data{
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-size: 16px;
  }
}
</style>