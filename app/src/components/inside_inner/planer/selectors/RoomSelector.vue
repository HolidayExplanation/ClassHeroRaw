<template>
  <div>
    <select v-model="selected" @change="selectRoom">
      <option v-for="(room, i) in rooms" :key="i">
        <span>{{ room.name }}</span>
      </option>
    </select>
  </div>
</template>

<script>
import axios from 'axios'
import config from '@/includes/js/config'
const log = console.log

export default {
  name: 'RoomSelector',
  data() {
    return {
      rooms: [],
      selected: null
    }
  },
  methods: {
    selectRoom() {
      // log(this.selected)
      this.$emit('selected', this.selected)
    },
    fetchRooms() {
      return this.$store.dispatch('fetchRooms')
    }
  },
  async created() {
     this.rooms = await this.fetchRooms()
  }
}
</script>

<style lang="scss" scoped>
@import '@/includes/scss/centerXY';



</style>