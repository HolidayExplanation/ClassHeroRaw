<template>
  <div>
    <section id="Main">

      <div id="draggable" draggable ondragover="console.log('hello')">draggable</div>

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
              <li v-for="hour in 12" :key="hour" @mouseover="checkEnter(day, hour)">
                {{ hours[day - 1][hour - 1] }}

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
        ['benn', 'ebr'], ['ebr'], ['fsa'], ['fsa'], ['fsa']
      ],
      classes: [],
      teachers: [],
      rooms: [],
      isDragging: false
    }
  },
  created() {
  },
  methods: {
    drag() {
      this.isDragging = true
      log(this.isDragging)
    },
    checkEnter(day, hour) {
      console.log(day, hour)
    },
    selectRoom(value) {
      log(value)
    },
    ...mapActions([
      'fetchClasses', 
      'fetchTeachers'
    ])
  },
  async created() {
    this.classes = await this.fetchClasses()
    this.teachers = await this.fetchTeachers()
  }
}
</script>

<style lang="scss" scoped>
@import '@/includes/scss/centerXY';

#draggable {
  background-color: palevioletred;
  padding: 5px;
  display: inline;
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
    }
  }
}

li {
  position: relative;
  height: 30px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  span, input {
    @include centerXY;
  }
}

</style>