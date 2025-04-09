<template>
  <div class="collection">
    <lh-calendar date-format="YYYY-MM-DD">
      <template #dateCell="props">
        <lh-secret-display>15770664822 {{props}}</lh-secret-display>
      </template>
    </lh-calendar>
  </div>
</template>

<script setup>

</script>

<style lang="less" scoped>
.collection{

}
</style>