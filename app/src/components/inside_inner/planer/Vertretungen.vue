<template>
  <div>
    <ul id="Vertretungen">
      <li class="TopperInfo">
        <div>Art</div>
        <div>Datum</div>
        <div>Stunden</div>
        <div>Klasse</div>
        <div>Fach</div>
        <div>Raum</div>
        <div>Info</div>
        <div></div>
      </li>
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
          <div @click="toggleCalendar()" class="calendarToggler">
            <FunctionalCalendar id="_FunctionalCalendar" v-if="calendarOpen" v-model="calendarData" :configs="calendarConfigs" />
          </div>
        </div>
        <div class="Hours">
          <!-- From -->
          <select>
            <option>-</option>
            <option v-for="num in 12" :key="num">
              {{ num }}
            </option>
          </select>

          <span>&</span>

          <!-- From -->
          <select>
            <option>-</option>
            <option v-for="num in 12" :key="num">
              {{ num }}
            </option>
          </select>
        </div>
        <div class="Class">
          <select>
            <option v-for="(_class, i) in classes" :key="i">
              {{ _class.name }}
            </option>
          </select>
        </div>
        <div class="Fach">
          <select class="withoutSubj">
            <option v-for="(teacher, i) in teachers" :key="i">
              {{ teacher.name }}
            </option>
          </select>
        </div>
        <div class="Room">7</div>
        <div class="Info">8</div>
        <div class="Delete">9</div>

      </li>
      <!-- Add new Vertretung -->
      <li>
        <button @click="addVertretung()">Add</button>
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
      vertretungen: [],
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
      weekdays: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
      teachers: []
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
    addVertretung() {
      this.vertretungen
    },
    toggleCalendar() {
      this.calendarOpen = !this.calendarOpen
    },
    async fetchTeacherAccounts() {
      const teachers = this.$store.getters.getDBTeachers

      if (teachers.length === 0) {
        // Attempt getting Teachers from Database
        let response = await axios.get(`${config.domain}/fetch-teacher-accounts-scheduler`)
        this.$store.commit('addTeachers', response.data)

        this.teachers = response.data
    
        this.sortTeachersByLastName()
      }
    },
    sortTeachersByLastName() {
      // Sort teacher array by first name
      this.teachers.sort(function(a, b) {
        return (a.lastName > b.lastName) ? 1 : ((b.lastName > a.lastName) ? -1 : 0)
      })
    }
  },
  async created() {
    this.classes = this.$store.getters.getClasses

    if (this.classes.length === 0) {
      const classes = await axios.get(`${config.domain}/get-classes`)
      this.classes = classes.data
    }

    this.fetchTeacherAccounts()
  }
}
</script>

<style lang="scss" scoped>
@import '@/includes/scss/centerXY';

.TopperInfo {
  display: flex; justify-content:center; align-items: center;
  background-color: gray;
  display: grid;
  height: 50px;
  grid-template-columns: 3fr 4fr 2fr 1fr 3fr 1fr 3fr 1fr;
}

ul#Vertretungen {
  @include centerXY;
  width: 85%;
  height: 80%;
  background-color: gray;
  li.Vertretung {
    display: flex; justify-content:center; align-items: center;
    background-color: rgba(0, 0, 0, 0.2);
    display: grid;
    height: 35px;
    grid-template-columns: 3fr 4fr 2fr 1fr 3fr 1fr 3fr 1fr;
    div {
      display: flex; justify-content:center; align-items: center;
      height: 100%;
      border: 1px solid black;
    }
  }
}

.calendarToggler {
  border: none !important;
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