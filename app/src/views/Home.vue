<template>
  <div class="home" v-if="user">
    <Topper id="Topper" />
    <Sidebar id="Sidebar" />
    <Inner id="Inner" />
    <UpdateInfo id="UpdateInfo" :class="{UpdateInfoShown: updateInfoMsg === null}" />
  </div>
</template>

<script>
import router from '@/router'
import axios from 'axios'
// Components
import Loading from '@/components/Loading.vue'
import Topper from '@/components/Topper'
import Sidebar from '@/components/Sidebar'
import Inner from '@/components/Inner'
import UpdateInfo from '@/components/UpdateInfo'
// Functions
import func from '@/includes/js/functions'
const log = console.log

export default {
  name: 'Home',
  components: {
    Loading, Topper, Sidebar, Inner, UpdateInfo
  },
  data() {
    return {
      user: null,
      updateInfoMsg: null
    }
  },
  async created() {
    document.title = "ClassHero Suite"

    const user = func.getUser()

    if (!user) router.push('/login')
    else {
      this.user = user
      const authToken = localStorage.getItem('@token')
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
    }

    this.$store.subscribe(async(mutation, state) => {
      if (mutation.type === 'setUpdateInfoMsg') {
        this.updateInfoMsg = state.updateInfoMsg
      }
    })
  
  }
}
</script>

<style lang="scss" scoped>
$topperHeight: 40px;
$sidebarWidth: 70px;
$footerHeight: 60px;

#Topper {
  position: absolute;
  background-color: #2F3136;
  top: 0; right: 0;
  width: calc(100vw - #{$sidebarWidth});
  height: $topperHeight;
  // border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

#Sidebar {
  position: absolute;
  top: 0; left: 0;
  height: 100%; width: $sidebarWidth;
  background-color: rgb(32, 34, 37);
  // border-right: 1px solid rgba(255, 255, 255, 0.2);
}

#Inner {
  position: absolute;
  top: 0 + $topperHeight; right: 0;
  width: calc(100vw - #{$sidebarWidth});
  height: calc(100vh - #{$topperHeight} - #{$footerHeight});
  background-color: #2F3136;
}

#UpdateInfo {
  position: absolute;
  bottom: 0; right: 0;
  width: calc(100vw - #{$sidebarWidth});
  height: $footerHeight;
}

.UpdateInfoShown {
  background-color: transparent !important;
}
</style>