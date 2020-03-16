<template>
  <div>
    <section id="Main">

      <ul id="SubjectList">
        <li v-for="(subj, i) in selectable" :key="i"
        @click="selectSubject(i)" :class="{selected: subj.selected}">
          <span class="selectable">
            <span class="teacherName">{{ subj.teacherName }}</span>
            <span class="subjName">{{ subj.subjName }}</span>
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
        <ul id="Hours">
          <li v-for="hourNum in 12" :key="hourNum">
            <span>{{ hourNum }}</span>
          </li>
        </ul>
        <ul id="Days">
          <li v-for="day in 5" :key="day">
            <ul>
              <li v-for="hour in 12" :key="hour"
              @click="insertSubj(day, hour)">
                <span v-if="hours[day-1][hour-1]">
                  {{ hours[day - 1][hour - 1].teacherName }}
                </span>
               <span v-if="hours[day-1][hour-1]">
                  {{ hours[day - 1][hour - 1].subjName }}
                </span>
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
      selectable: []
    }
  },
  created() {
  },
  methods: {
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
      margin-left: 5px;
      background-color: green;
      padding: 3px;
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

#Schedule {
  @include centerXY;
  background-color: gray;
  display: grid;
  grid-template-columns: 5% 95%;
  width: 90%;
  #Hours {
    background-color: paleturquoise;
  }
  #Days {
    display: grid;
    grid-template-columns: 20% 20% 20% 20% 20%;
    background-color: palegreen;
    ul {
      border: 1px dashed orangered;
      li {
        position: relative;
        height: 30px;
        border: 1px solid rgba(0, 0, 0, 0.2);
        span, input {
          @include centerXY;
        }
      }
    }
  }
}



</style>