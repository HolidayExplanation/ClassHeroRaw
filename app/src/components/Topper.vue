<template>
  <div id="Main" v-if="user">
    <div id="container">
      <span>
        {{ user.accountType === 'admin' || user.accountType === 'scheduler' ? 
          user.username:
          `${user.name}`
        }}
      </span>
      <img id="profileArrow" src="@/assets/icons/profile_arrow.svg">
    </div>
  </div>
</template>

<script>
import func from '@/includes/js/functions'
const log = console.log

export default {
  name: 'Topper',
  data() {
    return {
      user: null
    }
  },
  created() {
    this.user = func.getUser()
  }
}
</script>

<style lang="scss" scoped>
@import '@/includes/scss/Unselectable';
@import '@/includes/scss/centerY';

div#container {
  @include centerY;
  right: 50px;
  span {
    @include Unselectable;
    color: #f0f0f0;
  }
  img#profileArrow {
    position: absolute;
    height: 12px;
    right: -30px;
    padding: 5px;
    border-radius: 3px;
    cursor: pointer;
    transition: .15s ease;
    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }
}

</style>