<template>
  <div id="Main" v-if="user">
    <div id="container">
      <span>
        {{ user.accountType === 'planer' ? 
          user.username:
          `${user.name}`
        }}
      </span>
      <img id="profileArrow" src="@/assets/icons/user_purple.svg">
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
@import '@/includes/scss/flexCenterY';

div#container {
  @include centerY;
  @include flexCenterY;
  top: 22px;
  right: 20px;
  border-radius: 100px;
  background-color: rgb(32, 32, 34);
  padding: 5px 5px 5px 10px;
  span {
    @include Unselectable;
    color: #f0f0f0;
    float: right;
  }
  img#profileArrow {
    height: 26px;
    float: left;
    margin-left: 7px;
    border-radius: 3px;
    cursor: pointer;
    transition: .15s ease;
    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }
}

</style>