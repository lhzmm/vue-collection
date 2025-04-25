<template>
  <div class="lh-upload">
    <ul class="uploaded-list">
      <li v-for="(fileDescription,index) in fileList" :key="fileDescription.id" class="uploaded-item">
        <img ref="imgs" :src="fileDescription.url" alt="" :style="{cursor: fileDescription.loading?'':'pointer'}" @click="onPreview(fileDescription,index)" />
        <div v-show="editFileId===fileDescription.id" class="edit-file-name" :style="{width:imgWidth+'px'}">
          <input v-model="nextFileName" />
          <i class="icon-content-btn-daochu" @click="onSave"></i>
        </div>
        <i v-if="!readonly" class="icon-content-btn-quxiao suffix-icon" @click="onDelete(fileDescription,index)"></i>
      </li>
      <li v-if="fileList.length < limit && !readonly" class="upload-plus" @click="openExplorer">
        <i class="icon-content-btn-tianjia"></i>
        <div class="tip">点击上传</div>
      </li>
    </ul>

    <template v-if="preview">
      <el-image-viewer :initial-index="previewInitialIndex" :on-close="closePreview" :url-list="previewList" />
    </template>
  </div>
</template>

<script>
import {ElImageViewer} from 'element-plus'
import { defineFileList } from './define'
import props from './props'
import TEST from '@/assets/test.png'

let spng = ''
if (process.env.NODE_ENV === 'development') {
  spng = TEST
}

export default {
  components: { ElImageViewer  },
  inheritAttrs: false,
  props: {
    ...props,
    fileList: {
      type: Array,
      default: () => defineFileList([
        { id: 1, name: 'test.png', url: spng, loading: false },
        { id: 2, name: 'test.png', url: spng, loading: true },
      ]),
    },
    fileType: {
      type: Array,
      default: () => ['.png', '.jpg', '.jpeg'],
    },
  },
  data() {
    return {
      editFileId: '',
      nextFileName: '',
      imgWidth: 0,
      preview: false,
      previewInitialIndex: 0,
    }
  },
  computed: {
    previewList() {
      return this.fileList.filter((fileDescription) => !fileDescription.loading).map((fileDescription) => fileDescription.url)
    },
  },
  methods: {
    openExplorer() {
      if (this.fileList.length >= this.limit) {
        this.onExceed()
        return
      }
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = this.fileType
      input.click()
      input.addEventListener('change', (e) => {
        const [file] = e.target.files
        this.onUpload(file)
      })
    },
    onEdit(fileDescription, index) {
      this.editFileId = fileDescription.id
      this.nextFileName = fileDescription.name
      this.imgWidth = this.$refs.imgs[index].clientWidth
    },
    onSave() {
      if (this.nextFileName) {
        const fidx = this.fileList.findIndex((_fileDescription) => _fileDescription.id === this.editFileId)
        if (fidx > -1) {
          this.$emit('rename', { ...this.fileList[fidx], name: this.nextFileName }, fidx)
        }
      }
      this.editFileId = ''
    },
    onUpload(file) {
      if (this.beforeUpload(file)) {
        console.log(file)
        this.$emit('upload', file)
      }
    },
    onExceed() {
      this.$message.warning(`最多上传${this.limit}个文件`)
    },
    beforeUpload(file) {
      if (file.size > 20 * 1024 * 1024) {
        this.$message.warning('文件不能超过20M')
        return false
      }
      const arr = file.name.split('.')
      const fileSuffix = this.fileType.map((v) => v.substring(1))
      const isLegal = fileSuffix.includes(arr[arr.length - 1].toLowerCase())
      if (!isLegal) {
        this.$message.warning(`只能上传 ${fileSuffix.join('、')} 格式文件`)
      }
      return isLegal
    },
    onPreview(fileDescription, index) {
      this.prevOverflow = document.body.style.overflow
      if (fileDescription.loading) return
      document.body.style.overflow = 'hidden'
      this.preview = true
      this.previewInitialIndex = index
    },
    closePreview() {
      document.body.style.overflow = this.prevOverflow
      this.preview = false
    },
    onDelete(fileDescription, index) {
      this.$emit('delete', fileDescription, index)
    },
  },
}
</script>

<style lang="less" scoped>
ul{
  padding: 0;
  margin: 0;
  list-style: none;
}
.lh-upload {
  .uploaded-list{
    display: flex;
    flex-wrap: wrap;
    li + li{
      margin-left: 16px;
    }
    .uploaded-item{
      position: relative;
      min-width: 100px;
      border-radius: 4px;
      width: 160px;
      > img{
        background-color: #f5f7fa;
        width: 100%;
        height: 90px;
        display: inline-block;
        vertical-align: middle;
        object-fit: contain;
        margin-bottom: 6px;
        border-radius: 4px;
      }

      .file-name{
        display: flex;
        line-height: 24px;
        align-items: center;
        span{
          font-size: 14px;
          flex:0 1 auto;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: rgba(0, 0, 0, 0.45);
          margin-right: auto;
        }
        .edit-icon,
        .loading-icon{
          display: inline-block;
          font-size: 16px;
          color:#1c5ee5;
          cursor: pointer;
        }

        .edit-icon{
          margin-left: 10px;
        }
        .loading-icon{
          font-size: 12px;
          margin-right: 10px;
          // vertical-align: -1px;
          animation: rotate 1s linear infinite;
        }
      }

      .edit-file-name{
        display: flex;
        align-items: center;
        border-radius: 4px;
        border: solid 1px #e3e7eb;
        padding: 0 8px 0 0;
        input{
          height: 22px;
          border:none;
          // border-top:1px solid #e3e7eb;
          // border-bottom:1px solid #e3e7eb;
          flex:1 1 auto;
          min-width: 0;
          font-size: 14px;
          // color: rgba(0, 0, 0, 1);
          color: rgba(0, 0, 0, 0.45);
          outline: none;
          // line-height: 22px;
          padding: 0 2px 0 8px;
        }
        i{
          font-size: 16px;
          margin-left: 10px;
          color:#bcc2cd;
          cursor: pointer;
        }
      }

      .suffix-icon{
        position: absolute;
        top: -3px;
        right: -3px;
        width: 20px;
        height: 20px;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: #f5f7fa;
        cursor: pointer;
        border-radius: 50%;
        background-color: #828a98;
      }
    }
  }
  .upload-plus{
    cursor: pointer;
    width: 90px;
    height: 90px;
    background-color: #ffffff;
    border-radius: 4px;
    border: dashed 1px #e3e7eb;
    line-height: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .icon-content-btn-tianjia{
      font-size: 20px;
      color:#bcc2cd;
    }
    .tip{
      margin-top: 12px;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.25);
    }
  }
}

@keyframes rotate {
  0%{
    transform: rotate(0deg);
  }
  100%{
    transform: rotate(-360deg);
  }
}
</style>
