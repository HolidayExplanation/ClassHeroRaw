<template>
  <div>
    <img id="logo" src="@/assets/logos/logo.svg">
    <SidebarIconList id="List" :user="user" :pics="picList" 
    v-if="user" />
  </div>
</template>

<script>
import router from '@/router'
// Components
import SidebarIconList from '@/components/parts/SidebarIconList'
// Functions
import func from '@/includes/js/functions'
const log = console.log

export default {
  name: 'Sidebar',
  components: { SidebarIconList },
  data() {
    return {
      connected: true,
      user: null,
      pics: {
        admin: ['benachrichtigungen', 'klassenverwaltung', 
        'lehrerverwaltung', 'planerkonto'],
        planer: ['benachrichtigungen', 'raumverwaltung', 'stundendauer', 'vertretungen']
      }
    }
  },
  computed: {
    picList() {
      if (this.user.accountType === 'admin') {
        return this.pics.admin
      }
      else if (this.user.accountType === 'scheduler') {
        return this.pics.planer
      }
    }
  },
  created() {
    setInterval(() => {
      this.connected = navigator.onLine
    }, 1000)
    
    this.user = func.getUser()
  }
}
</script>

<style lang="scss" scoped>
@import '@/includes/scss/centerX';
@import '@/includes/scss/centerXY';

img#logo {
  @include centerX;
  top: 10px;
  height: 46px;
  margin-right: 10px;
}


@keyframes blinker {
  50% {
    opacity: 0;
  }
}

#List {
  @include centerXY;
  width: 100%;
  height: 100%;
}

</style>
