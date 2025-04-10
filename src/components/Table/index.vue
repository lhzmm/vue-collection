<script lang="jsx">
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
import debounce from 'lodash/debounce'
import { version } from "vue"

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}

export const CHANGE_STATUS_OF_LOADING = 'CHANGE_STATUS_OF_LOADING'
export const CHANGE_STATUS_OF_TABLE_DATA = 'CHANGE_STATUS_OF_TABLE_DATA'

const isVue3 = version?.startsWith('3') // 判断vue版本

// css transform实现方式
export default {
  /* eslint-disable vue/name-property-casing */
  name: 'LhTable',
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    interval: {
      type: Number,
      default: 800,
    },
    tableConfigs: {
      type: Array,
      default: () => [],
    },
    data: {
      type: Array,
      default: () => [],
    },
    isShow: {
      type: Boolean,
      default: true,
    },
    needAutoScroll: {
      type: Boolean,
      default: false,
    },
    needListenResize: {
      type: Boolean,
      default: true,
    },
    rowClick: { type: Function, default: undefined },
    emptyContent: { type: [Object, String], default: '' },
    exactScrollBarWidth: {
      type: Number,
      default: undefined,
    },
    whenRefreshTableView: {
      type: String,
      default: CHANGE_STATUS_OF_LOADING,
    },
    speed: {
      type: Number,
      default: 0.05, // 0.05px/ms
    },
  },
  data() {
    return {
      scrollX: false,
      scrollY: false,
      fixedLayerWidth: 0,
      fixedTableWidth: 0,
      reachFixedTable: false,
      refNameForScroll: '',

      innerTableData: [],

      index: 0,
      extraIndex: -1,

      scrollTop: 0,
      transitionDuration: 0,
      // transitionDuration: this.interval,

      scrollTimer: null,
      toTopTimer: null,
      stopDoScroll: false,
      inited: false,
      initing: false,
    }
  },
  computed: {
    tableData() {
      return this.data
    },
    fixedConfigs() {
      return this.tableConfigs.filter((config) => config.fixed)
    },
    scrollBarWidth() {
      if (this.exactScrollBarWidth || this.exactScrollBarWidth === 0) {
        return this.exactScrollBarWidth
      }
      if (/Chrome/.test(window.navigator.userAgent)) {
        const div = document.createElement('div')
        div.height = 0
        div.style.overflowY = 'scroll'
        document.body.appendChild(div)
        const _scrollBarWidth = div.offsetWidth - div.clientWidth
        document.body.removeChild(div)
        return _scrollBarWidth
      }
      return 17
    },
  },
  watch: {
    loading: {
      handler() {
        if (this.whenRefreshTableView !== CHANGE_STATUS_OF_LOADING) return
        if (this.needAutoScroll) {
          if (!this.loading) {
            if (this.isShow && !this.initing) {
              this.doScrollStrategy()
            }
          } else {
            this.resetPropertyValue()
            this.clearTimer()
          }
        } else if (!this.loading) {
          this.innerTableData = [...this.tableData]
          this.$nextTick(() => {
            if (this.$refs.$table_body_wrapper) this.$refs.$table_body_wrapper.scrollTop = 0
            this.assertIfScroll()
          })
        }
      },
      immediate: true,
    },
    tableData: {
      handler() {
        if (this.whenRefreshTableView !== CHANGE_STATUS_OF_TABLE_DATA) return
        // debugger
        if (this.needAutoScroll) {
          this.resetPropertyValue()
          this.clearTimer()
          if (this.isShow && !this.initing) {
            this.doScrollStrategy()
          }
        } else {
          this.innerTableData = [...this.tableData]
          this.$nextTick(() => {
            if (this.$refs.$table_body_wrapper) this.$refs.$table_body_wrapper.scrollTop = 0
            this.assertIfScroll()
          })
        }
      },
      immediate: true,
    },
    // tableData: {
    //   handler() {
    //     this.innerTableData = this.getInnerTableData()
    //     if (!this.needAutoScroll) {
    //       this.$nextTick(() => {
    //         if (this.$refs.$table_body_wrapper) this.$refs.$table_body_wrapper.scrollTop = 0
    //       })
    //     }
    //   },
    //   immediate: true
    // },
    isShow() {
      if (!this.loading) {
        if (this.needAutoScroll) {
          if (this.isShow) {
            if (!this.initing) {
              this.doScrollStrategy()
            }
          } else {
            this.resetPropertyValue()
            this.clearTimer()
          }
        }
      }
    },
  },
  mounted() {
    // console.log(this.rowClick)
    if (this.needListenResize) {
      this.resizeHandler = this.getResizeHandler()
      window.addEventListener('resize', this.resizeHandler)
    }
  },
  beforeDestroy() {
    if (this.needAutoScroll) {
      this.resetPropertyValue()
      this.clearTimer()
    }
    window.removeEventListener('resize', this.resizeHandler)
  },
  methods: {
    getResizeHandler() {
      return debounce(() => {
        if (this.isShow && !this.loading) {
          if (this.needAutoScroll) {
            this.clearTimer()
            this.resetPropertyValue()
            this.doScrollStrategy()
          } else {
            this.assertIfScroll()
          }
        }
      }, 500)
    },

    // -------------------- 自动滚动相关 --------------------
    resetPropertyValue() {
      this.inited = false
      this.initing = false
      this.index = 0
      this.scrollTop = 0
      this.transitionDuration = 0
    },

    doScrollStrategy() {
      if (this.rejectPrevPrepareScrollStrategy) {
        this.rejectPrevPrepareScrollStrategy()
      }
      // this.initing = true
      let _reject
      const cancelPromise = new Promise((resolve, reject) => {
        this.rejectPrevPrepareScrollStrategy = reject
        _reject = reject
      })
      Promise.race([
        new Promise((resolve) => {
          this.innerTableData = [...this.tableData]
          this.$nextTick().then(() => {
            if (this.needScroll()) {
              this.isMoveToTop().then(resolve)
            } else {
              resolve()
            }
          })
        }),
        cancelPromise,
      ])
        .then(() => {
          if (_reject !== this.rejectPrevPrepareScrollStrategy) return // 表示该流程已失效，异步队列中存在更新的doScrollStrategy操作
          if (this.needScroll()) {
            this.innerTableData = this.getInnerTableData()
            this.setScrollTimer()
          }
          this.initing = false
          this.inited = true
        })
        .catch(() => { /*  */ })
    },

    clearTimer() {
      clearTimeout(this.scrollTimer)
      clearInterval(this.toTopTimer)
    },

    mousewheel(e) {
      if (!this.needAutoScroll) return
      e.preventDefault()
    },

    mouseenter() {
      if (!this.needAutoScroll) return
      this.stopDoScroll = true
    },

    mouseleave() {
      if (!this.needAutoScroll) return
      this.stopDoScroll = false
    },

    needScroll() {
      if (this.tableData.length === 0) return false
      if (this.$refs.$table_body_wrapper.clientHeight >= this.$refs.$native_table.clientHeight) {
        return false
      }
      return true
    },

    getInnerTableData() {
      const data = [...this.tableData]
      if (this.tableData.length === 0) return data
      if (this.$refs.$table_body_wrapper.clientHeight >= this.$refs.$native_table.clientHeight) {
        return data
      }
      const container = this.$refs.$table_body_wrapper
      let extraHeight = 0
      let rowIndex = 0
      while (extraHeight < container.clientHeight) {
        const tr = container.querySelectorAll('tr')[rowIndex]
        extraHeight += tr.clientHeight
        data.push(this.tableData[rowIndex])
        rowIndex += 1
      }
      this.extraIndex = this.tableData.length
      return data
    },

    transformEnd(e) {
      // 内部元素可能也存在transform
      if (e.target !== this.$refs.$native_table) return
      this.index += 1
      if (this.index === this.extraIndex) {
        this.index = 0
        this.scrollTop = 0
        this.transitionDuration = 0
        this.isMoveToTop().then(() => {
          this.setScrollTimer()
        })
      } else {
        this.setScrollTimer()
      }
    },

    setScrollTimer() {
      this.scrollTimer = setTimeout(this.scroll, this.interval)
    },

    isMoveToTop() {
      return new Promise((resolve) => {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(resolve)
        })
        // const maxLoop = 10000
        // let i = 0
        // this.toTopTimer = setInterval(() => {
        //   i += 1
        //   if (i > maxLoop) {
        //     clearInterval(this.toTopTimer)
        //     console.error('interval larger than 10000')
        //     return
        //   }
        //   const { $table_body_wrapper, $native_table } = this.$refs
        //   if ($table_body_wrapper.getClientRects()[0].top === $native_table.getClientRects()[0].top) {
        //     clearInterval(this.toTopTimer)
        //     resolve()
        //   }
        //   // try {
        //   // } catch {
        //   //   resolve()
        //   // }
        // }, 16.7)
      })
    },

    scroll(distance = this.getScrollOffset()) {
      // console.log('scroll')
      if (this.stopDoScroll) {
        this.setScrollTimer()
        return
      }
      if (this.$refs.$table_body_wrapper.clientHeight >= this.$refs.$native_table.clientHeight) {
        return
      }
      this.transitionDuration = distance / this.speed
      // FIXME: 存在未知的1px距离
      this.scrollTop = (this.scrollTop === 0 ? 1 : this.scrollTop) + distance
    },

    getScrollOffset(rowIndex = this.index) {
      const container = this.$refs.$table_body_wrapper
      const tr = container.querySelectorAll('tr')[rowIndex]
      // console.log('tr.clientHeight', tr.getClientRects()[0].height)
      return tr.getClientRects()[0].height
    },

    // ------------------------------------- 固定列相关 -------------------------------------
    assertIfScroll() {
      const { $table_body_wrapper, $native_table } = this.$refs
      if (!$native_table) {
        this.scrollX = false
        this.scrollY = false
        return
      }
      this.scrollX = this.$el.clientWidth < $native_table.clientWidth
      this.scrollY = $table_body_wrapper.clientHeight < $native_table.clientHeight
      this.$nextTick(() => {
        this.calcFixedWidth()
        this.assertReachFixedTable()
      })
    },

    assertReachFixedTable() {
      if (this.fixedConfigs.length === 0 || this.tableData.length === 0) {
        this.reachFixedTable = false
        return
      }
      this.reachFixedTable = this.$refs.$scroll_container.scrollLeft + this.$el.clientWidth === this.$refs.$align_container.clientWidth
    },

    calcFixedWidth() {
      if (this.fixedConfigs.length === 0 || this.tableData.length === 0) {
        this.fixedLayerWidth = 0
        return
      }
      const fidx = this.tableConfigs.findIndex((config) => config.fixed)
      let currrentNode = this.$refs.$native_table.querySelector('tr').children[fidx]
      let width = 0
      while (currrentNode) {
        width += currrentNode.clientWidth
        currrentNode = currrentNode.nextElementSibling
      }
      if (this.scrollY) {
        width += this.scrollBarWidth
      }
      this.fixedLayerWidth = width
      this.fixedTableWidth = this.$refs.$align_container.clientWidth
      // console.log('scrollLeft:', this.$refs.$align_container.clientWidth - width)
      this.$nextTick(() => {
        this.$el.querySelector('.fixed-layer').scrollLeft = this.$refs.$align_container.clientWidth - width
      })
    },

    listenFixedTableScroll(refName) {
      return (e) => {
        if (refName === this.refNameForScroll) return
        this.$refs[refName].scrollTop = e.target.scrollTop
      }
    },

    getMaxDeep(configs = [], countDeep = 1) {
      const temp = []
      for (let i = 0; i < configs.length; i += 1) {
        const config = configs[i]
        if (config.subHeads?.length) {
          temp.push(this.getMaxDeep(config.subHeads, countDeep + 1))
        } else {
          temp.push(countDeep)
        }
      }
      return Math.max.apply(null, temp)
    },

    // --------------------- 渲染 ---------------------
    renderHead(tableConfigs = this.tableConfigs) {
      const maxDeep = this.getMaxDeep(tableConfigs)// 多级头部最大深度

      const flatTableConfigs = []
      function analyzeTableConfigs() {
        const query = [...tableConfigs]
        while (query.length) {
          const current = query.shift()
          if (current.subHeads?.length) {
            query.unshift(...current.subHeads)
          } else {
            flatTableConfigs.push(current)
          }
        }
      }
      analyzeTableConfigs()
      const colgroupNode = <colgroup>
      {
        flatTableConfigs.map((config) => {
          const width = config.width ? (typeof config.width === 'number' ? `${config.width}px` : config.width) : ''
          return <col style={{ width }}/>
        })
      }
      </colgroup>

      return (
        <div class="table-header__wrapper">
          <table>
          {colgroupNode}
            <thead>
              {
                (() => {
                  const nodes = []
                  for (let deep = 1; deep <= maxDeep; deep += 1) {
                    let configs = tableConfigs
                    for (let i = 2; i <= deep; i += 1) {
                      configs = configs.reduce((prev, config) => prev.concat(config.subHeads || []), [])
                    }
                    const node = (
                    <tr>
                      {
                        configs.map((config) => {
                          let content
                          if (config.renderHead) {
                            content = config.renderHead()
                          } else if (!isVue3 && this.$scopedSlots.head) {
                            content = this.$scopedSlots.head(config)
                          } else if (this.$slots.head) {
                            content = this.$slots.head(config)
                          } else {
                            content = config.label
                          }
                          return <th
                            key={config.prop}
                            style={{
                              /* eslint-disable-next-line */
                              width: config.width ? (typeof config.width === 'number' ? `${config.width}px` : config.width) : '',
                              ...(config.headStyle || config.cellStyle),
                            }}
                            rowspan={config.headRowspan || 1}
                            colspan={config.headColspan || 1}
                          >
                            {content}
                          </th>
                        })
                      }
                      {this.scrollY && deep === 1 ? <th class="gutter" rowspan={maxDeep} style={{ width: `${this.scrollBarWidth}px` }}></th> : null}
                    </tr>
                    )
                    nodes.push(node)
                  }
                  return nodes
                })()
              }
            </thead>
          </table>
        </div>
      )
    },

    renderContent(tableConfigs = this.tableConfigs, isFixedTable) {
      // const h = this.$createElement
      if (this.loading) {
        return (
          <div class="loading">
            <i></i>加载中...
          </div>
        )
      }
      if (this.tableData.length === 0) {
        return <div class="no-data">{this.emptyContent || this.$slots.empty || '暂无数据'}</div>
      }
      let overflowY = 'auto'
      if (this.needAutoScroll) {
        overflowY = 'hidden'
      }
      if (this.scrollY) {
        overflowY = 'scroll'
      }
      let onScroll = noop
      if (this.fixedConfigs.length) {
        if (isFixedTable) {
          onScroll = this.listenFixedTableScroll('$table_body_wrapper')
        } else {
          onScroll = this.listenFixedTableScroll('$fixed_table_body_wrapper')
        }
      }
      const skipRowMap = {}
      function flatTableConfigs(configs) {
        return configs.reduce((prev, config) => {
          if (config.subHeads?.length) {
            return prev.concat(flatTableConfigs(config.subHeads))
          }
          return prev.concat(config)
        }, [])
      }
      return (
        <div
          ref={isFixedTable ? '$fixed_table_body_wrapper' : '$table_body_wrapper'}
          class={{ 'table-body__wrapper': true, 'no-scroll-bar': this.exactScrollBarWidth === 0 }}
          style={{ overflowY }}
          onMouseenter={() => {
            this.refNameForScroll = isFixedTable ? '$fixed_table_body_wrapper' : '$table_body_wrapper'
          }}
          onScroll={onScroll}
          // onMousewheel={this.mousewheel}
          onMouseenter={this.mouseenter}
          onMouseleave={this.mouseleave}
        >
          <table
            ref={isFixedTable ? '' : '$native_table'}
            onTransitionend={this.transformEnd}
            style={{ transform: `translateY(-${this.scrollTop}px)`, transition: `transform linear ${this.transitionDuration}ms` }}
          >
            <tbody>
              {this.innerTableData.map((row, rowIndex) => {
                let skipCol = 0
                return (
                  <tr
                    key={rowIndex}
                    onClick={() => {
                      // eslint-disable-next-line no-unused-expressions
                      this.rowClick && this.rowClick(row)
                    }}
                    style={{ cursor: this.rowClick ? 'pointer' : '' }}
                  >
                    {
                      flatTableConfigs(tableConfigs).map((config) => {
                        let needSkip = false
                        if (skipRowMap[config.prop] > 0) {
                          skipRowMap[config.prop] -= 1
                          needSkip = true
                        }
                        if (skipCol > 0) {
                          skipCol -= 1
                          needSkip = true
                        }
                        if (needSkip) {
                          return null
                        }

                        const rowspan = config.getRowspan?.({ row, config }) || 1
                        skipRowMap[config.prop] = skipRowMap[config.prop] || 0
                        skipRowMap[config.prop] += (rowspan - 1)

                        const colspan = config.getColspan?.({ row, config }) || 1
                        skipCol += (colspan - 1)

                        let content
                        if (config.render) {
                          content = config.render(row[config.prop], row, rowIndex)
                        } else if (!isVue3 && this.$scopedSlots.default) {
                          content = this.$scopedSlots.default({ row, config })
                        } else if (this.$slots.default) {
                          content = this.$slots.default({ row, config })
                        } else {
                          content = row[config.prop]
                        }

                        return (
                          <td
                            key={config.prop}
                            style={{
                              /* eslint-disable-next-line */
                              width: config.width ? (typeof config.width === 'number' ? `${config.width}px` : config.width) : '',
                              ...config.cellStyle,
                            }}
                            colspan={colspan || config.headColspan || 1}
                            rowspan={rowspan}
                          >
                            <div class="div-cell">
                              {content}
                            </div>
                          </td>
                        )
                      })
                    }
                    {/* this.fixedConfigs.length && !isFixedTable ? <td style={{ width: this.scrollBarWidth + 'px', padding: 0 }}></td> : null */}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )
    },

    renderFixedHead() {
      if (this.loading || this.tableData.length === 0) return null
      if (!this.fixedConfigs.length) return null
      return this.renderHead(this.tableConfigs)
    },

    renderFixedContent() {
      if (this.loading || this.tableData.length === 0) return null
      if (!this.fixedConfigs.length) return null
      return this.renderContent(this.tableConfigs, true)
    },
  },
  render() {
    return (
      <div class="table">
        <div ref="$scroll_container" class="scroll-container" onScroll={this.scrollX ? this.assertReachFixedTable : noop}>
          <div ref="$align_container" class="align-container">
            {this.renderHead()}
            {this.renderContent()}
          </div>
        </div>
        {this.tableData.length && this.fixedConfigs.length
          ? [
            !this.reachFixedTable ? <div class="shadow" style={{ right: `${this.fixedLayerWidth}px` }}></div> : null,
              <div
                key="fixed-layer"
                class="fixed-layer"
                style={{ bottom: this.scrollX ? `${this.scrollBarWidth}px` : 0, width: `${this.fixedLayerWidth}px` }}
              >
                <div class="fixed-table" style={{ width: `${this.fixedTableWidth}px` }}>
                  {this.renderFixedHead()}
                  {this.renderFixedContent()}
                </div>
              </div>,
          ]
          : null}
      </div>
    )
  },
}
</script>

<style lang="scss" scoped>
.table {
  height: 100%;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 0;
  table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
    tbody tr {
      &:nth-child(odd) {
        background-color: fade-out(#ffffff, 0.4);
      }
      &:nth-child(even) {
        background-color: fade-out(#8d8f91, 0.4);
      }
    }
    td,
    th {
      text-align: center;
      font-size: 16px;
      line-height: 24px;
      padding: 8px;
    }
    th {
      background-color: fade-out(#c2bdbd, 0.4);
    }
    th.gutter {
      padding: 0px;
    }
  }
  .div-cell {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .loading {
    margin: 16px 0;
    line-height: 20px;
    font-size: 14px;
    text-align: center;
    color: #a6becc;
    > * {
      vertical-align: middle;
    }
    i {
      display: inline-block;
      box-sizing: content-box !important;
      height: 10px;
      width: 10px;
      border: 1px solid;
      box-sizing: border-box;
      border-radius: 100%;
      border-right-color: transparent;
      margin-right: 8px;
      animation: loading_indication 1000ms linear infinite both;
      vertical-align: -2px;
    }
  }
  .no-data {
    color: #a6becc;
    padding: 16px 0;
    line-height: 20px;
    font-size: 14px;
    text-align: center;
    letter-spacing: 1px;
  }
}
.table-header__wrapper {
  flex: 0 0 auto;
  min-width: 100%;
  align-self: flex-start;
}
.table-body__wrapper {
  overflow: hidden;
  min-width: 100%;
  align-self: flex-start;
  flex: 1 1 auto;
  min-height: 0;
  &.no-scroll-bar::-webkit-scrollbar{
    display:none;
  }
  tbody tr:last-child {
    td {
      border-bottom-color: transparent;
    }
  }
}
.scroll-container {
  overflow-y: hidden;
  flex: auto;
  height: 100%;
  display: flex;
  flex-direction: column;
}
// 对齐头部和内容的宽度，尤其是内容无数据时
.align-container {
  display: inline-flex;
  flex-direction: column;
  flex: 1;
  align-self: flex-start;
  min-width: 100%;
  min-height: 0;
  position: relative;
}
.fixed-layer {
  right: 0;
  top: 0;
  bottom: 0;
  position: absolute;
  background-color: #fff;
  overflow: hidden;
}
.fixed-table {
  display: flex;
  height: 100%;
  flex-direction: column;
}
.shadow {
  position: absolute;
  right: 0;
  width: 1px;
  top: 4px;
  bottom: 4px;
  box-shadow: 0 0 4px 0px #9e9e9e;
}
::v-deep .el-button--text {
  padding: 0;
}
::v-deep svg.circular {
  margin: 0 auto;
}
</style>

<style>
@keyframes loading_indication {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
