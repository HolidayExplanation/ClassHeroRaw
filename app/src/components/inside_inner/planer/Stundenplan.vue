<template>
  <div>
    <section id="Main">

      <ul id="SubjectList">
        <li v-for="(subj, i) in selectable" :key="i" :style="{backgroundColor: chooseColor(i, 'List')}"
        @click="selectSubject(i)" :class="{selected: subj.selected}">
          <span class="selectable">
            <span class="teacherName">{{ subj.teacherName }}</span>
            <span class="subjName" :style="{backgroundColor: chooseColor(i, 'Subject')}">
              {{ subj.subjName }}
            </span>
          </span>
        </li>
      </ul>

      <div id="ClassSelector">
        <select>
          <option v-for="(_class, i) in classes" :key="i">
            {{ _class.name }}
          </option>
        </select>
      </div>

      <RoomSelector @selected="selectRoom" />
      
      <div id="Schedule">
        <!-- Hours -->
        <ul id="HourList">
          <li v-for="hourNum in 12" :key="hourNum">
            <span>{{ hourNum }}</span>
          </li>
        </ul>
        <ul id="Days">
          <li v-for="day in 5" :key="day">
            <ul id="Hours">
              <li v-for="hour in 12" :key="hour"
              @click="insertSubj(day, hour)">
                <div class="items" v-if="hours[day-1][hour-1]" 
                :style="{backgroundColor: chooseScheduleColor(hours[day-1][hour-1], 'List')}">
                  <span class="hourTeacherName">
                    {{ hours[day - 1][hour - 1].teacherName }}
                  </span>
                  <span class="hourSubjName" :style="{backgroundColor: chooseScheduleColor(hours[day-1][hour-1], 'Subject')}">
                    {{ hours[day - 1][hour - 1].subjName }}
                  </span>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </div>
      
    </section>
  </div>
</template>

<script>
import RoomSelector from './selectors/RoomSelector'
import axios from 'axios'
import config from '@/includes/js/config'
const log = console.log
import { mapActions } from 'vuex'

export default {
  name: 'Stundenplan',
  components: { RoomSelector },
  data() {
    return {
      hours: [
        [], [], [], [], []
      ],
      classes: [],
      teachers: [],
      rooms: [],
      selectable: [],
      listColors: ['#eb4034', '#32c91e', 'skyblue', 
      'purple', 'pink', '#00cc66', '#cc3399', '#ff6699', '#3399ff', 'yellow'],
      subjColors: ['#ad251c', '#239c13', 'skyblue', 
      'purple', 'pink', '#00cc66', '#cc3399', '#ff6699', '#3399ff', 'yellow']
    }
  },
  created() {
  },
  methods: {
    chooseColor(i, type) {
      if (type === 'List') {
        return this.listColors[i]
      } else {
        return this.subjColors[i]
      }
    },
    chooseScheduleColor(subj, type) {
      const i = this.selectable.findIndex(x => x.subjName === subj.subjName)

      if (type === 'List') {
        return this.listColors[i]
      } else {
        return this.subjColors[i]
      }
    },
    selectSubject(i) {
      this.selectable.forEach((subject) => {
        subject.selected = false
      })

      this.selectable[i].selected = true // for CSS
      this.selectedSubj = this.selectable[i] // for JS
    },
    insertSubj(d, h) {
      const day = d - 1
      const hour = h - 1

      this.hours[day][hour] = this.selectedSubj
      log(this.hours)
      this.$forceUpdate()
    },
    selectRoom(value) {
      log(value)
    },
    ...mapActions([
      'fetchClasses',
      'fetchTeachers'
    ]),
    transformToSubjects() {
      this.teachers.forEach(teacher => {
        if (teacher.subjects.length > 0) {
          teacher.subjects.forEach((subject) => {
            return this.selectable.push({
              teacherName: teacher.name,
              subjName: subject.name,
              selected: false
            })
          })
        }
      })
    }
  },
  async created() {
    this.teachers = await this.fetchTeachers()
    this.classes = await this.fetchClasses()

    this.transformToSubjects()
  }
}
</script>

<style lang="scss" scoped>
@import '@/includes/scss/centerXY';

#SubjectList {
  width: 90%;
  height: 200px;
  display: inline-block;
  background-color: gray;
  li {
    margin: 5px;
    display: inline-block;
    padding: 5px 15px 5px 15px;
    background-color: orange;
    .subjName {
      border-radius: 3px;
      margin-left: 5px;
      background-color: green;
      padding: 3px 7px 3px 3px;
    }
  }
}

.selected {
  background-color: indigo !important;
  .subjName {
    background-color: grey !important;
  }
}

span.selectable {
  color: whitesmoke;
}

@mixin flexCenter {
  display: flex;
  align-items: center;
  justify-content: center;
}

$listHeight: 45px;

#Schedule {
  @include centerXY;
  background-color: gray;
  display: grid;
  grid-template-columns: 5% 95%;
  width: 90%;
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
    background-color: palegreen;
    ul#Hours {
      position: relative;
      li {
        height: $listHeight;
        border: 1px solid rgba(0, 0, 0, 0.2);
        @include flexCenter;
        div.items {
          @include flexCenter;
          background-color: rgb(158, 158, 158);
          width: 95%;
          height: 85%;
          border-radius: 5px;
          span {
          font-size: 12px;
          padding: 3px;
          }
          .hourSubjName {
            // background-color: orangered;
          }
        }
      }
    }
  }
}

</style>