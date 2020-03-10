<template>
  <div>
    <div id="Center">
      <button id="toggleMenu" @click="toggleInputs()">
      Lehrer hinzufügen
    </button>
    <div id="inputContainer" v-if="inputsActive">
      <input v-model="teacherForPush" @keyup.enter="pushTeacher()"
      placeholder="Vorname Name (mit Enter bestätigen)">
      <ul>
        <li class="tag" v-for="(teacher, o) in teachers" :key="o">
          <span>{{ teacher }}</span>
          <button @click="removeTeacherFromPush(o)">
            <span>&#10005;</span>
          </button>
        </li>
      </ul>
    </div>

    <button id="downButton" @click="pushToDB()" v-if="teachersNotEmpty && inputsActive">
      <div v-if="!pushPending">
        <span v-if="!multipleAccountsForPush">Konto anlegen</span>
        <span v-else>Konten anlegen</span>
      </div>
      <LoadingIcon id="LoadingIcon" v-if="pushPending" />
    </button>
    </div>
   
  </div>
</template>

<script>
import LoadingIcon from '@/components/global/LoadingIcon'

import axios from 'axios'
import config from '@/includes/js/config'
const log = console.log

export default {
  name: 'Menu',
  components: { LoadingIcon },
  data() {
    return {
      pushPending: false,
      inputsActive: true,
      teacherForPush: null,
      teachers: []
    }
  },
  computed: {
    teachersNotEmpty() {
      if (this.teachers.length > 0) return true
      else return false
    },
    multipleAccountsForPush() {
      if (this.teachers.length > 1) return true
      else return false
    }
  },
  methods: {
    toggleInputs() {
      this.inputsActive = !this.inputsActive
    },
    pushTeacher() {
      this.teachers.push(this.teacherForPush)

      this.teacherForPush = null
    },
    removeTeacherFromPush(o) {
      this.teachers.splice(o, 1)
    },
    async pushToDB() {
      this.pushPending = true

      const response = await axios.post(`${config.domain}/create-teacher-accounts`, {
        teachers: this.teachers
      })

      this.pushPending = false

      if (response.status === 201) {
        this.teachers = []
        const receivedTeachers = response.data
        this.$store.commit('addTeachers', receivedTeachers)
        this.inputsActive = false
        const gotTeachers = this.$store.getters.getDBTeachers
        log('got: ' + JSON.stringify(gotTeachers))
      }
    }
  },
  mounted() {}
}
</script>

<style lang="scss" scoped>
@import '@/includes/scss/centerXY';
@import '@/includes/scss/centerX';

#Menu {
  position: relative;
  height: 25%;
  #Center {
    @include centerX;
    width: 60%;
    max-width: 1100px;
    height: 60%;
    display: block;
    margin-top: 10px;
  }
}

button#toggleMenu {
  float: left;
  border: none;
  padding: 10px 12px 10px 12px;
  letter-spacing: 1px;
  border-radius: 3px;
  font-size: 14px;
  font-weight: bold;
  color: white;
  background-color: purple;
  box-shadow: 1px 2px 6px 2px rgba(0, 0, 0, 0.1);
}

div#inputContainer {
  overflow-y: auto;
  max-height: 50%;
  border: 1px solid rgba(0, 0, 0, 0.3);
  min-width: 100%;
  padding: 5px 0 5px 0;
  float: left;
  border-bottom-right-radius: 5px;
  border-bottom-left-radius: 5px;
  background-color: white;
  box-shadow: 1px 2px 6px 2px rgba(0, 0, 0, 0.1);
  ul {
    float: left;
    margin-right: 10px;
    li.tag {
      display: inline-block;
      background-color:  #f85753;
      font-weight: bold;
      color: white;
      padding: 10px 10px 10px 10px;
      border-radius: 6px;
      border: 2px solid white;
      transition: .15s ease;
      &:hover {
        border: 2px solid rgb(221, 221, 221);
      }
      button {
        top: 2px;
        position: relative;
        margin-left: 5px;
        border-radius: 100%;
        border: none;
        font-weight: bold;
        font-size: 10px;
        width: 15px;
        height: 15px;
        background-color: #f1a1a0;
        transition: .3s ease;
        &:hover {
          background-color: white;
        }
        span {
          margin-top: -1px;
          @include centerXY;
          color: white;
          transition: .3s ease;
          &:hover {
            color: #df190e;
          }
        }
      }
    }
  }
  input {
    position: relative;
    padding: 10px 5px 10px 15px;
    transition: 1s ease;
    border: none;
    font-size: 17px;
    width: 300px;
    float: left;
    &:focus {
      outline: none;
    }
  }
  input:placeholder {
    color: rgba(0, 0, 0, 0.6)
  }
  input:focus::-webkit-input-placeholder {
    color: rgba(0, 0, 0, 0.3)
  }
}

#downButton {
  margin-top: 10px;
  margin-left: 10px;
  padding: 7px 12px 7px 12px;
  border: none;
  min-width: 130px;
  max-height: 40px;
  background-color: rgb(22, 175, 22);
  border-radius: 4px;
  font-size: 16px;
  color: white;
  box-shadow: 1px 2px 6px 2px rgba(0, 0, 0, 0.3);
  transition: .2s ease;
  &:hover {
    transform: scale(1.02);
  }
}


</style>
