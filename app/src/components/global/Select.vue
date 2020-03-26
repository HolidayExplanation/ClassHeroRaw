<template>
  <div>
    <ul id="List" @click="toggleList()">
      <li id="selected">
        <span>{{ selected }}</span>
      </li>
      <li class="option" v-show="listOpen" @click="emitOptionValue()"
      v-for="(option, i) in options" :key="i">
        <span>{{ option }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
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
    emitOptionValue(optionValue) {
      this.toggleList()
      this.$emit('optionValue', optionValue);
    }
  },
  mounted() {
    this.selected = this.options[0]
  }
}
</script>

<style lang="scss" scoped>
@import '@/includes/scss/flexCenterY';

div {
  width: 100%;
}

ul#List {
  z-index: 10;
  width: 80%;
  height: 30px;
  background-color: rgb(153, 131, 131);
  li:nth-child(1) {
    @include flexCenterY;
    background-color: whitesmoke;
    height: 30px;
    width: 100%;
    span {
      margin-left: 10px;
    }
  }
  li.option {
    width: 100%;
    height: 100%;
    border: 1px solid black;
    background-color: #000;
    background-color: #ea4c89;
    background-color: #0057ff;
    background-color: #32c766;
    background-color: #f48024;
    background-color: #006400;
    border-radius: 4px 4px 0 0;
    span {

    }
  }
}
</style>