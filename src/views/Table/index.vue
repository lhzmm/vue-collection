<template>
  <lh-table :loading="loading" :data="tableData" :table-configs="tableConfigs"></lh-table>
</template>

<script setup lang="jsx">
import { ref } from 'vue'

const loading=ref(false)
const tableData =  ref([
  {totalRainfall: 122, totalUpstreamWater: 1022, resName: '水库a',totalFloodDischarge: 12331, stnm: '测站a',waterLevel: 12.34,tm: '2024-12-28 08:00:00', row: 3},
  {totalRainfall: 133, totalUpstreamWater: 1022, resName: '水库b',totalFloodDischarge: 18291, stnm: '测站b',waterLevel: 22.34,tm: '2024-12-28 08:00:00', row: 3},
  {totalRainfall: 113, totalUpstreamWater: 1022, resName: '水库c',totalFloodDischarge: 11391, stnm: '测站c',waterLevel: 26.34,tm: '2024-12-28 08:00:00', row: 3},
  {totalRainfall: 113, totalUpstreamWater: 1002, resName: '水库d',totalFloodDischarge: 11391, stnm: '测站d',waterLevel: 26.34,tm: '2024-12-28 08:00:00', row: 1},
  {totalRainfall: 113, totalUpstreamWater: 1002, resName: '水库e',totalFloodDischarge: 11391, stnm: '测站e',waterLevel: 26.34,tm: '2024-12-28 08:00:00', row: 2},
  {totalRainfall: 113, totalUpstreamWater: 1002, resName: '水库f',totalFloodDischarge: 11391, stnm: '测站f',waterLevel: 26.34,tm: '2024-12-28 08:00:00', row: 2},
])
const tableConfigs = ref([
  {
    label: '总雨量（mm）',
    prop: 'totalRainfall',
    headColspan: 1,
    headRowspan: 2,
    width: '1.5rem',
    getRowspan: ({row}) => row.row,
    render: (val) => <div class="table-title over-flow" title={val}> {val !== null ? val.toFixed(1) : '--'}</div>,
  },
  {
    label: '上游来水总量（万m³）',
    prop: 'totalUpstreamWater',
    headColspan: 1,
    headRowspan: 2,
    width: '1.5rem',
    getRowspan: ({row}) => row.row,
    render: (val) => <div class="table-title over-flow" title={val}> {val !== null ? val.toFixed(2) : '--'}</div>,
  },
  {
    label: '水库泄洪总量（万m³）',
    prop: 'allFlood',
    headColspan: 2,
    width: '3rem',
    subHeads: [
      {
        label: '水库名称',
        prop: 'resName',
        width: '1.1rem',
        render: (val) => <div class="table-title over-flow" title={val}> {val !== null ? val : '--'}</div>,
      },
      {
        label: '泄洪总量（万m³）',
        prop: 'totalFloodDischarge',
        width: '1.9rem',
        render: (val) => <div class="table-title over-flow" title={val}> {val !== null ? val.toFixed(2) : '--'}</div>,
      },
    ],
  },
  {
    label: '特征水位站水位信息',
    prop: 'allReservoir',
    headColspan: 3,
    width: '4.5rem',
    subHeads: [
      {
        label: '站点名称',
        prop: 'stnm',
        width: '1.5rem',
        render: (val) => <div class="table-title over-flow" title={val}> {val !== null ? val : '--'}</div>,
      },
      {
        label: '最高水位（m）',
        prop: 'waterLevel',
        width: '1.5rem',
        render: (val) => <div class="table-title over-flow" title={val}> {val !== null ? val.toFixed(2) : '--'}</div>,
      },
      {
        label: '出现时间',
        prop: 'tm',
        width: '1.5rem',
        render: (val) => <div class="table-title over-flow" title={val}>
          <div>{val !== null ? val.split(' ')[0] : '--'}</div>
          <div>{val !== null ? val.split(' ')[1] : '--'}</div>
        </div>,
      },
    ],
  },
])

</script>

<style lang="less" scoped>

</style>
