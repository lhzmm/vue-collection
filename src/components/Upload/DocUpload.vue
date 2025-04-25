<template>
  <div class="lh-upload">
    <div v-if="!readonly" class="upload-area" @dragover.prevent @drop.prevent="onDrop" @click="openExplorer">
      <div class="placeholder">
        <i class="icon-content-btn-piliangdaoru"></i>
        <div><slot name="placeholder">点击或拖拽上传，支持{{ fileType.join(' / ') }}</slot></div>
      </div>
    </div>
    <ul v-if="fileList.length" class="uploaded-list">
      <li v-for="(fileDescription,index) in fileList" :key="fileDescription.id" class="uploaded-item" @click="openNewWindow(fileDescription, index)">
        <i class="prefix-icon" :class="fileDescription.loading?'icon-content-btn-chongzhi animate':'icon-content-btn-piliangdaoru'"></i>
        <a class="file-name" :title="fileDescription.name">{{ fileDescription.name }}</a>
        <i v-if="!readonly" class="icon-content-btn-quxiao suffix-icon" @click.stop="onDelete(fileDescription,index)"></i>
      </li>
    </ul>
  </div>
</template>

<script>
import FileSaver from 'file-saver'
import props from './props'

export default {
  inheritAttrs: false,
  props: {
    ...props,
    fileList: {
      type: Array,
      default: () => [
        {
          id: '1',
          url: '1.pdf',
          name: '1.pdf',
          loading: false,
        },
        {
          id: '2',
          url: '2.pdf',
          name: '2.pdf',
          loading: true,
        },
      ],
    },
    fileType: {
      type: Array,
      default: () => ['.pdf', '.docx', '.xlsx'],
    },
  },
  data() {
    return {}
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
    onDragover(e) {
      // if (this.fileList.length >= this.limit) return
      e.preventDefault()
    },
    onDrop(e) {
      if (this.fileList.length >= this.limit) {
        this.onExceed()
        return
      }
      const [file] = e.dataTransfer.files
      this.onUpload(file)
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
    onDelete(fileDescription, index) {
      this.$emit('delete', fileDescription, index)
    },
    openNewWindow(fileDescription, index) {
      const { url, name } = fileDescription
      // word文档, xlsx文件 只能下载
      const fileType = name.split('.')?.slice(-1)[0] ?? ''
      if (['docx', 'doc', 'xlsx', 'xls'].includes(fileType)) {
        // const a = document.createElement('a')
        // a.download = name
        // a.href = url
        // a.click()
        FileSaver.saveAs(url, name)
        return
      }
      window.open(url)
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
  .upload-area{
    text-align: center;
    height: 92px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #ffffff;
    border-radius: 4px;
    border: solid 1px #e3e7eb;
    cursor: pointer;
    margin-bottom: 12px;
    .placeholder{
      font-size: 14px;
      color: rgba(188, 194, 205, 1);
      line-height: 1;
      i{
        font-size: 36px;
        margin-bottom: 8px;
        display: inline-block;
      }
    }
  }
  .uploaded-list{
    background-color: rgba(242, 243, 244, 0.5);
    border-radius: 4px;
  }
  .uploaded-item{
    padding: 0 24px;
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    height: 40px;
    gap: 0 12px;
    .prefix-icon{
      color:#06b772;
      font-size: 20px;
      &.animate{
        color: #bcc2cd;
      }
    }
    .file-name{
      font-size: 14px;
      color: #1c5ee5;
      text-decoration: underline;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .suffix-icon{
      font-size: 12px;
      color: #828a98;
      cursor: pointer;
    }
  }
}

.animate{
  animation: rotate 1s linear infinite;
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
