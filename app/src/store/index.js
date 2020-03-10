import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: {},
    view: 'lehrerverwaltung',
    dbTeachers: [],
    updateInfo: {
      msg: null,
      type: null
    },
    classes: []
  },
  getters: {
    getClasses(state) {
      return state.classes
    },
    getUser(state) {
      return state.user
    },
    getView(state) {
      return state.view
    },
    getDBTeachers(state) {
      // Sort teacher array by last name
      return state.dbTeachers.sort(function(a, b) {
        return (a.lastName > b.lastName) ? 1 : ((b.lastName > a.lastName) ? -1 : 0)
      })
    },
    hasTeacherAccounts(state) {
      if (state.dbTeachers.length > 0) return true
      else return false
    },
    dbTeacherSubjects(state) {
      const subjects = state.dbTeachers.forEach(teacher => {
        return teacher.subjects
      })

      return subjects
    },
    getTeacherIDs(state) {
      let ids = []
      state.dbTeachers.forEach(teacher => {
        ids.push(teacher._id)
      })

      return ids
    },
    getUpdateInfoMsg(state) {
      return state.updateInfo
    }
  }, 
  mutations: {
    setUser(state, user) {
      state.user = user
    },
    setView(state, view) {
      state.view = view
    },
    addTeachers(state, teachers) {
      state.dbTeachers = state.dbTeachers.concat(teachers)

      // add subjects placeholders
      state.dbTeachers.forEach(teacher => {
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
  },
  modules: {
  }
  
})
