<template>
  <div>
    <input
        type="text"
        :name="elemName"
        :id="elemName"
        :value="value"
        @input="$emit('update:value', $event.target.value)"
    />
  </div>
</template>

<script type="ts">

import StringLib from '../../lib/string'

export default {
  name: 'Parameter',
  props: {
    value: {required: true},
    name: {type: String, required: true},
  },
  emits: [
    'update:value',
  ],
  computed: {
    elemName () {
      return StringLib.kebabCase(this.name)
    }
  }
}
</script>

<style scoped lang="scss">
</style>
