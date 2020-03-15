<template>
  <div id="Main">
    <Menu id="Menu" :class="{center: !teachers}" />
    <TeacherList id="TeacherList" />
  </div>
</template>

<script>
import Menu from './inside_klassenverwaltung/Menu'
import TeacherList from './inside_klassenverwaltung/TeacherList'

export default {
  name: 'Lehrerverwaltung',
  components: { Menu, TeacherList },
  data() {
    return {
      teachers: false
    }
  },
  methods: {
    checkTeacherCount() {
      this.teachers = this.$store.getters.hasTeacherAccounts
    }
  },
  created() {
    this.$store.subscribe(async(mutation, state) => {
      if (mutation.type === 'addTeachers') {
        this.checkTeacherCount()
      }
    })

    this.checkTeacherCount()
  }
}
</script>

<style lang="scss" scoped>
@import '@/includes/scss/centerXY';

#Main {
  height: 100%;
  width: 100%;
}

.center {
  @include centerXY;
  z-index: 20;
}

</style>