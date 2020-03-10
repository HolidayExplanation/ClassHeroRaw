<template>
  <div id="Main">
    <Menu id="Menu" />
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
      
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/includes/scss/centerXY';

#Main {
  height: 100%;
  width: 100%;
}

</style>