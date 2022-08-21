<template>

</template>

<script>
import { defineComponent } from 'vue'
import DateLib from '../../lib/date'

export default defineComponent({
  name: 'Util',
  methods: {
    secToHMS (sec) {
      const _sec = sec > 0 ? sec : 0
      return DateLib.secToHMS(_sec)
    },
    secToMS (sec, withMilli = false) {
      return DateLib.secToMS(sec, withMilli)
    },
    fmtFloat (num, digit = 2) {
      if (num == null) {
        return '0.00'
      }
      return num.toFixed(digit)
    }
  }
})
</script>

<style scoped>

</style>
