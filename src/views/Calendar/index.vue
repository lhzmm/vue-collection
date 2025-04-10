<template>
  <div class="collection">
    <div class="month-switch">
      <i class="el-icon-arrow-left" @click="handleSwitchData('prev')">&lt;</i>
      <span class="data">{{ monthStr.replace('-', '.') }}</span>
      <i class="el-icon-arrow-right" @click="handleSwitchData('next')">&gt;</i>

      <span class="today" @click="handleSwitchData('today')">今天</span>
    </div>
    <lh-calendar date-format="YYYY-MM-DD" :monthStr="monthStr">
      <template #dateCell="props">
        <div
          class="cell-item"
          :class="{'active': currentSelectDay === props.date}"
        >
          <div class="day">
            <span class="day-num" :class="{'disabled': props.expire || props.invalid}">{{ Number(props.date.slice(-2)) }}</span>
          </div>
          <lh-secret-display>15770664822</lh-secret-display>
        </div>
      </template>
    </lh-calendar>
  </div>
</template>

<script setup>
import dayjs from 'dayjs'
import {ref} from 'vue'

const monthStr = ref(dayjs().format('YYYY-MM'))
const currentSelectDay= ref(dayjs().format('YYYY-MM-DD')) // 当前选中的日期


function handleSwitchData(type) {
  switch (type) {
    case 'prev':
      monthStr.value = dayjs(monthStr.value).subtract(1, 'month').format('YYYY-MM')
      break
    case 'next':
      monthStr.value = dayjs(monthStr.value).subtract(-1, 'month').format('YYYY-MM')
      break
    case 'today':
      monthStr.value = dayjs().format('YYYY-MM')
      currentSelectDay.value = dayjs().format('YYYY-MM-DD')
      break
    default:
  }
}
</script>

<style lang="less" scoped>
.collection{
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: center;
  .month-switch{
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    i {
      color: #ccd3db;
      font-size: 24px;
      padding: 4px;
      cursor: pointer;
      font-style: normal;
      &::before{
        font-weight: bold;
      }
    }
    .data{
      font-size: 36px;
      color: #2951cf;
      width: 152px;
    }
    .today{
      font-size: 20px;
      color: #ffffff;
      width: 80px;
      line-height: 42px;
      margin-left: 42px;
      background-color: #2851cf;
      box-shadow: 0px 4px 10px 0px rgba(92, 127, 255, 0.24);
      border-radius: 4px;
      cursor: pointer;
    }
  }
  /deep/ .calendar{
    flex: 1;
    .date-item{
      min-height: unset;
    }
  }
  .cell-item{
    display: flex;
    flex-direction: column;
    height: 120px;
    padding: 9px 20px;
    box-sizing: border-box;
    border: solid 1px transparent;
    &.active{
      background-color: #eff3ff;
      border-color: #2851cf;
    }
    .day{
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      height: 40px;
      .day-num{
        font-size: 28px;
        color: #323c47;
        font-weight: bold;
        &.disabled{
          color: #c7c7c7;
        }
      }
    }
  }
}
</style>