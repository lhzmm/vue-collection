<template>
  <div class="upload">
    <div class="row-item">
      <div class="title">文件上传：</div>
      <lh-upload
        type="DocUpload"
        :limit="3"
        :fileType="['.pdf', '.docx']"
        @upload="uploadFile"
      >
      </lh-upload>
    </div>
    <div class="row-item">
      <div class="title">图片上传：</div>
      <lh-upload
        type="ImageUpload"
        :limit="3"
        @upload="uploadImg"
      >
      </lh-upload>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const fileList = ref([])
const imgList = ref([])


function uploadFile(file) {
  console.log('file',file)
}

function uploadImg(file) {
  console.log('image',file)
}
</script>

<style lang="less" scoped>
.upload{
  display: flex;
  flex-direction: column;
  gap: 50px;
  width: 800px;
  margin: 0 auto;
  .row-item{
    display: flex;
    .title{
      font-size: 18px;
      color: #333;
    }
    .lh-upload{
      flex-grow: 1;
    }
  }
}
</style>