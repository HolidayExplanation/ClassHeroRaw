<template>
  <div>
    <div id="Main">

      <section id="Titles">
        <span>Stundendauer</span>
      </section>
      <section id="Hours">
        <ul id="HourCount">
          <li v-for="hour in hourAmount" :key="hour">
            <span>{{ hour }}</span>
          </li>
        </ul>
        <ul id="HoursFrom">
          <li v-for="(time, i) in hoursFrom" :key="i">
            <input v-model='hoursFrom[i]'>
          </li>
        </ul>
        <ul id="HoursTo">
            <li v-for="(time, i) in hoursTo" :key="i">
            <input v-model='hoursTo[i]'>
          </li>
        </ul>
      </section>
      <section id="HourAdder">
        <div id="buttonPositioner">
          <button @click="addHour()">+</button>
        </div>
      </section>

      <transition name="fade">
      <!-- '> 2' because: 2 changes occur upon loading of hoursFrom & hoursTo -->
      <section id="Update" v-if="changed > 2">
        <button @click="updateHours()">
          Aktualisieren
        </button>
      </section>
      </transition>

    </div>
  </div>
</template>

<script>
import axios from 'axios'
import config from '@/includes/js/config'
const log = console.log

export default {
  name: 'Stundendauer',
  data() {
    return {
      hourAmount: 8,
      hoursFrom: [],
      hoursTo: [],
      changed: 0,
      loaded: false
    }
  },
  watch: {
    hoursFrom: function(val) {
      this.changed++
      
      log(this.changed)
    },
    hoursTo: function(val) {
      this.changed++
      
      log(this.changed)
    }
  },
  methods: {
    addHour() {
      this.hourAmount++
      this.hoursFrom.push('')
      this.hoursTo.push('')
    },
    async updateHours() {
      const data = {
        hoursFrom: this.hoursFrom,
        hoursTo: this.hoursTo
      }

      const res = await axios.patch(`${config.domain}/update-schedule-times`, data)
      let payload
      if (res.status === 204) {
        payload = {
          msg: 'Aktualisiert',
          type: 'good'
        }

        this.$store.commit('setUpdateInfoMsg', payload)
        this.changed = 2
      } else {
        payload = {
          msg: 'Fehler. Bitte versuchen Sie es erneut.',
          type: 'bad'
        }

        this.$store.commit('setUpdateInfoMsg', payload)
      }
    }
  },
  async created() {
    const res = await axios.get(`${config.domain}/fetch-schedule-times`)
  
    this.hourAmount = res.data[0].hoursFrom.length
    this.hoursFrom = res.data[0].hoursFrom
    this.hoursTo = res.data[0].hoursTo
    this.loaded = true
  }
}
</script>

<style lang="scss" scoped>
@import '@/includes/scss/animations/Fade';
@import '@/includes/scss/centerXY';

$TimesWidth: 200px;
$HourCountWidth: 60px;
$listItemHeight: 40px;

div#Main {
  @include centerXY;
  width: $TimesWidth*2 + $HourCountWidth;
  display: grid;
  section#Titles {
    position: relative;
    height: 40px;
    margin-bottom: 5px;
    font-size: 17px;
    border: 1px solid rgba(0, 0, 0, 0.2);
    width: 100%;
    span {
      @include centerXY;
    }
  }
  section#HourAdder {
    position: relative;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.05);
    height: 60px;
    text-align: center;
    div#buttonPositioner {
      @include centerXY;
      padding: 5px;
      border-radius: 5px;
      border: 2px dashed rgba(0, 0, 0, 0.15);
      button {
        background-color: black;
        height: 40px; width: 40px;
        border-radius: 100%;
        transition: .15s ease;
        &:hover {
          transform: scale(1.03);
        }
      }
    }
  }
  section#Update {
    position: relative;
    height: 30px;
    width: 100%;
    margin-top: 10px;
    button {
      @include centerXY;
      padding: 5px 15px 5px 15px;
      background-color: greenyellow;
    }
  }
}

li {
  position: relative;
  height: $listItemHeight;
  border: 1px solid rgba(0, 0, 0, 0.2);
  span {
    @include centerXY;
  }
  input {
    @include centerXY;
    text-align: center;
    font-size: 16px;
    height: 80%;
    width: 90%;
  }
}

 section#Hours {
   display: grid;
   width: $TimesWidth;
   grid-template-columns: $HourCountWidth $TimesWidth $TimesWidth;
   ul#HourCount {
     background-color: orange;
   }
   ul#HoursFrom {
     background-color: cadetblue;
   }
   ul#HoursTo {
     background-color: brown;
   }
 }
</style>