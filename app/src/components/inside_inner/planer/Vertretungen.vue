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
      <li class="Vertretung" v-for="(vertretung, v) in vertretungen" :key="v">

        <div class="Type">
          <select v-model="vertretung.type">
            <option v-for="(type, i) in types" :key="i">
              {{ type }}
            </option>
          </select>
        </div>
        <div class="Date">
          <span>{{ vertretung.date }}</span>
          <img src="@/assets/icons/calendar.svg" @click="toggleCalendar(v)">
        </div>
        <div class="Hours">
          <!-- From -->
          <select v-model="vertretung.fHour">
            <option>-</option>
            <option v-for="num in 12" :key="num">
              {{ num }}
            </option>
          </select>

          <span>&</span>

          <!-- From -->
          <select v-model="vertretung.lHour">
            <option>-</option>
            <option v-for="num in 12" :key="num">
              {{ num }}
            </option>
          </select>
        </div>
        <div class="Class">
          <select v-model="vertretung.class">
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
        <div class="Room">
          <select v-model="vertretung.room">
            <option>-</option>
            <option v-for="(room, i) in rooms" :key="i">
              {{ `${room.name} (${room.type})` }}
            </option>
          </select>
        </div>
        <div class="Info">
          <input placeholder="Info Text...">
        </div>
        <div class="Delete">
          <button>del</button>
        </div>

      </li>
      <!-- Add new Vertretung -->
      <li>
        <button @click="addVertretung()">Add</button>
      </li>
    </ul>

    <div id="CalendarContainer" v-if="!dayIsClicked">
      <FunctionalCalendar id="_FunctionalCalendar" 
      v-model="calendarData" 
      :configs="calendarConfigs" />
    </div>

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
      teachers: [],
      rooms: [],
      dayIsClicked: true,
      vertretungIndex: 0
    }
  },
  watch: {
    calendarData: function(calendarData) {
      log(this.vertretungen[this.vertretungIndex])
      this.vertretungen[this.vertretungIndex].date = this.calendarDataFixed(calendarData.selectedDate)
    }
  },
  computed: {
    getTodaysDate() {
      const date = new Date()
      const day = date.getDay()+1

      const dayOfMonth = date.getDate()
      const month = date.getMonth()+1 

      const weekday = this.weekdays[date.getDay()]
      
      log(dayOfMonth)

      return `${dayOfMonth}.${month} (${weekday})`
    }
  },
  methods: {
     calendarDataFixed(selectedDate) {
      const calendarDate = selectedDate

      const day = new Date(calendarDate).getDay(); 

      const weekday = this.weekdays[day]

      const dateArr = calendarDate.split('-')
      const formattedDay = `${dateArr[1]}.${dateArr[0]}`


      return `${formattedDay} (${weekday})`
    },
    addVertretung() {
      this.vertretungen.unshift({
        type: 'Vertretung',
        date: this.getTodaysDate,
        fHour: '-',
        lHour: '-',
        class: '-',
        teacher: '-',
        room: '-',
        info: null
      })
    },
    toggleCalendar(vertretungIndex) {
      this.vertretungIndex = vertretungIndex
      this.dayIsClicked = false
      this.$store.commit('setDayClicked', false)
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
    },
    async fetchRooms() {
      const res = await axios.get(`${config.domain}/get-rooms`)

      this.rooms = res.data
      log(this.rooms)
    }
  },
  async created() {
    this.$store.subscribe(async(mutation, state) => {
      if (mutation.type === 'setDayClicked') {
        this.dayIsClicked = state.dayIsClicked
      }
    })

    this.classes = this.$store.getters.getClasses

    if (this.classes.length === 0) {
      const classes = await axios.get(`${config.domain}/get-classes`)
      this.classes = classes.data
    }

    this.fetchTeacherAccounts()
    this.fetchRooms()
  }
}
</script>

<style lang="scss" scoped>
@import '@/includes/scss/centerXY';

#CalendarContainer {
  position: relative;
}

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
.Delete {
  button {
    background-color: red;
    padding: 3px;
    border: 1px solid black;
    border-radius: 3px;
    box-shadow: 1px 1px 3px 1px rgba(0, 0, 0, 0.2);
  }
}

</style>