<template>
  <div>
    <h1>Fuel - v2</h1>
    <Parameters :param="param" @update:param="mergeParam"/>

    <div>
      <button @click="remakeLaps">ラップ表更新</button>
    </div>

    <table>
      <thead>
        <tr>
          <td>ラップ</td>
          <td>残り時間</td>
          <td>燃料残量</td>
          <td>ピットアウト</td>
          <td>タイヤ交換</td>
          <td>目標ラップタイム</td>
          <td>目標燃費</td>
          <td>目標タイヤスティント</td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(lap, idx) in laps" :key="lap.lap">
          <td>{{ lap.lap }}</td>
          <td>{{ secToHMS(lap.planRemainingTime) }}</td>
          <td>{{ fmtFloat(lap.planFuelLevel) }}</td>
          <td>{{ lap.planPitOut ? '●' : '' }}</td>
          <td>{{ lap.planChangeTires ? '●' : '' }}</td>
          <td>{{ lapTime(lap.planLapTime, idx) }}</td>
          <td>{{ planFuelConsumption(lap.planFuelConsumption, idx) }}</td>
          <td>{{ stintPerTireSet(lap.stintPerTireSet, idx) }}</td>
        </tr>
      </tbody>
    </table>
  </div>

</template>

<script type="ts">

import DateLib from '../lib/date'
import LapApi from '../lib/api/lap'
import Log from '../lib/log'
import ParameterLib from '../lib/parameter'
import { ref, onMounted, watch } from 'vue'
import Parameters from './Parameter/Parameters.vue'
import Lap from '../lib/lap'

export default {
  name: 'FuelMain',
  components: {
    Parameters
  },
  props: {
    query: { type: Object, required: true }
  },
  data() {
    return {}
  },
  setup(props) {
    const query = props.query

    // FuelパラメータをURLから取得、後から参照できるようにする
    const param = ref(new ParameterLib(
        parseInt(query.raceTime),
        parseInt(query.targetLapTime),
        parseFloat(query.targetFuelConsumption),
        parseInt(query.fullFuel),
        parseInt(query.stintPerTireSet),
        parseInt(query.pitThroughTime),
        parseInt(query.refillFuelTime),
        parseInt(query.tireReplacementTime),
        parseInt(query.subSessionId),
        parseInt(query.carIdx),
    ))

    const resultLaps = ref([])
    const laps = ref([])
    // パラメータからラップ計画を作る

    // ラップ情報をAWSから取得
    laps.value = Lap.makePlanLaps(param.value)

    const getOwnLaps = async () => {
      Log.debug('[getOwnLaps]')
      laps.value = await LapApi.getLaps(param.value.subSessionId, param.value.carIdx)
    }

    onMounted(() => {
      Log.debug('onMounted')
      getOwnLaps()
    })

    return {
      param,
      getOwnLaps,
      laps
    }
  },
  methods: {
    mergeParam (value) {
      console.debug(`mergeParam: ${value}`)
      Object.keys(value).forEach(key => {
        console.log(`key: ${key}, value: ${value[key]}`)
        this.param[key] = value[key]
      })
    },
    secToHMS (sec) {
      const _sec = sec > 0 ? sec : 0
      return DateLib.secToHMS(_sec)
    },
    secToMS (sec) {
      return DateLib.secToMS(sec)
    },
    fmtFloat (num, digit = 2) {
      return num.toFixed(digit)
    },
    /**
     * 目標ラップタイムが同じ場合は表示しない（テキストボックスで変更できるようにする）
     * @param time
     * @param index
     */
    lapTime (time, index) {
      if (index === 0
          || this.laps[index].targetLapTime !== this.laps[index-1].targetLapTime
      ) {
        return this.secToMS(time)
      }
      return ''
    },
    planFuelConsumption (v, index) {
      if (index === 0
          || this.laps[index].planFuelConsumption !== this.laps[index-1].planFuelConsumption
      ) {
        return this.fmtFloat(v)
      }
    },
    stintPerTireSet (v, index) {
      if (index === 0
          || this.laps[index].stintPerTireSet !== this.laps[index-1].stintPerTireSet
      ) {
        return v
      }
    },
    remakeLaps () {
      this.laps = Lap.makePlanLaps(this.param)
    }
  }
}
</script>

<style scoped>

</style>
