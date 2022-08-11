<template>
  <div>
    <table class="parameter">
      <tbody>
        <tr>
          <td class="title"><label :for="elemName('raceTime')">レース時間</label></td>
          <td class="form">
            <Parameter :value="raceTime"
                       name="raceTime"
                       @update:value="raceTime = $event"/>
          </td>
          <td class="unit">秒</td>
        </tr>

        <tr>
          <td class="title"><label :for="elemName('targetLapTime')">ターゲットラップタイム</label></td>
          <td class="form">
            <Parameter :value="targetLapTime"
                       name="targetLapTime"
                       @update:value="targetLapTime = $event"/>
          </td>
          <td class="unit">秒</td>
        </tr>

        <tr>
          <td class="title"><label :for="elemName('targetFuelConsumption')">ターゲット燃料消費量</label></td>
          <td class="form">
            <Parameter :value="targetFuelConsumption"
                       name="targetFuelConsumption"
                       @update:value="targetFuelConsumption = $event"/>
          </td>
          <td class="unit">L/ラップ</td>
        </tr>

        <tr>
          <td class="title"><label :for="elemName('fullFuel')">フルタンク容量</label></td>
          <td class="form">
            <Parameter :value="fullFuel"
                       name="fullFuel"
                       @update:value="fullFuel = $event"/>
          </td>
          <td class="unit">L</td>
        </tr>

        <tr>
          <td class="title"><label :for="elemName('planTireStint')">タイヤ交換</label></td>
          <td class="form">
            <Parameter :value="planTireStint"
                       name="planTireStint"
                       @update:value="planTireStint = $event"/>
          </td>
          <td class="unit">スティント毎</td>
        </tr>

        <tr>
          <td class="title"><label :for="elemName('pitThroughTime')">ピットスルーロスタイム</label></td>
          <td class="form">
            <Parameter :value="pitThroughTime"
                       name="pitThroughTime"
                       @update:value="pitThroughTime = $event"/>
          </td>
          <td class="unit">秒</td>
        </tr>

        <tr>
          <td class="title"><label :for="elemName('refillFuelTime')">燃料給油時間</label></td>
          <td class="form">
            <Parameter :value="refillFuelTime"
                       name="refillFuelTime"
                       @update:value="refillFuelTime = $event"/>
          </td>
          <td class="unit">秒</td>
        </tr>

        <tr>
          <td class="title"><label :for="elemName('tireReplacementTime')">タイヤ交換時間</label></td>
          <td class="form">
            <Parameter :value="tireReplacementTime"
                       name="tireReplacementTime"
                       @update:value="tireReplacementTime = $event"/>
          </td>
          <td class="unit">秒</td>
        </tr>

        <tr>
          <td class="title"><label :for="elemName('subSessionId')">SubSessionId</label></td>
          <td class="form">
            <Parameter :value="subSessionId"
                       name="subSessionId"
                       @update:value="subSessionId = $event"/>
          </td>
          <td class="unit"></td>
        </tr>

        <tr>
          <td class="title"><label :for="elemName('carIdx')">CarIdx</label></td>
          <td class="form">
            <Parameter :value="carIdx"
                       name="carIdx"
                       @update:value="carIdx = $event"/>
          </td>
          <td class="unit"></td>
        </tr>
      </tbody>
    </table>
  </div>

</template>

<script type="ts">

import Parameter from './Parameter.vue'
import StringLib from '../../lib/string'

const elemNames = {
  raceTime: 'raceTime',
  targetLapTime: 'targetLapTime',
  targetFuelConsumption: 'targetFuelConsumption',
  fullFuel: 'fullFuel',
  planTireStint: 'planTireStint',
  pitThroughTime: 'pitThroughTime',
  refillFuelTime: 'refillFuelTime',
  tireReplacementTime: 'tireReplacementTime',
  subSessionId: 'subSessionId',
  carIdx: 'carIdx',
}

export default {
  name: 'Parameters',
  components: {
    Parameter,
  },
  props: [
    'param',
  ],
  emits: [
      'update:param'
  ],
  setup (props) {
  },
  computed: {
    raceTime: {
      get () {
        return this.param.raceTime
      },
      set (value) {
        console.debug('raceTime set: ' + value)
        this.$emit('update:param', {raceTime: parseInt(value)})
      }
    },
    targetLapTime: {
      get () {
        return this.param.targetLapTime
      },
      set (value) {
        console.debug('targetLapTime set: ' + value)
        this.$emit('update:param', {targetLapTime: parseInt(value)})
      }
    },
    targetFuelConsumption: {
      get () {
        return this.param.targetFuelConsumption
      },
      set (value) {
        console.debug('targetFuelConsumption set: ' + value)
        this.$emit('update:param', {targetFuelConsumption: parseFloat(value)})
      }
    },
    fullFuel: {
      get () {
        return this.param.fullFuel
      },
      set (value) {
        console.debug('fullFuel set: ' + value)
        this.$emit('update:param', {fullFuel: parseInt(value)})
      }
    },
    planTireStint: {
      get () {
        return this.param.planTireStint
      },
      set (value) {
        console.debug('planTireStint set: ' + value)
        this.$emit('update:param', {planTireStint: parseInt(value)})
      }
    },
    pitThroughTime: {
      get () {
        return this.param.pitThroughTime
      },
      set (value) {
        console.debug('pitThroughTime set: ' + value)
        this.$emit('update:param', {pitThroughTime: parseInt(value)})
      }
    },
    refillFuelTime: {
      get () {
        return this.param.refillFuelTime
      },
      set (value) {
        console.debug('refillFuelTime set: ' + value)
        this.$emit('update:param', {refillFuelTime: parseInt(value)})
      }
    },
    tireReplacementTime: {
      get () {
        return this.param.tireReplacementTime
      },
      set (value) {
        console.debug('tireReplacementTime set: ' + value)
        this.$emit('update:param', {tireReplacementTime: parseInt(value)})
      }
    },
    subSessionId: {
      get () {
        return this.param.subSessionId
      },
      set (value) {
        console.debug('subSessionId set: ' + value)
        this.$emit('update:param', {subSessionId: parseInt(value)})
      }
    },
    carIdx: {
      get () {
        return this.param.carIdx
      },
      set (value) {
        console.debug('carIdx set: ' + value)
        this.$emit('update:param', {carIdx: parseInt(value)})
      }
    },
  },
  methods: {
    updateParam (data) {
      console.debug('data: '+data)
      this.$emit('update:param', {...props, ...data})
    },
    elemName (key) {
      return StringLib.kebabCase(elemNames[key])
    }
  }
}
</script>

<style scoped lang="scss">
.parameter {
  .title {
    text-align: right;
    padding-right: 1em;
  }
  .form {
  }
  .unit {
    text-align: left;
    padding-left: .3em;
  }
}
</style>
