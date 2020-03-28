<template>
  <div>
    <ul id="List" @click="toggleList()">
      <li id="selected" v-if="selected">
        <span id="selectedVal" v-if="selType === 'Default'">
          {{ selected }}
        </span>
        <span id="selectedVal" v-if="selType === 'Subject'">
          Fach hinzufügen
        </span>
        <span id="selectedVal" v-if="selType === 'Teacher'" v-show="selected">
          {{ 
            selected.username?
            `${selected.username}`:
            'Klassenlehrer auswählen' 
          }}
        </span>
        <div id="chevron">
          <i class="fas fa-chevron-down"></i>
        </div>
      </li>
      <div v-if="listOpen && selType === 'Default'">
        <li class="option" 
        v-for="(option, i) in options" :key="i"
        @click="send(i)">
          <span >
            {{ option }}
          </span>
        </li>
      </div>

      <div v-if="listOpen && selType === 'Subject'">
        <li class="option" 
        v-for="(option, i) in options" :key="i"
        @click="send(i)">
          <span>
            {{ `${option.teacherName} ${option.name}` }}
          </span>
        </li>
      </div>

      <div v-else-if="listOpen && selType === 'Teacher'">
        <li class="option" 
      v-for="(option, i) in options" :key="i"
      @click="send(i)">
        <span >
          {{ option.username }}
        </span>
      </li>
      </div>
    </ul>
  </div>
</template>

<script>
const log = console.log

export default {
  name: 'Select',
  props: ['options', 'selType'],
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
      log(this.options[i])
      
      if (this.selType === 'Teacher') {
        this.selected.username = this.options[i].username
      } else {
        this.selected = this.options[i]
      }

      log(this.selected)
      this.$emit('optionSelected', this.options[i])
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

ul#List {
  height: 30px;
  width: 95%;
  li:nth-child(1) {
    @include flexCenterY;
    background-color: #808db3;
    cursor: pointer;
    transition: .15s ease;
    &:hover {
       background-color: rgb(228, 228, 228);
    }
    span#selectedVal {
      width: 80%;
    }
    div#chevron {
      @include flexCenterY;
      height: 30px;
      width: 30px;
      padding-right: 5px;
      margin-left: auto;
    }
  }
  li.option {
    @include flexCenter;
    width: 100%;
    height: 100%;
    background-color: #f0f0f0;
    cursor: pointer;
    padding: 3px 0 3px 0;
    transition: .15s ease;
    &:hover {
      background-color: #32c766;
    }
  }
}

</style>