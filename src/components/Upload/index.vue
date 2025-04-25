<template>
  <component :is="type" v-bind="$attrs" v-on="$attrs">
    <template #placeholder>
      <slot name="placeholder"></slot>
    </template>
  </component>
</template>

<script>
import DocUpload from './DocUpload.vue'
import ImageUpload from './ImageUpload.vue'

export default {
  components: {
    DocUpload,
    ImageUpload,
  },
  props: {
    type: {
      type: String,
      default: 'DocUpload',
    },
  },
}
</script>
