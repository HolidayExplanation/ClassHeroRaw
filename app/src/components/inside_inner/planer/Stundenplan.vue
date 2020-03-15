<template>
  <div>
    <section id="Main" v-if="false">
      <!-- FIRST SHOW ONLY {SELECT CLASS} -->
      <select id="ClassSelector">
        <option v-for="(_class, i) in classes" :key="i">
          {{ _class.name }}
        </option>
      </select>
      <ul id="Monday">
        <li v-for="(hour, h) in hours.monday" :key="h">
          {{ h }}
        </li>
      </ul>
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
      hours: {
        monday: []
      },
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
    log(this.classes)
    this.teachers = await this.fetchTeachers()
    log(this.teachers)
    this.rooms = await this.fetchRooms()
    log(this.rooms)
  }
}
</script>

<style lang="scss" scoped>
@import '@/includes/scss/centerXY';



</style>