<template>
  <div>
    <h1>Fuel - v2</h1>

    <table>
      <thead>
        <tr>
          <td colspan="8">
            <Parameters :param="param" @update:param="mergeParam"/>
            <button class="button" @click="remakeLaps('plan')">ラップ表更新</button>
          </td>
          <td colspan="8">
            <DriverSummary :driverSummary="driverSummary"/>
          </td>
        </tr>
        <tr>
          <td class="header-plan" colspan="7">計画</td>
          <td class="header-result" colspan="8">実績</td>
        </tr>
        <tr>
          <td>ラップ</td>
          <td>残り時間</td>
          <td>燃料残量</td>
          <td>タイヤ交換</td>
          <td>ラップタイム</td>
          <td>燃費</td>
          <td>タイヤスティント</td>
          <td>ラップ</td>
          <td>残り時間実績</td>
          <td>燃料残量実績</td>
          <td>ドライバーID</td>
          <td>ラップタイム</td>
          <td>燃費</td>
          <td>タイヤスティント</td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(lap, idx) in laps" :key="lap.plan?.lap ?? lap.result.lap">

          <td v-if="lap['plan'] == null" colspan="7">&nbsp;</td>

          <!-- 計画 -->

          <!-- ラップ -->
          <td v-if="lap['plan']" :class="lapRowClass(lap['plan'])">{{ lap['plan']?.lap ?? lap['result'].lap }}</td>
          <!-- 残り時間 -->
          <td v-if="lap['plan']">{{ secToHMS(lap['plan']?.remainingTime ?? 0) }}</td>
          <!-- 燃料残量 -->
          <td v-if="lap['plan']">{{ fmtFloat(lap['plan']?.fuelLevel ?? 0) }}<span class="arrow"> → </span>{{ fmtFloat(lap['plan']?.endOfFuel ?? 0) }}</td>
          <!-- タイヤ交換 -->
          <td v-if="lap['plan']">{{ (lap['plan']?.changeTires ?? false) ? '●' : '' }}</td>
          <!-- ラップタイム -->
          <td v-if="lap['plan']"><input type="text"
                     :value="lapTime(lap['plan']?.lapTime ?? 1, idx)"
                     @change="setParamForLap('lapTime', idx, $event.target.value)"/>
          </td>
          <!-- 燃料消費量 -->
          <td v-if="lap['plan']"><input type="text"
                     :value="fuelConsumption(lap['plan']?.fuelConsumption ?? 1, idx)"
                     @change="setParamForLap('fuelConsumption', idx, parseFloat($event.target.value))"/>
          </td>
          <!-- タイヤスティント -->
          <td v-if="lap['plan']"><input type="text"
                     :value="tireStint(lap['plan']?.tireStint ?? 1, idx)"
                     @change="setParamForLap('tireStint', idx, parseInt($event.target.value))"/>
          </td>

          <!-- 実績 -->
          <td v-if="lap['result'] == null" colspan="7">&nbsp;</td>

          <!-- ラップ -->
          <td v-if="lap['result']" :class="lapRowClass(lap['result'])">{{ lap['result']?.lap ?? lap['plan'].lap }}</td>
          <!-- 残り時間 -->
          <td v-if="lap['result']" :class="resultClass(lap['result']?.isPlan)">{{ secToHMS(lap['result']?.remainingTime ?? -1)}}</td>
          <!-- 燃料残量 -->
          <td v-if="lap['result']" :class="resultClass(lap['result']?.isPlan)">
            {{ fmtFloat(lap['result']?.fuelLevel ?? -1) }}<span class="arrow"> → </span>{{ fmtFloat(lap['result']?.endOfFuel ?? 0) }}
          </td>
          <!-- ドライバーID -->
          <td v-if="lap['result']" :class="resultClass(lap['result']?.isPlan)">{{ driverId(lap['result']?.driverId ?? -1, idx) }}</td>
          <!-- ラップタイム -->
          <td v-if="lap['result'] && (!lap['result']?.isPlan ?? true)"
              :class="resultClass(lap['result']?.isPlan)"
          >
            {{ lapTimeResult(lap['result']?.lapTimeResult ?? -1, idx) }}
          </td>
          <td v-else-if="lap['result']"><input type="text"
                            :value="lapTime(lap['result']?.lapTime ?? -1, idx, 'result')"
                            @change="setParamForLap('lapTime', idx, $event.target.value, 'result')"/>
          </td>
          <!-- 燃料消費量 -->
          <td v-if="lap['result'] && (!lap['result']?.isPlan ?? true)"
              :class="resultClass(lap['result']?.isPlan)"
          >
            {{ fuelConsumptionResult(lap['result']?.fuelConsumptionResult ?? -1) }}
          </td>
          <td v-else-if="lap['result']"><input type="text"
                            :value="fuelConsumption(lap['result']?.fuelConsumption ?? -1, idx, 'result')"
                            @change="setParamForLap('fuelConsumption', idx, parseFloat($event.target.value), 'result')"/>
          </td>
          <!-- タイヤスティント -->
          <td v-if="lap['result'] && (!lap['result']?.isPlan ?? true)"
              :class="resultClass(lap['result']?.isPlan)"
          >---</td>
          <td v-else-if="lap['result']"><input type="text"
                     :value="tireStint(lap['result']?.tireStint ?? -1, idx, 'result')"
                     @change="setParamForLap('tireStint', idx, parseInt($event.target.value), 'result')"/>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

</template>

<script type="ts">

import DateLib from '../lib/date'
import DriverSummary from './Summary/DriverSummary.vue'
import Driver from '../lib/summary/driver'
import LapApi from '../lib/api/lap'
import Log from '../lib/log'
import ParameterLib from '../lib/parameter'
import {ref, onMounted, watch, reactive} from 'vue'
import Parameters from './Parameter/Parameters.vue'
import Lap from '../lib/lap'
import Utils from '../lib/utils'
import UtilMixin from './Lib/Util.vue'

export default {
  name: 'FuelMain',
  mixins: [
    UtilMixin
  ],
  components: {
    Parameters,
    DriverSummary
  },
  props: {
    query: { type: Object, required: true }
  },
  // data() {
  //   return {
  //
  //   }
  // },
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
    // 計画用ラップ情報
    const bothLaps = ref({plan: [], result: []})
    // ラップ単位の設定
    const paramForLaps = ref({plan: [], result: []})
    // ドライバー集計データ
    const driverSummary = ref({all: null, withoutPit: null})

    const getLapsPlan = () => {
      return Lap.makeLapsPlan(param.value)
    }

    const getLapsResult = async (paramForLaps = undefined) => {
      Log.debug('[getLapsResult]')
      const awsRawData = await LapApi.getLaps(param.value.subSessionId, param.value.carIdx)
      return Lap.awsRowDataToLaps(awsRawData, param.value, paramForLaps)
    }

    const zipBothLaps = (plan, result) => {
      return Utils.zip(plan, result, (plan, result) => { return {plan, result} } )
    }

    const remakeLaps = async (target, _paramForLaps = undefined) => {
      Log.info('FuelMain:setup:remakeLaps')
      let plan
      let result
      if (target === 'plan') {
        plan = Lap.makeLapsPlan(param.value, _paramForLaps)
        bothLaps.value[target] = plan
        // 更新ボタンを押した時はラップ毎設定値はクリアする
        if (!_paramForLaps) {
          paramForLaps.value.plan.splice(0)
        }
      } else if (target === 'result') {
        result = await getLapsResult(_paramForLaps)
        bothLaps.value[target] = result
      }
    }

    // 実績をAWSからダウンロードしてlapsResultにセット、実績用データを作成
    // dummy

    // lapsResult.value = Lap.makeLapsResult(param.value, awsData)

    const setDriverSummary = () => {
      if (!Array.isArray(bothLaps.value.result)) {
        Log.info('FuelMain:setup:setDriverSummary', 'not Array')
        return
      }

      Log.info('FuelMain:setup:setDriverSummary', 'Set driverSummary')
      const driver = new Driver(bothLaps.value.result.filter(v => !v.isPlan))
      Log.info('FuelMain:setup:setDriverSummary', 'Driver', driver)
      driverSummary.value = {
        all: driver.AverageAllByDriver(),
        withoutPit: driver.AverageWithoutPit()
      }
    }

    watch(bothLaps, v => {
      Log.info('FuelMain:setup:watch:bothLaps', v)
      setDriverSummary()
    })

    // パラメータからラップ計画を作る
    const lapsPlan = getLapsPlan()
    const lapsResult = getLapsResult().then(v => {
      Log.info('FuelMain:setup:lapsResult.then')
      bothLaps.value = {plan: lapsPlan, result: v}
    })
    .catch(err => {
      throw(err)
    })

    onMounted(() => {
      Log.debug('FuelMain:onMounted')
    })

    // 定期的に更新する
    setInterval(() => {
      remakeLaps('result', paramForLaps.result)
      console.log('called setInterval')
    }, 60000)

    return {
      param,
      driverSummary,
      getLapsPlan,
      getLapsResult,
      bothLaps,
      paramForLaps,
      remakeLaps,
      zipBothLaps
    }
  },
  computed: {
    laps () {
      return reactive(this.zipBothLaps(this.bothLaps.plan, this.bothLaps.result))
    }
  },
  methods: {
    setParamForLap (key, index, value, target = 'plan') {
      // 文字列で「:」を含む場合は秒数に変換
      console.debug("[setParamForLap]", key, index, value, target)
      if (typeof value === 'string' && value.includes(':')) {
        value = DateLib.HMSToSec(value)
        console.debug("[setParamForLap]", value, "Seconds")
      } else {
        console.error('value is not a string or not include ":"')
      }
      // ラップ情報はあるはず
      if (!this.bothLaps?.[target][index]) {
        return
      }
      const lap = this.bothLaps[target][index].lap
      // 対象ラップがなかったら新規作成する
      let param = this.paramForLaps[target].find(v => v.lap === lap)
      if (!param) {
        param = {
          lap
        }
        this.paramForLaps[target].push(param)
      }
      param[key] = value
      this.remakeLaps(target, this.paramForLaps[target])
    },
    mergeParam (value) {
      console.debug(`mergeParam: ${value}`)
      Object.keys(value).forEach(key => {
        console.log(`key: ${key}, value: ${value[key]}`)
        this.param[key] = value[key]
      })
    },
    /**
     * 目標ラップタイムが同じ場合は表示しない（テキストボックスで変更できるようにする）
     * @param {number} time
     * @param {number} index
     * @param {string} target 'plan' or 'result'
     */
    lapTime (time, index, target = 'plan') {
      if (index === 0
          || (this.bothLaps[target][index]?.lapTime ?? 1) !== (this.bothLaps[target][index-1]?.lapTime ?? 2)
      ) {
        return this.secToMS(time)
      }
      return '↑'
    },
    lapTimeResult (sec, index) {
      if (sec < 0) {
        return '--:--.---'
      }
      return DateLib.secToMS(sec, true)
    },
    fuelConsumption (v, index, target = 'plan') {
      if (index === 0
          || (parseInt((this.bothLaps[target][index]?.fuelConsumption ?? 1) * 100) !==
              parseInt((this.bothLaps[target][index-1]?.fuelConsumption ?? 2) * 100))
      ) {
        return this.fmtFloat(v)
      }
      return '↑'
    },
    fuelConsumptionResult (v) {
      if (parseInt(v) < 0) {
        return '---'
      }
      return this.fmtFloat(v)
    },
    tireStint (v, index, target = 'plan') {
      if (index === 0
          || (this.bothLaps[target][index]?.tireStint ?? 1) !== (this.bothLaps[target][index-1]?.tireStint ?? 2)
      ) {
        return v
      }
      return '↑'
    },
    driverId (v, index) {
      return v !== -1 ? v : '---'
    },
    resultClass (isPlan) {
      return isPlan ? '' : ['result-row']
    },
    lapRowClass (lap) {
      const classes = []
      if (!(lap?.isPlan ?? false)) {
        classes.push('result-row')
      }
      if (lap?.pitIn ?? false) {
        classes.push('pit-in')
      }
      if (lap?.pitOut ?? false) {
        classes.push('pit-out')
      }
      return classes
    }
  }
}
</script>

<style scoped lang="scss">
.header-plan {
  background-color: #535bf2;
}
.header-result {
  background-color: darkmagenta;
}

button {
  margin: 1em auto;
}
td {
  &.pit-in {
    background-color: darkorchid;
  }
  &.pit-out {
    background-color: darkgreen;
  }
  input[type="text"] {
    width: 8em;
  }
  &.result-row {
    color: chartreuse;
  }
  span.arrow {
    color: darkgray;
  }
}
</style>
