<template>
  <div>
    <section id="Main">
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

  },
  async created() {
    // Fetch Classes from localStorage, if not exist
    // fetch from Server and save to localStorage

    const data = {
      
    }
    const res = await axios.post(`${config.domain}/name`, data)
  }
}
</script>

<style lang="scss" scoped>
@import '@/includes/scss/centerXY';



</style>