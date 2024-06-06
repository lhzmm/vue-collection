<script>
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

export default {
  name: 'Calendar',
  props: {
    monthStr: {
      type: String,
      default: dayjs().format('YYYY-MM'),
    },
    dateFormat: {
      type: String,
      default: 'YYYY-MM-DD',
    },
  },
  data() {
    return {
      currentMonth: null,
      paddingHeadDays: 0,
      paddingTailDays: 0,
    }
  },
  computed: {
    daysInPrevMonth() {
      return this.currentMonth
        .clone()
        .subtract(1, 'months')
        .daysInMonth()
    },
    daysInMonth() {
      return this.currentMonth.daysInMonth()
    },
  },
  watch: {
    monthStr() {
      this.getCalendarInfo()
    },
  },
  created() {
    this.getCalendarInfo()
  },
  methods: {
    getCalendarInfo() {
      this.currentMonth = dayjs(this.monthStr, 'YYYY-MM')

      this.paddingHeadDays = this.currentMonth.day()

      const rest = (this.daysInMonth + this.paddingHeadDays) % 7
      if (rest) {
        this.paddingTailDays = 7 - rest
      } else {
        this.paddingTailDays = 0
      }
    },
    forWith(count, handler) {
      for (let i = 0; i < count; i += 1) {
        handler(i)
      }
    },
  },
  render() {
    const vnodes = []
    this.forWith(this.paddingHeadDays, (i) => {
      const props = {
        date: dayjs(`${this.monthStr}`)
          .subtract(i + 1, 'day')
          .format(this.dateFormat),
        expire: true,
      }
      vnodes.unshift(<div class="date-item expire">{this.$scopedSlots.dateCell ? this.$scopedSlots.dateCell(props) : this.daysInPrevMonth - i}</div>)
    })
    this.forWith(this.daysInMonth, (i) => {
      const props = {
        date: this.currentMonth
          .clone()
          .add(i, 'day')
          .format(this.dateFormat),
      }
      vnodes.push(<div class="date-item">{this.$scopedSlots.dateCell ? this.$scopedSlots.dateCell(props) : i + 1}</div>)
    })
    this.forWith(this.paddingTailDays, (i) => {
      const props = {
        date: dayjs(`${this.monthStr}`, 'YYYYMM')
          .add(1, 'month')
          .add(i, 'day')
          .format(this.dateFormat),
        invalid: true,
      }
      vnodes.push(<div class="date-item invalid">{this.$scopedSlots.dateCell ? this.$scopedSlots.dateCell(props) : i + 1}</div>)
    })
    return (
      <div class="calendar">
        <table class="table-head">
          <thead>
            <tr>
              {['日', '一', '二', '三', '四', '五', '六'].map((str) => (
                <td>{str}</td>
              ))}
            </tr>
          </thead>
        </table>
        <div class="main-box">
          <table class="table-body">
            <tbody>
              {(() => {
                const trs = []
                const columns = 7
                let tds = []
                for (let i = 0; i < vnodes.length; i += 1) {
                  tds.push(<td>{vnodes[i]}</td>)
                  if (i % columns === columns - 1) {
                    trs.push(<tr>{tds}</tr>)
                    tds = []
                  }
                }
                if (tds.length) {
                  trs.push(<tr>{tds}</tr>)
                }

                return trs
              })()}
            </tbody>
          </table>
          </div>
      </div>
    )
  },
}
</script>

<style lang="less" scoped>
.calendar {
  width: 100%;
  @radius: 4;
  border-radius: ~'@{radius}PX';
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0px -2px 13px 0px rgba(0, 0, 0, 0.05);
  .table-head,
  .table-body {
    width: 100%;
  }
  .table-head {
    background-color: #f5f8ff;
    td {
      height: 48px;
      text-align: center;
      color: #5575a1;
    }
  }
  .table-body {
    margin-top: -1px;
    td {
      border: 1px solid #e7eeff;
    }
  }
  .expire {
    background: url('~@/assets/expire-date.png') center/100% 100%;
  }
  .invalid {
    background: url('~@/assets/invaild-date.png') center/100%;
  }
  .date-item {
    min-height: 154px;
  }
}
table {
  table-layout: fixed;
  border-collapse: collapse;
}
.main-box{
  height: calc(100% - 48px);
  overflow-y: auto;
  &::-webkit-scrollbar{
    width: 0;
  }
}
</style>
