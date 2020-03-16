<template>
  <div>
    <div id="con">
      <!-- Add Class -->
      <section id="ClassAdder">

        <!-- Class Name Show/Edit -->
        <div id="adder_className">
          <input v-model="newClass.name" 
          placeholder="Klassenbezeichnung">
        </div>
        
        <!-- Select Year -->
        <div id="adder_selectYear">
          <select v-model="newClass.year">
            <option v-for="year in years" :key="year">
              {{ year }}
            </option>
          </select>
        </div>
        <!-- Select HalfYear -->
        <div id="adder_selectHalfYear">
          <select  v-model="newClass.halfYear">
            <option>1. Halbjahr</option>
            <option>2. Halbjahr</option>
          </select>
        </div>
       
       <div id="addClass">
         <button @click="addClass()">Klasse hinzufügen</button>
       </div>

      </section>

      <!-- Class List -->
      <ul id="ClassList">
        <li class="Class" v-for="(_class, c) in classes" :key="c">

          <!-- Change Class Name -->
          <input class="className" v-model="_class.name">
          <!-- Select Year -->
          <select class="year" v-model="newClass.year">
            <option v-for="year in years" :key="year">
              {{ year }}
            </option>
          </select>
          <!-- Select HalfYear -->
          <select class="halfYear" v-model="_class.halfYear">
            <option>1. Halbjahr</option>
            <option>2. Halbjahr</option>
          </select>

          <!-- Select Class Teacher -->
          <select class="TeacherDropdown" @click="toggleList()">
            <option v-if="_class.classTeacherName">
              {{_class.classTeacherName}}
            </option>
            <option v-else>Klassenlehrer auswählen</option>
              <option v-for="(teacher, i) in teachers" :key="i">
              <span>
                {{ `${teacher.name} (${teacher.username})` }}
              </span>
            </option>
          </select>

           <!-- Show Entire Class Data -->
          <button class="toggleClassDetails" @click="toggleClassDetails(c)">Show</button>

          <!-- Class Details -->
          <div class="ClassDetails" v-if="!classes[c].detailsShown">

            <div class="Subjects">
              <!-- Subject Adder -->
              <div class="selectedItem" @click="toggleSubjectAdder()">
                <span>Fach zum zuweisen auswählen</span>
                <img class="dropdownArrow" :src="dropdownArrow">
              </div>
              <ul class="SelectSubject" v-if="subjAdderA">
                <!-- ADJUST to be a custom Selector -->
                <li v-for="(subject, i) in filteredSubjects(c)" :key="i"
                 @click="addSubjectToClass(subject, c)">
                  <span class="subjectTeacherName">{{ subject.teacherName }}</span>
                  <span class="subjectName">{{ ` ${subject.name}` }}</span>
                </li>
              </ul>
              <!-- Subject List -->
              <ul class="SubjectList">
                <li v-if="_class.assignedSubjects.length === 0">
                  Keine Fächer zugewiesen
                </li>
                <li v-else v-for="(subject, i) in _class.assignedSubjects" :key="i">
                  {{ subject }}
                </li>
              </ul>
            </div>

            <div class="Students">
              <!-- Student Adder -->
              <div class="StudentAdder">
                <div id="inputContainer">
                  <input v-model="studentForPush" @keyup.enter="pushStudent()"
                  placeholder="Vorname Name (mit Enter bestätigen)">
                  <ul>
                    <li class="tag" v-for="(student, o) in studentsForPush" :key="o">
                      <span>{{ student }}</span>
                      <button @click="removeStudentFromPush(o)">
                        <span>&#10005;</span>
                      </button>
                    </li>
                  </ul>
                </div>
                <button id="downButton" @click="pushToDB(_class._id)" v-if="studentsNotEmpty">
                  <div>
                    <span v-if="!multipleAccountsForPush">Konto anlegen</span>
                    <span v-else>Konten anlegen</span>
                  </div>
                  <LoadingIcon id="LoadingIcon" v-if="pushPending" />
                </button>
              </div>
              <!-- Student List -->
              <ul class="StudentList">
                <li v-if="_class.assignedStudents.length === 0">
                  Keine Schüler Konten in der Klasse
                </li>
                <li v-else>Student</li>
              </ul>
            </div>

          </div>
        </li>
      </ul>

    </div>
  </div>
</template>

<script>
import LoadingIcon from '@/components/global/LoadingIcon'

import axios from 'axios'
import config from '@/includes/js/config'
const log = console.log

export default {
  name: 'Klassenverwaltung',
  data() {
    return {
      years: [new Date().getFullYear(), new Date().getFullYear()+1],
      newClass: {
        name: null,
        year: new Date().getFullYear(),
        halfYear: '1. Halbjahr',
        detailsShown: false
      },
      subjAdderA: false,
      classes: [],
      teachers: [],
      subjects: [],
      studentForPush: null,
      studentsForPush: [],
      pushPending: false
    }
  },
  computed: {
    dropdownArrow() {
      return require('@/assets/icons/profile_arrow.svg')
    },
    studentsNotEmpty() {
      if (this.studentsForPush.length > 0) return true
      else return false
    },
    multipleAccountsForPush() {
      if (this.studentsForPush.length > 1) return true
      else return false
    }
  },
  async created() {
    this.teachers = await this.$store.dispatch('fetchTeachers')

    log("teachers",this.teachers)

    this.teachers.forEach((teacher) => {
      if (teacher.subjects.length > 0) {
        teacher.subjects.forEach((subject) => {
          let subjectObject = {
            ...subject,
            teacherID: teacher._id,
            teacherName: teacher.name
          }

          this.subjects.unshift(subjectObject)
        })
      }
    })

    log(this.subjects)
  },
  methods: {
    toggleClassDetails(i) {
      this.classes[i].detailsShown = !this.classes[i].detailsShown
      log(this.classes[i])
      this.$forceUpdate()
    },
    pushStudent() {
      this.studentsForPush.push(this.studentForPush)

      this.studentForPush = null
    },
    removeStudentFromPush(o) {
      this.studentsForPush.splice(o, 1)
    },
    async pushToDB(classID) {
      log(classID)
      this.pushPending = true

      const response = await axios.post(`${config.domain}/create-student-accounts`, {
        classID,
        students: this.studentsForPush
      })

      this.pushPending = false

      if (response.status === 201) {
        this.teachers = []
        const receivedStudents = response.data
        log(receivedStudents)
        // this.$store.commit('addTeachers', receivedTeachers)
        this.inputsActive = false
        // // const gotTeachers = this.$store.getters.getDBTeachers
        // log('got: ' + JSON.stringify(gotTeachers))
      }
    },
    async addSubjectToClass(subject, classIndex) {
      const data = {
        subject,
        classID: this.classes[classIndex]._id
      }

      const res = await axios.patch(`${config.domain}/assign-subject-to-class`, data)

      if (res.status === 200) {
        this.classes[classIndex].assignedSubjects.push(subject)
      }
      log(res)
    },
    filteredSubjects(c) {
      let subjects = []
      
      this.classes[c].assignedSubjects.forEach((assignedSubject) => {
        log(assignedSubject)
        subjects = this.subjects.filter(function( subject ) {
            return subject._id !== assignedSubject._id;
        })
      })

      // log(subjects)

     

      return this.subjects
    },
    toggleSubjectAdder() {
      this.subjAdderA = !this.subjAdderA
    },
    setInfo(msg, type) {
      const infoPayload = { msg, type }
      this.$store.commit('setUpdateInfoMsg', infoPayload)
    },
    async addClass() {
      // No newClass.name Error
      if (this.newClass.name === null || this.newClass.name === '') {
        this.setInfo('Bitte geben Sie eine Klassenbezeichnung ein.', 'bad')
        throw new Error('No newClass.name detected')
      }

      const formattedHalfYear = parseInt(this.newClass.halfYear.charAt(0))
      const data = {
        name: this.newClass.name,
        year: this.newClass.year,
        halfYear: formattedHalfYear
      }

      const res = await axios.post(`${config.domain}/create-class`, data)
      
      if (res.status === 200) {
        this.setInfo('Klasse erstellt', 'good')

        const newObject = {
          _id: res.data,
          name: this.newClass.name,
          year: this.newClass.year,
          halfYear: this.newClass.halfYear,
          assignedSubjects: [],
          assignedStudents: []
        }

        this.classes.push(newObject)
        this.newClass.name = null
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/includes/scss/centerX';
@import '@/includes/scss/centerY';
@import '@/includes/scss/centerXY';

.ClassDetails {
  width: 80%;
  background-color: sandybrown;
  display: block;
  margin-left: auto;
  margin-right: auto;
  margin-top: 5px;
}

section#ClassAdder {
  display: grid;
  grid-template-columns: 1fr .5fr 1fr 1fr;
  border-radius: 15px;
  div#adder_className {
    background-color: maroon;
     input {
      padding: 10px;
      width: 140px;
      border: 1px solid rgba(0, 0, 0, 0.2);
      border-radius: 3px;
    }
  }
  div:nth-child(2) {background-color: rgb(5, 126, 120);}
  div:nth-child(3) {background-color: rgb(19, 158, 77);}
  div:nth-child(4) {background-color: rgb(138, 131, 39);}
  div {
    position: relative;
    display: flex; 
    justify-content:center;
    align-items: center;
  }
}

.selectedItem {
  margin-left: auto;
  margin-right: auto;
  position: relative;
  display:table;
  width: 90%;
  height: 30px;
  border: none;
  border-bottom: 3px solid rgba(0, 0, 0, 0.3);
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  background-color: bisque;
  cursor: pointer;
  &:hover {
    background-color: rgba(0, 0, 0, 0.2);
  }
  span, img {
    display:table-cell;
    vertical-align:middle;
  }
  .dropdownArrow {
    @include centerY;
    margin-left: -30px;
    height: 15px;
  }
}

.subjectName {
  background-color: lime !important;
}

ul#ClassList {
  padding: 10px;
  background-color: black;
  li.Class {
    background-color: rgb(58, 58, 58);
  }
}

section#Classes {
  background-color: rgb(105, 105, 105);
  ul {
    li {
      background-color: orange;
    }
  }
}

div#con {
  background-color: rgb(104, 143, 110);
  display: grid;
  grid-template-rows: 60px;
  width: 80%;
  max-width: 1000px;
  @include centerXY;
}

</style>