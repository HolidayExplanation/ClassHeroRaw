<template>
  <div id="Main">
    <span v-if="msg" :class="{good: type === 'good'}">
      {{ msg }}
    </span>
  </div>
</template>

<script>
import func from '@/includes/js/functions'
const log = console.log

export default {
  name: 'UpdateInfo',
  data() {
    return {
      user: null,
      msg: null,
      type: null
    }
  },
  created() {
     this.$store.subscribe(async(mutation, state) => {
      if (mutation.type === 'setUpdateInfoMsg') {
        this.msg = state.updateInfo.msg
        this.type = state.updateInfo.type

        setTimeout(() => {
          const payload = {
            msg: null,
            type: null
          }

          this.$store.commit('setUpdateInfoMsg', payload)
        }, 3500)
      }
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/includes/scss/centerXY';

#Main {
  position: relative;
}

span {
  @include centerXY;
  color: rgba(0, 0, 0, 0.6);
  padding: 5px 20px 5px 20px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 5px;
  background-color: orangered;  
}

.good {
  background-color: limegreen !important;
}

</style>