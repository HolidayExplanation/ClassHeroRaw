<template>
  <div>
    <section id="Main">

      <div id="ClassSelector">
        <select>
          <option v-for="(_class, i) in classes" :key="i">
            {{ _class.name }}
          </option>
        </select>
      </div>
      
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
              <li v-for="hour in 12" :key="hour">
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
import axios from 'axios'
import config from '@/includes/js/config'
const log = console.log
import { mapActions } from 'vuex'

export default {
  name: 'Stundenplan',
  data() {
    return {
      hours: [
        ['benn', 'ebr'], ['ebr'], ['fsa'], ['fsa'], ['fsa']
      ],
      classes: []
    }
  },
  methods: {
    ...mapActions([
      'fetchClasses', 
      'fetchTeachers',
      'fetchRooms'
    ])
  },
  async created() {
    this.classes = await this.fetchClasses()
    this.teachers = await this.fetchTeachers()
    this.rooms = await this.fetchRooms()
  }
}
</script>

<style lang="scss" scoped>
@import '@/includes/scss/centerXY';

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