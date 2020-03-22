<template>
  <div>
    <button class="closeRoomList" v-if="roomListActive" @click="closeRoomList()">
      Raumliste schließen
    </button>
    <RoomSelector @selected="assignRoom" v-if="roomListActive"/>

    <div id="Blur" v-if="roomListActive"></div>

    <section id="Main" @contextmenu.prevent>

      <div id="ClassSelector">
        <Select :classes="classes"
        @classSelected="fetchClassSchedule"/>
      </div>

      <ul id="SubjectList">
        <li v-for="(subj, i) in selectable" :key="i" :style="{backgroundColor: chooseColor(i, 'List')}"
        @click="selectSubject(i)" :class="{selected: subj.selected}">
          <span class="selectable">
            <span class="teacherName">{{ subj.teacherName }}</span>
            <span class="subjName" :style="{backgroundColor: chooseColor(i, 'Subject')}">
              {{ subj.name }}
            </span>
          </span>
        </li>
      </ul>
      
      <div id="Schedule">
        <!-- Hours -->
        <ul id="HourList">
          <li v-for="hourNum in 12" :key="hourNum">
            <span>{{ hourNum }}</span>
          </li>
        </ul>
        <ul id="Days">
          <li v-for="(n, day) in 5" :key="day">
            <ul id="Hours">
              <li v-for="(n, hour) in 12" :key="hour">
                <div class="items" v-if="hours[day][hour]"
                @mousedown.left="insertSubj(day, hour)"
                @mousedown.right="clearField(day, hour)"
                :style="{backgroundColor: chooseScheduleColor(hours[day][hour], 'List')}">
                  <span class="hourTeacherName">
                    {{ hours[day][hour].teacherName }}
                  </span>
                  <span class="hourSubjName" :style="{backgroundColor: chooseScheduleColor(hours[day][hour], 'Subject')}">
                    {{ hours[day][hour].name }}
                  </span>
                </div>
                <div v-else class="fieldPlaceholder" @mousedown.left="insertSubj(day, hour)">
                  -
                </div>
                <span v-if="hours[day][hour]" 
                @click="openRoomSelector(day, hour)">
                  {{ 
                    hours[day][hour].room?
                    hours[day][hour].room.name:
                    '-' 
                  }}
                </span>
              </li>
            </ul>
          </li>
        </ul>
      </div>

      <div id="Update" v-if="changed" @click="updateSchedule()">
        <button>Update</button>
      </div>
      
    </section>
  </div>
</template>

<script>
import Select from '@/components/global/Select'
import RoomSelector from './selectors/RoomSelector'
import axios from 'axios'
import config from '@/includes/js/config'
const log = console.log
import { mapActions } from 'vuex'

export default {
  name: 'Stundenplan',
  components: { Select, RoomSelector },
  data() {
    return {
      roomListActivated: false,
      roomListActive: false,
      selectedClass: null,
      hours: [[], [], [], [], []],
      classes: [],
      teachers: [],
      selectableReady: false,
      selectable: [],
      listColors: ['235, 64, 52', '50, 201, 30', '24, 156, 204', '105, 21, 189', '173, 18, 184',
       '227, 95, 0', '146, 227, 84', '255, 102, 153', '68, 66, 212', '50, 207, 186'],
      changed: false,
      selectedRoom: {
        day: null,
        hour: null
      },
      currentRoom: null,
      scheduleChanges: []
    }
  },
  methods: {
    ...mapActions([
      'fetchClasses'
    ]),
    async updateSchedule() {
      const data = null

      let response = await axios.post(`${config.domain}/update-schedule`, {
        classID: this.selectedClass._id,
        scheduleChanges: this.scheduleChanges
      })

      if (response.status === 200) {
        this.changed = false
        this.setInfo('Aktualisiert', 'good')
      } else {
        this.setInfo('Fehler', 'bad')
      }
    },
    async fetchAssignedSubjects() {
      let response = await axios.post(`${config.domain}/fetch-assigned-subjects`, {
        classID: this.selectedClass._id
      })

      this.selectable = []

      response.data.forEach((subject) => {
        this.selectable.push({
          ...subject,
          selected: false
        })
      })

      log(this.selectable)
    },
    async fetchClassSchedule(selectedClass) {
      this.selectedClass = selectedClass

      const classSchedule = await axios.post(`${config.domain}/get-class-schedule`, {
        classID: selectedClass._id
      })

      await this.fetchAssignedSubjects()

      if (classSchedule.data.length < 1) {
        this.hours = [[], [], [], [], []]
      } else {
        this.hours = classSchedule.data
      }

      log(this.hours)
    },
    closeRoomList() {
      this.roomListActive = false
    },
    assignRoom(room) {
      const day = this.selectedRoom.day
      const hour = this.selectedRoom.hour

      this.hours[day][hour].room = room
      this.roomListActive = false
      this.changed = true
      
      const subject = {
        ...this.selectedSubj,
        room
      }

      const subjectForPush = {
        _id: subject._id,
        name: subject.name,
        teacherID: subject.teacherID,
        teacherName: subject.teacherName,
        room: subject.room,
        day,
        hour
      }

      // Add change
      this.addChange(day, hour, subjectForPush)
    },
    openRoomSelector(day, hour) {
      this.selectedRoom.day = day
      this.selectedRoom.hour = hour
      this.roomListActive = true
    },
    clearField(day, hour) {
      this.hours[day][hour] = null
      this.$forceUpdate()
      this.changed = true
    },
    chooseColor(i, type) {
      if (type === 'List') {
        return `rgb(${this.listColors[i]})`
      } else {
        return `rgb(0, 0, 0, 0.2)`
      }
    },
    chooseScheduleColor(subj, type) {
      const i = this.selectable.findIndex(x => x.name === subj.name)
      
      if (type === 'List') {
        return `rgb(${this.listColors[i]})`
      } else {
        return `rgb(0, 0, 0, 0.2)`
      }
    },
    selectSubject(i) {
      this.selectable.forEach((subject) => {
        subject.selected = false
      })

      this.selectableReady = true

      this.selectable[i].selected = true // for CSS
      this.selectedSubj = this.selectable[i] // for JS
    },
    setInfo(msg, type) {
      const infoPayload = { msg, type }
      this.$store.commit('setUpdateInfoMsg', infoPayload)
    },
    addChange(day, hour, forPush) {
      log(day, hour)

      if (this.scheduleChanges.length === 0) {
        this.scheduleChanges.push(forPush)
        log('initial push')
      } else {
        this.scheduleChanges.forEach(change => {
        log('extra push')
        let i = 0
        if (change.day === forPush.day && change.hour === forPush.hour) {
            log('replaces')
            this.scheduleChanges[i] = forPush
          } else {
            log('pushes')
            this.scheduleChanges.push(forPush)
          }
          i++
        })
      }

      console.log(this.scheduleChanges)
    },
    insertSubj(day, hour) {
      if (!this.selectableReady) {
        this.setInfo('Wählen Sie bitte ein Fach zum einfügen!')
        throw new Error()
      }

      const subject = this.selectedSubj

      const subjectForPush = {
        _id: subject._id,
        name: subject.name,
        teacherID: subject.teacherID,
        teacherName: subject.teacherName,
        day,
        hour
      }

      // Add change
      this.addChange(day, hour, subjectForPush)

      this.hours[day][hour] = subjectForPush
      this.$forceUpdate()
      this.changed = true
    },
    transformToSelectable() {
      this.teachers.forEach(teacher => {
        if (teacher.subjects.length > 0) {
          teacher.subjects.forEach((subject) => {
            return this.selectable.push({
              subjectID: subject._id,
              teacherID: teacher._id,
              teacherName: teacher.name,
              subjName: subject.name,
              selected: false,
              room: null
            })
          })
        }
      })
    }
  },
  async created() {
    this.classes = await this.fetchClasses()

    this.transformToSelectable()
  }
}
</script>

<style lang="scss" scoped>
@import '@/includes/scss/centerXY';
@import '@/includes/scss/flexCenter';

button.closeRoomList {
  background-color: red;
  padding: 5px;
}

section#Main {
  @include centerXY;
  background-color: white;
  width: 90%;
  height: 90%;
  display: grid;
  grid-template-rows: 1fr 4fr 10fr;
}

#Blur {
  z-index: 10;
  @include centerXY;
  background-color: rgba(0, 0, 0, 0.4);
  width: 90%;
  height: 90%;
}

#SubjectList {
  // width: 90%;
  // height: 200px;
  display: inline-block;
  background-color: rgb(65, 65, 65);
  li {
    margin: 5px;
    display: inline-block;
    padding: 5px 15px 5px 15px;
    .subjName {
      border-radius: 3px;
      margin-left: 5px;
      padding: 3px 7px 3px 3px;
    }
  }
}

.selected {
  background-color: rgb(156, 156, 156) !important;
  .subjName {
    background-color: rgb(70, 68, 68) !important;
  }
}

span.selectable {
  color: whitesmoke;
}

$listHeight: 45px;

#Schedule {
  // @include centerXY;
  background-color: gray;
  display: grid;
  grid-template-columns: 5% 95%;
  // width: 90%;
  #HourList {
    li {
      background-color: paleturquoise;
      position: relative;
      height: $listHeight;
      border: 1px solid rgba(0, 0, 0, 0.2);
      span, input {
        @include centerXY;
      }
    }
  }
  #Days {
    display: grid;
    grid-template-columns: 20% 20% 20% 20% 20%;
    // background-color: palegreen;
    ul#Hours {
      position: relative;
      li {
        height: $listHeight;
        border: 1px solid rgba(0, 0, 0, 0.2);
        @include flexCenter;
        div.items {
          @include flexCenter;
          width: 95%;
          height: 85%;
          border-radius: 5px;
          span {
            font-size: 12px;
            padding: 3px;
            color: white;
          }
        }
        div.fieldPlaceholder {
          @include flexCenter;
          width: 95%;
          height: 85%;
          background-color: rgb(104, 104, 104);
        }
      }
    }
  }
}

</style>