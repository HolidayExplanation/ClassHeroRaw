<template>
  <div id="main">
    <div id="Center">
      <!-- <span id="title">Lehrerliste</span> -->
      <ul v-if="teachers === null">
        <li v-for="index in 5" :key="index">
          <div class="teacher"></div>
          <div class="subjects"></div>
        </li>
      </ul>
      <ul v-else id="teacherList">
        <li v-for="(teacher, i) in teachers" :key="i">
          <div class="teacher">
            <div id="name">
              <span>{{`${teacher.name}`}}</span>
            </div>
            <div id="username">
              <span>{{ teacher.username }}</span>
            </div>
            <div id="resetPassword" @click="sendPwReset(i)">
              <img src="@/assets/icons/reset_password.svg" alt="">
            </div>
          </div>
          <div class="subjects">
            <div class="subjectsContainer">
              <div class="subjectPusher">
                <span>Fächer</span>
                <input v-model="subjectName[i]" placeholder="Fachname">
                <button @click="createSubject(i)">+</button>
              </div>
              <ul class="subjectsFolder">
                <li class="subjectItem" v-for="(subject, y) in teacher.subjects" :key="y">
                  <div class="subjectItemLayoutSplit">
                    <span>{{ subject.name }}</span>
                    <div class="deleteSubject" @click="deleteSubject(i, y)">
                      <span>&#10005;</span>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
// import LoadingIcon from '@/views/global/LoadingIcon'

import axios from 'axios'
import config from '@/includes/js/config'
const log = console.log

export default {
  name: 'TeacherList',
  components: { },
  data() {
    return {
      teachers: null,
      user: null,
      subjectName: [],
      passwordResetSent: []
    }
  },
  created() {
    this.$store.subscribe(async(mutation, state) => {
      if (mutation.type === 'addTeachers') {
        this.teachers = state.dbTeachers
      }
    })
  },
  computed: {},
  methods: {
    sendPwReset(index) {
      log(index)
      this.passwordResetSent[index] = true
      log(this.passwordResetSent)
      this.$forceUpdate()
    },
    sortTeachersByLastName() {
      // Sort teacher array by first name
      this.teachers.sort(function(a, b) {
        return (a.lastName > b.lastName) ? 1 : ((b.lastName > a.lastName) ? -1 : 0)
      })
    },
    async fetchTeacherAccounts() {
      let response = await axios.get(`${config.domain}/fetch-teacher-accounts`)

      this.$store.commit('addTeachers', response.data)
  
      this.fetchSubjects()
    },
    async createSubject(index) {
      if (this.subjectName[index] != '') {
        try {
          log(this.teachers[index])
          let response = await axios.post(`${config.domain}/create-subject`, {
            name: this.subjectName[index],
            teacherID: this.teachers[index]._id,
            teacherName: this.teachers[index].name
          }) 

          const subject =  {_id: response.data._id, name: this.subjectName[index]}

          this.teachers[index].subjects.push(subject)

          this.subjectName[index] = null

          this.$forceUpdate()
        } catch(err) {
          log(err)
        }
      }
    },
    async deleteSubject(teacherIndex, subjectIndex) {
      const response = await axios.post(`${config.domain}/delete-subject`, {
        _id: this.teachers[teacherIndex].subjects[subjectIndex]._id
      })

      if (response.status === 200 && response.data.deletedCount === 1) { 
        this.teachers[teacherIndex].subjects.splice(subjectIndex, 1)
      }

      this.$forceUpdate()
    },
    async fetchSubjects() {
      const fetchedTeacherAccs = this.$store.getters.getDBTeachers

      let teacherIDs = [] // for Subject fetching
      this.teachers = fetchedTeacherAccs.map(teacher => {
        // this.subjectPending.push(false)
        teacher.changed = false
        teacherIDs.push(teacher._id) // get all teacher account IDs for Subject fetching
        return teacher
      })

      const allSubjects = await axios.post(`${config.domain}/fetch-teacher-manager-subjects`, {
          teacherIDs
      })

      let i = 0
      for (const subjectList of allSubjects.data) {
        this.teachers[i].subjects = subjectList
        i++
      }

      this.sortTeachersByLastName()
  }},
  async mounted() {
    this.user = localStorage.getItem('user')
    this.fetchTeacherAccounts()
  }
}
</script>

<style lang="scss" scoped>
@import '@/includes/scss/centerXY';
@import '@/includes/scss/centerX';
@import '@/includes/scss/centerY';

$teacherHeight: 40px;
$subjectHeight: 35px;

#TeacherList {
  position: relative;
  height: 100%;
  width: 100%;
  #Center {
    @include centerXY;
    height: 100%;
    width: 80%;
    max-width: 1100px;
  }
}

ul#teacherList {
  overflow-y: auto;
  padding-top: 20px !important;
}

ul.subjectsFolder {
  display: inline-block;
}
li.subjectItem {
  position: relative;
  float: left;
  div.subjectItemLayoutSplit {
    display: inline-block;
    color: white;
    background-color: greenyellow;
    border-radius: 2px;
    padding: 3px 3px 3px 8px;
    margin-left: 5px;
    font-weight: bold;
    font-size: 14px;
    border: 1px solid rgba(0, 0, 0, 0.2);
    background-color: #d16014;
    box-shadow: 1px 1px 1px 1px rgba(0, 0, 0, 0.1);
    transition: .2s ease;
    cursor: default;
    &:hover {
      box-shadow: 1px 3px 5px 1px rgba(0, 0, 0, 0.4);
    }
    div {
      position: relative;
      float: right;
      margin-left: 8px;
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 100%;
      height: 17px;
      width: 17px;
      cursor: pointer;
      transition: .2s ease;
      &:hover {
        color: #ac237e;
        background-color: white;
      }
      span {
        position: absolute;
        left: 3px;
        font-size: 11px;
      }
    }
  }
}

.subjectPusher {
  position: relative;
  background-color: rgba(0, 0, 0, 0.09);
  height: $subjectHeight;
  width: 300px;
  float: left;
  span, input, button {
    @include centerY;
  }
  span {
    left: 10px;
  }
  input {
    height: 25px;
    padding-left: 5px;
    border-radius: 2px;
    left: 70px;
  }
  button {
    left: 250px;
    padding: 0 5px 0 5px;
  }
}
.subjectsFolder {
  float: right;
  // border: 1px solid red;
  height: $subjectHeight;;
  width: calc(100% - 300px - 60px);
}

span#title {
  margin-top: -30px;
  color: rgba(156, 155, 155, 0.4);
  float: left;
  font-size: 17px;
  font-weight: bold;
  letter-spacing: 1px;
}

@mixin animationBackground {
  background-color: gray;
  background: -webkit-linear-gradient(left, rgba(240, 240, 240, 0.2) 0%, rgba(173, 173, 173, 0.35) 100%);
  background-size: 1000%;
  -moz-background-size: 1000%;
  -webkit-background-size: 1000%;
  -webkit-animation-name: fun-time-awesome;
  -webkit-animation-duration: 2s;
  -webkit-animation-timing-function: linear;
  -webkit-animation-iteration-count: infinite;
  -webkit-animation-direction: alternate;
  -webkit-animation-play-state: running;
}

#LoadingIcon {
  position: relative;
  width: 20px;
  height: 20px;
  top: 2px;
}

@mixin insideList($width) {
   position: relative;
    float: left;
    height: 100%;
    width: $width;
}

ul {
  height: 65%;
  padding: 6px 12px 0 5px;
  li {
    position: relative;
    height: $teacherHeight + $subjectHeight;
    padding-bottom: 5px;
  }
  .teacher {
    border-radius: 5px;
    width: 100%;
    height: $teacherHeight;
    // @include animationBackground;
    background-color: white;
    border: 1px solid rgba(0, 0, 0, 0.2);
    // box-shadow: 0px 0px 5px 2px rgba(0, 0, 0, 0.2);
    div#name {
      @include insideList(40%);
      span {
        @include centerY;
        padding: 5px 20px 5px 20px;
        margin-left: 20px;
        border: 1px solid rgba(0, 0, 0, 0.2);
        border-radius: 3px;
        left: 0;
        text-align: start;
        background-color: transparent;
        font-size: 17px;
        // width: calc(100% - 30px);
      }
    }
    div#username {
      @include insideList(40%);
      span {
         @include centerXY;
         color: rgba(0, 0, 0, 0.6)
      }
    }
    div#resetPassword {
      @include insideList(20%);
      position: relative;
      img {
        cursor: pointer;
        @include centerY;
        width: 25px;
        height: 25px;
        right: 6px;
        padding: 5px;
        border-radius: 6px;
        background-color: rgb(24, 149, 24);
        transition: .2s ease;
        &:hover {
          background-color: rgba(29, 187, 29, 0.75);
        }
      }
    }
  }
  .subjects {
    @include centerX;
    @include animationBackground;
    top: $teacherHeight;
    width: 90%;
    height: $subjectHeight;
    background-color: rgba(156, 155, 155, 0.1);
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
  }
}

.passwordResetSent {
  background-color: rgba(0, 0, 0, 0.2) !important;
}

@keyframes fun-time-awesome {
  0% {background-position: left;}
  100% {background-position: right;}
}

</style>
