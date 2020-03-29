import axios from 'axios'
import config from '@/includes/js/config'
import Vue from 'vue'
import Vuex from 'vuex'
const log = console.log

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    view: 'stundenplan',
    user: {},
    classes: [],
    teachers: [],
    subjects: [],
    rooms: [],
    updateInfo: {
      msg: null,
      type: null
    },
    dayIsClicked: true
  },
  getters: {
    getUser(state) {
      return state.user
    },
    getView(state) {
      return state.view
    },
    getTeachers(state) {
      // Sort teacher array by last name
      return state.teachers.sort(function(a, b) {
        return (a.lastName > b.lastName) ? 1 : ((b.lastName > a.lastName) ? -1 : 0)
      })
    },
    hasTeacherAccounts(state) {
      if (state.teachers.length > 0) return true
      else return false
    },
    getUpdateInfoMsg(state) {
      return state.updateInfo
    }
  }, 
  mutations: {
    setDayClicked(state, condition) {
      state.dayIsClicked = condition
    },
    setClassSchedule(state, classSchedule) {
      state.classSchedule = classSchedule
    },
    setClasses(state, classes) {
      state.classes = classes
    },
    setRooms(state, rooms) {
      state.rooms = rooms
    },
    addSubject(state, subject) {
      state.subjects.unshift(subject)
    },
    removeSubject(state, subject) {
      let filtered = state.subjects.filter(function( obj ) {
        return obj._id !== subject._id
      })

      state.subjects = filtered
    },
    setSubjects(state, subjects) {
      state.subjects = subjects
    },
    setUser(state, user) {
      state.user = user
    },
    setView(state, view) {
      state.view = view
    },
    addTeachers(state, teachers) {
      state.teachers = state.teachers.concat(teachers)

      // add subjects placeholders
      state.teachers.forEach(teacher => {
        if (!teacher.subjects) {
          teacher.subjects = []
        }
      })
    },
    setUpdateInfoMsg(state, payload) {
      state.updateInfo.msg = payload.msg
      state.updateInfo.type = payload.type
    }
  },
  actions: {
    async fetchClasses(context) {
      if (context.state.classes.length === 0) {
        const classes = await axios.get(`${config.domain}/get-classes`)
        context.commit('setClasses', classes.data)
      }

      return context.state.classes
    },
    async fetchTeachers(context) {
      if (context.state.teachers.length === 0) {
        let response = await axios.get(`${config.domain}/fetch-teacher-accounts-scheduler`)
        context.commit('addTeachers', response.data)
      }

      return context.getters.getTeachers
    },
    async fetchRooms(context) {
      if (context.state.rooms.length === 0) {
        const rooms = await axios.get(`${config.domain}/get-rooms`)
        context.commit('setRooms', rooms.data)
      }

      return context.state.rooms
    },
    async fetchSubjects(context) {
      if (context.state.rooms.length === 0) {
        const subjects = await axios.get(`${config.domain}/fetch-existing-subjects`)
        context.commit('setSubjects', subjects.data)
      }

      return context.state.subjects
    }
  },
  modules: {
  }
  
})
