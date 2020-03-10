<template>
  <div>
    <ul id="Vertretungen">
      <li class="Vertretung">

        <div class="Type">
          <select>
            <option v-for="(type, i) in types" :key="i">
              {{ type }}
            </option>
          </select>
        </div>
        <div class="Date">
          <span v-if="calendarData">{{ calendarDataFixed }}</span>
          <span v-else>{{ getTodaysDate }}</span>
          <img src="@/assets/icons/calendar.svg" @click="toggleCalendar()">
          <div @click="toggleCalendar()">
            <FunctionalCalendar id="_FunctionalCalendar" v-if="calendarOpen" v-model="calendarData" :configs="calendarConfigs" />
          </div>
          
        </div>
        <div class="Hours">3</div>
        <div class="Class">
          <select>
            <option v-for="(_class, i) in classes" :key="i">
              {{ _class.name }}
            </option>
          </select>
        </div>
        <div class="Subject">5</div>
        <div class="Teacher">6</div>
        <div class="Room">7</div>
        <div class="Info">8</div>
        <div class="Delete">9</div>

      </li>
      <!-- Add new Vertretung -->
      <li>
        <button>Add</button>
      </li>
    </ul>

  </div>
</template>

<script>
import Vue from 'vue'
import {FunctionalCalendar} from 'vue-functional-calendar';
Vue.use(FunctionalCalendar)

import axios from 'axios'
import config from '@/includes/js/config'
const log = console.log

export default {
  name: 'Vertretungen',
  components: { FunctionalCalendar },
  data() {
    return {
      types: ['Vertretung', 'Entfall', 'Raumänderung', 'Info', 'Betreuung', 'Vert. ohne Lehrer'],
      loaded: [],
      classes: [],
      calendarData: null,
      calendarConfigs: {
        sundayStart: false,
        dateFormat: 'mm-dd-yyyy',
        isDatePicker: true,
        isDateRange: false
      },
      calendarOpen: false,
      weekdays: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
    }
  },
  computed: {
    calendarDataFixed() {
      const calendarDate = this.calendarData.selectedDate

      const day = new Date(calendarDate).getDay(); 

      const weekday = this.weekdays[day]

      const dateArr = calendarDate.split('-')
      const formattedDay = `${dateArr[1]}.${dateArr[0]}`


      return `${formattedDay} (${weekday})`
    },
    getTodaysDate() {
      const date = new Date()
      const day = date.getDay()+1
      const month = date.getMonth()+1 
      const weekday = this.weekdays[date.getDay()]

      return `${day}.${month} (${weekday})`
    }
  },
  methods: {
    toggleCalendar() {
      this.calendarOpen = !this.calendarOpen
    }
  },
  async created() {
    this.classes = this.$store.getters.getClasses

    if (this.classes.length === 0) {
      const classes = await axios.get(`${config.domain}/get-classes`)
      this.classes = classes.data
    }

    const data = {
      
    }
    // const res = await axios.post(`${config.domain}/name`, data)
  }
}
</script>

<style lang="scss" scoped>
@import '@/includes/scss/centerXY';

ul#Vertretungen {
  @include centerXY;
  width: 85%;
  height: 80%;
  background-color: gray;
  li.Vertretung {
    display: flex; justify-content:center; align-items: center;
    background-color: rgba(0, 0, 0, 0.2);
    display: grid;
    height: 40px;
    grid-template-columns: 3fr 4fr 1fr 2.5fr 1fr 3fr 1fr 3fr 1fr;
  }
}

#_FunctionalCalendar {
  position: absolute;
}

.Date {
  img {
    height: 30px;
  }
}

</style>