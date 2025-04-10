<template>
  <Table :loading="loading" :table-configs="configs" :data="data" :need-auto-scroll="false" style="max-height:200px" :when-refresh-table-view="CHANGE_STATUS_OF_TABLE_DATA">
    <template #default="{row,config}">
      <template v-if="config.prop==='d'">
        this is template d:{{ row.d }}
      </template>
      <template v-else>
        {{ row[config.prop] }}
      </template>
    </template>
  </Table>
</template>

<script>
import Table, { CHANGE_STATUS_OF_TABLE_DATA } from './index'

export default {
  components: { Table },
  data() {
    return {
      loading: false,
      CHANGE_STATUS_OF_TABLE_DATA,
      configs: [
        // ie下要指定width
        { width: 300, label: 'index', prop: '_', render: (t, r, i) => i + 1 },
        { label: 'a', prop: 'a', getColspan: ({ row }) => (row.i === 0 ? 4 : 1), render: () => 'this is span 4' },
        { label: 'b', prop: 'b' },
        { label: 'c', prop: 'c', render: (c) => <span>this is render c:{c}</span> },
        { label: 'd', prop: 'd' },
        // {
        //   label: 'a',
        //   prop: 'a',
        //   headColspan: 2,
        //   width: 300,
        //   subHeads: [
        //     { width: 150, label: 'a1', prop: 'a1' },
        //     { width: 150, label: 'a2', prop: 'a2' },
        //   ],
        // },
        // { width: 300, label: 'd', prop: 'd', headRowspan: 2 },
        // { width: 300, label: 'c', prop: 'c', headRowspan: 2 },
        // {
        //   label: 'b',
        //   prop: 'b',
        //   headColspan: 2,
        //   width: 200,
        //   subHeads: [
        //     { label: 'b1', prop: 'b1', width: 100 },
        //     { label: 'b2', prop: 'b2', width: 100 },
        //   ],
        //   fixed: true,
        // },
      ],
      data: [],
    }
  },
  mounted() {
    setTimeout(() => {
      this.data = new Array(20).fill('').map((_, i) => ({
        i,
        a: Math.floor(Math.random() * 100),
        b: Math.floor(Math.random() * 100),
        c: Math.floor(Math.random() * 100),
        d: Math.floor(Math.random() * 100),
      }))
    }, 1000)
  },
}
</script>
