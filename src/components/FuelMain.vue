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
          <td><input type="text"
                     :value="lapTime(lap.planLapTime, idx)"
                     @change="setParamForLap('lapTime', idx, $event.target.value)"/>
          </td>
          <td><input type="text"
                     :value="planFuelConsumption(lap.planFuelConsumption, idx)"
                     @change="setParamForLap('fuelConsumption', idx, parseFloat($event.target.value))"/>
          </td>
          <td><input type="text"
                     :value="planTireStint(lap.planTireStint, idx)"
                     @change="setParamForLap('planTireStint', idx, parseInt($event.target.value))"/>
          </td>
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
    return {
      paramForLaps: []
    }
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
    setParamForLap (key, index, value) {
      console.debug(value)
      // 文字列で「:」を含む場合は秒数に変換
      if (typeof value === 'string' && value.includes(':')) {
        console.debug(value)
        value = DateLib.MSToSec(value)
      }
      // ラップ情報はあるはず
      if (!this.laps?.[index]) {
        return
      }
      const lap = this.laps[index].lap
      // 対象ラップがなかったら新規作成する
      let param = this.paramForLaps.find(v => v.lap === lap)
      if (!param) {
        param = {
          lap
        }
        this.paramForLaps.push(param)
      }
      param[key] = value
      this.remakeLaps(this.paramForLaps)
    },
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
      if (index > 0) {
        console.debug(this.laps[index].planLapTime, this.laps[index-1].planLapTime)
      }
      if (index === 0
          || this.laps[index].planLapTime !== this.laps[index-1].planLapTime
      ) {
        return this.secToMS(time)
      }
      return '↑'
    },
    planFuelConsumption (v, index) {
      if (index === 0
          || this.laps[index].planFuelConsumption !== this.laps[index-1].planFuelConsumption
      ) {
        return this.fmtFloat(v)
      }
      return '↑'
    },
    planTireStint (v, index) {
      if (index === 0
          || this.laps[index].planTireStint !== this.laps[index-1].planTireStint
      ) {
        return v
      }
      return '↑'
    },
    remakeLaps (paramForLaps = undefined) {
      this.laps = Lap.makePlanLaps(this.param, paramForLaps)
    }
  }
}
</script>

<style scoped>

</style>
