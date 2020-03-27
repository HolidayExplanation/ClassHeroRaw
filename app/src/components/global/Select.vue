<template>
  <div>
    <ul id="List" @click="toggleList()">
      <li id="selected">
        <span id="selectedVal">{{ selected }}</span>
        <div id="chevron">
          <i class="fas fa-chevron-down"></i>
        </div>
      </li> 
      <li class="option" v-show="listOpen" 
      v-for="(option, i) in options" :key="i"
      @click="send(i)">
        <span>{{ option }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
const log = console.log

export default {
  name: 'Select',
  props: ['options'],
  data() {
    return {
      selected: null,
      listOpen: false
    }
  },
  methods: {
    toggleList() {
      this.listOpen = !this.listOpen
    },
    send(i) {
      this.selected = this.options[i]
      this.$emit('optionSelected', this.options[i]);
    }
  },
  mounted() {
    this.selected = this.options[0]
  }
}
</script>

<style lang="scss" scoped>
@import '@/includes/scss/flexCenterY';
@import '@/includes/scss/flexCenter';

// div {
//   width: 100%;
// }

ul#List {
  z-index: 10;
  height: 30px;
  width: 100% !important;
  li:nth-child(1) {
    @include flexCenterY;
    background-color: whitesmoke;
    cursor: pointer;
    transition: .15s ease;
    &:hover {
       background-color: rgb(228, 228, 228);
    }
    span#selectedVal {
      width: 80%;
    }
    div#chevron {
      @include flexCenter;
      height: 30px;
      width: 30px;
      padding-right: 5px;
    }
  }
  li.option {
    @include flexCenter;
    width: 100%;
    height: 100%;
    background-color: #f0f0f0;
    cursor: pointer;
    transition: .15s ease;
    &:hover {
      background-color: #32c766;
    }
  }
}

option {
  background-color: #000;
  background-color: #ea4c89;
  background-color: #0057ff;
  background-color: #32c766;
  background-color: #f48024;
  background-color: #006400;
}
</style>