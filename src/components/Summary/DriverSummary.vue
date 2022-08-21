<template>
  <div class="driver-summary">
    <h1>ドライバー毎集計</h1>

    <div class="table">
      <table>
        <thead>
          <tr>
            <td>ドライバーID</td>
            <td>有効ラップ</td>
            <td>ピットストップ除外</td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in drivers" :key="d.driverId">
            <td>{{ d.driverId }}</td>
            <td>{{ secToMS(d.all, true) }}</td>
            <td>{{ secToMS(d.withoutPit, true) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script>
import { defineComponent } from 'vue'
import {onMounted, toRefs, watch} from 'vue'
import UtilMixin from '../Lib/Util.vue'
import Util from '../Lib/Util.vue'

// import Lap from '../../lib/lap'

export default defineComponent({
  name: 'DriverSummary',
  mixins: [UtilMixin],
  props: {
    driverSummary: {type: Object, default: null},
  },
  setup(props) {
    const {driverSummary} = toRefs(props)

    console.log('driverSummary', driverSummary)

    onMounted(() => {
      console.debug('onMounted', driverSummary)
    })

    watch(driverSummary, v => {
      console.debug('watch', v)
    })

    return {
      driverSummary
    }
  },
  computed: {
    drivers () {
      if (!this.driverSummary) {
        return []
      }
      const keys = {
        ...this.driverSummary.all ?? {},
        ...this.driverSummary.withoutPit ?? {}
      }

      return Object.keys(keys).sort((a, b) => a - b).map(key => {
        return {
          driverId: key,
          all: this.driverSummary.all[key] ?? '---',
          withoutPit: this.driverSummary.withoutPit[key] ?? '---'
        }
      })
    }
  }
})
</script>

<style scoped lang="scss">
.driver-summary {
  h1 {
    font-size: 1.8em;
  }
  //border: 1px gray solid;
  .table {
    margin: 0 auto;
    position: relative;
    text-align: center;
  }
  table {
    width: 100%;
    position: relative;
    border-collapse: collapse;
    thead {
      td {
      }
    }
    tbody {
      td {
        border: 1px solid gray;
      }
    }
  }
}
</style>
