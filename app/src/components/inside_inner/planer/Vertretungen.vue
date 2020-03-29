<template>
  <div>
    <div id="blurVertretungen" v-if="!dayIsClicked"></div>

    <ul id="Vertretungen">
      <!-- Topper Info -->
      <div class="TopperInfo">
        <li v-for="(topperInfo, t) in topperInfos" :key="t">
          <div>{{ topperInfo }}</div>
        </li>
      </div>

      <!-- Vertretung -->
      <li class="Vertretung" v-for="(vertretung, v) in vertretungen" :key="v">
        <!-- Art -->
        <div class="Type">
          <Select :options="types" selType="Default"
          @optionSelected="typeSelected($event, v)"/>
        </div>
        <!-- Datum -->
        <div class="Date">
          <span>{{ vertretung.date }}</span>
          <img src="@/assets/icons/calendar.svg" @click="toggleCalendar(v)">
        </div>
        <!-- Stunden -->
        <div class="Hours">
          <!-- From -->
          <Select :options="hourNumberList" selType="Default" id="SelectHour"
          @optionSelected="hourSelected($event, 'fHour', v)"/>
          <span>&</span>
          <!-- From -->
          <Select :options="hourNumberList" selType="Default" id="SelectHour"
          @optionSelected="hourSelected($event, 'lHour', v)"/>
        </div>
        <!-- Klasse -->
        <div class="Class">
          <Select :options="classes" selType="Class"
          @optionSelected="classSelected($event, v)"/>
        </div>

        <!-- Lehrer und/oder Fach -->
        <div class="Subject">
          <div class="blurOption" v-if="showOption(v, 'Teacher')"></div>
          <select class="withoutSubj" v-if="onlyTeacherSelector(v)">
            <option>-</option>
            <option v-for="(teacher, i) in teachers" :key="i">
              {{ teacher.name }}
            </option>
          </select>
          <ul class="withSubject" v-if="!onlyTeacherSelector(v)">
            <li v-for="(teacher, i) in teachers" :key="i">
              <ul>
                <li v-for="(subj, s) in teacher.subjects" :key="s">
                  {{ `${teacher.name} ${subj.name}` }}
                </li>
              </ul>
            </li>
          </ul>
        </div>

        <!-- Raum -->
        <div class="Room">
          <div class="blurOption" v-if="showOption(v, 'Room')"></div>
          <select v-model="vertretung.room">
            <option>-</option>
            <option v-for="(room, i) in rooms" :key="i">
              {{ `${room.name} (${room.type})` }}
            </option>
          </select>
        </div>

        <!-- Info -->
        <div class="Info">
          <div class="blurOption" v-if="showOption(v, 'Info')"></div>
          <input placeholder="Info Text...">
        </div>

        <!-- Löschen -->
        <div class="Delete">
          <button>del</button>
        </div>

      </li>
      <!-- Add new Vertretung -->
      <li>
        <button @click="addVertretung()">Add</button>
      </li>
    </ul>

    <div v-if="!dayIsClicked">
      <FunctionalCalendar id="_FunctionalCalendar" 
      v-model="calendarData" 
      :configs="calendarConfigs" />
    </div>

  </div>
</template>

<script>
import Vue from 'vue'
import { mapActions } from 'vuex'
import config from '@/includes/js/config'
import axios from 'axios'
import { FunctionalCalendar } from 'vue-functional-calendar';
Vue.use(FunctionalCalendar)
import Select from '@/components/global/Select'
const log = console.log

export default {
  name: 'Vertretungen',
  components: { FunctionalCalendar, Select },
  data() {
    return {
      topperInfos: ['Art', 'Datum', 'Stunden', 'Klasse', 'Fach', 'Raum', 'Info', ''],
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
    hourNumberList() {
      let list =  [...Array(10).keys()]
      let newList = list.map(x => {
        return ++x
      })

      newList.unshift('-')

      return newList
    },
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
    ...mapActions([
      'fetchClasses',
      'fetchTeachers',
      'fetchRooms'
    ]),
    classSelected(_class, i) {
      this.vertretungen[i].class = _class
    },
    typeSelected(val, i) {
      this.vertretungen[i].type = val
    },
    hourSelected(val, hourType, i) {
      if (hourType === 'fHour') this.vertretungen[i].fHour = val
      else this.vertretungen[i].lHour = val
    },
    onlyTeacherSelector(i) {
      if (this.vertretungen[i].type === 'Betreuung') {
        return true
      } else {
        return false
      }  
    },
    showOption(i, optionType) {
      switch (this.vertretungen[i].type) {
        case 'Entfall':
          if (optionType === 'Teacher' || 
              optionType === 'Room' || 
              optionType === 'Info')
          {
            log("entfall")
            return true
          }
        case 'Raumänderung':
          if (optionType === 'Teacher' || optionType === 'Info') {
            log("Raumänderung")
            return true
          }
          if (optionType === 'Room') {
            return false
          }
        case 'Info':
          if (optionType === 'Teacher' || optionType === 'Room') {
            log("Info")
             return true
          }
        case 'Vert. ohne Lehrer':
          if (optionType === 'Teacher') {
             return true
          }
        default:
          return false
      }
    },
    calendarDataFixed(selectedDate) {
      const calendarDate = selectedDate

      const day = new Date(calendarDate).getDay(); 

      const weekday = this.weekdays[day]

      const dateArr = calendarDate.split('-')
      const formattedDay = `${dateArr[1]}.${dateArr[0]}`


      return `${formattedDay} (${weekday})`
    },
    toggleCalendar(vertretungIndex) {
      this.vertretungIndex = vertretungIndex
      this.dayIsClicked = false
      this.$store.commit('setDayClicked', false)
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
    }
  },
  async created() {
    this.$store.subscribe(async(mutation, state) => {
      if (mutation.type === 'setDayClicked') {
        this.dayIsClicked = state.dayIsClicked
      }

      if (mutation.type === 'addTeachers') {
        this.teachers = state.teachers
      }

      if (mutation.type === 'setRooms') {
        this.rooms = state.rooms
      }

      if (mutation.type === 'setClasses') {
        this.classes = state.classes
      }
    })

    this.classes = await this.fetchClasses()
    this.teachers = await this.fetchTeachers()
    this.rooms = await this.fetchRooms()
  }
}
</script>

<style lang="scss" scoped>
@import '@/includes/scss/centerXY';

#SelectHour {
  width: 45px !important;
  // border-radius: 3px !important;
}

select {
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  background-color: transparent;
}

#blurVertretungen {
  z-index: 10;
  @include centerXY;
  width: 85%;
  height: 80%;
  background-color: rgba(0, 0, 0, 0.6);
}

#_FunctionalCalendar {
  z-index: 20;
  @include centerXY;
}

.TopperInfo {
  display: flex; justify-content:center; align-items: center;
  background-color: rgb(98, 132, 160);
  display: grid;
  height: 50px;
  grid-template-columns: 3fr 3fr 2.5fr 1fr 3fr 3fr 2fr 1fr;
  border-top-left-radius: 7px;
  border-top-right-radius: 7px;
  div {
    border: 1px solid black;
  }
}

ul#Vertretungen {
  @include centerXY;
  width: 85%;
  height: 80%;
  background-color: white;
  border-radius: 7px;
  li.Vertretung {
    display: flex; justify-content:center; align-items: center;
    background-color: rgba(0, 0, 0, 0.2);
    display: grid;
    height: 35px;
    grid-template-columns: 3fr 3fr 2.5fr 1fr 3fr 3fr 2fr 1fr;
    div {
      display: flex; justify-content:center; align-items: center;
      position: relative;
      height: 100%;
      width: 100%;
      border: 1px solid black;
      .blurOption {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.4) !important;
      }
    }
  }
}

.calendarToggler {
  border: none !important;
}

#_FunctionalCalendar {
  position: absolute;
}

.Type {
  select {
    width: 90%;
  }
}
.Date {
  img {
    height: 30px;
  }
}
.Subject {
  select {
    width: 90%;
  }
}
.Room {
  select {
    width: 90%;
  }
}
.Info {
  input {
    width: 90%;
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