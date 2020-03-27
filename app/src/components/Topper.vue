<template>
  <div id="Main" v-if="user">
    <div id="container">
      <span>
        {{ user.accountType === 'planer' ? 
          user.username:
          `${user.name}`
        }}
      </span>
      <img id="avatar" src="@/assets/icons/user_purple.svg">
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
  padding-left: 20px;
  span {
    @include Unselectable;
    color: #f0f0f0;
    float: right;
  }
  img#avatar {
    height: 26px;
    float: left;
    margin-left: 7px;
    border-radius: 100%;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-radius: 100%;
    background-color: #f0f0f0;
    cursor: pointer;
    transition: .15s ease;
    // border: 5px solid transparent;
    &:hover {
      border: 4px dashed #a0a8d6 !important;
      border-radius: 100%;
      background-color: #a0a8d6;
    }
  }
}

</style>