<template>
<div id="Main">
  <Loading id="Loading" v-if="loading"/>
  <section v-else>
    <div id="Form">
      <div id="Topper">
        <img src="@/assets/logos/logo.svg">
      </div>
      <div id="Anmeldung">
        <span>
          {{ login ? 
          'Anmeldung':
          'Kontowiederherstellung'
          }}
        </span>
      </div>
      <div id="Description">
        <span>
          {{ login ? 
          'Mit Lehrer- oder Planerkonto anmelden':
          'Konto wiederherstellen'
          }}
        </span>
      </div>
      <div id="Inputs">
        <div>
          <label>Anmeldename</label>
          <input v-model="username">
        </div>
        <div>
          <label>
            {{ login ? 
            'Kennwort':
            'Wiederherstellungsschlüssel'
            }}
          </label>
          <input v-model="password" ref="passwordField" type="password">
          <img :src="imgSrc" @click="togglePasswordView()">
        </div>
      </div>
      <div id="Error">
        <span v-if="error">{{ error }}</span>
      </div>
      <div id="Buttons">
        <button @click="changeSection()">
           {{ login ? 
          'Kontowiederherstellen':
          'Zurück'
          }}
        </button>
        <button @click="attemptRequest()">Weiter</button>
      </div>
    </div>
    <div id="Meta"></div>
  </section>
</div>
</template>

<script>
import Axios from 'axios'
import Loading from '@/components/Loading'
import router from '@/router'
import config from '@/includes/js/config'
const log = console.log

export default {
  name: 'Login',
  components: { Loading },
  data () {
    return {
      login: true,
      username: null,
      password: null,
      passwordVisible: false,
      loading: false,
      error: null,
    }
  },
  async created() {
    document.title = "Login / ClassHero"

    this.checkIfTokenExists()

    // Listens for Enter instead of having to click the SignUp/SignIn button!
    const v = this
    window.addEventListener('keyup', function(event) {
      if (event.keyCode === 13) { 
        v.attemptRequest()
      }
    })
  },
  computed: {
    imgSrc() {
      const passwordVisible = require('@/assets/login_eye/shown.svg')
      const passwordInvisible = require('@/assets/login_eye/hidden.svg')

      return this.passwordVisible ? passwordVisible : passwordInvisible
    }
  },
  methods: {
    changeSection() {
      this.password = null
      this.login = !this.login
    },
    checkIfTokenExists() {
      const token = localStorage.getItem('@token')
      
      if (token !== null) {
        log(`@Token found.`)
        router.push('/')
      }
    },
    setError(message) {
      this.error = message
    },
    resetError() {
      this.error = null
    },
    errorHandling() {
      if (!navigator.onLine) {
        this.setError('Bitte überprüfen Sie ihre Internetverbindung.')
        throw new Error('No connection.')
      }

      if (!this.username || !this.password) {
        this.setError('Eingabefelder können nicht leer sein.')
        throw new Error('Field empty.')
      }
    },
    togglePasswordView() {
      this.passwordVisible = !this.passwordVisible

      if (this.passwordVisible) this.$refs.passwordField.type = 'text'
      else this.$refs.passwordField.type = 'password'
    },
    attemptRequest() {
      if (this.login) this.attemptLogin()
      else this.recoverAccount()
    },
    async attemptLogin() {
      this.errorHandling('login')
      this.loading = true

      try {
        const data = {
          username: this.username.toLowerCase(),
          password: this.password
        }

        const res = await Axios.post(`${config.domain}/login`, data)   

        localStorage.setItem('@token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        
        router.push('/')
      } catch (err) {
        log(err)
        if (!err.response) {
          this.setError('Verbindung zum Server konnte nicht hergestellt werden.')
        } else {
          this.setError('Eingegebene Daten sind falsch.')
        }
      }
      this.loading = false
    },
    async recoverAccount() {
      this.errorHandling()
      this.loading = true
      try {
        const data = {
          username: this.username,
          recoveryKey: this.password
        }

        const res = await Axios.post(`${config.domain}/recover-account`, data)   

        localStorage.setItem('@token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))

        router.push('/')
      } catch (err) {
        if (!err.response) {
          this.setError('Verbindung zum Server konnte nicht hergestellt werden.')
        } else {
          this.setError('Eingegebene Daten sind falsch.')
        }
      }
      this.loading = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/includes/scss/centerX';
@import '@/includes/scss/centerY';
@import '@/includes/scss/centerXY';
@import '@/includes/scss/Unselectable';

#Loading {
  @include centerXY;
}

span, label {
  @include Unselectable;
}

#Main {
  height: 100vh; width: 100vw;
  section {
    @include centerXY;
    display: grid;
    grid-template-rows: 7fr 1fr;
    height: 550px;
    width: 410px;
    #Form {
      border: 1px solid rgba(0, 0, 0, 0.15);
      display: grid;
      grid-template-rows: 1.5fr 1fr 0.7fr 2.2fr 1.5fr 1.5fr;
      background-color: white;
      border-radius: 10px;
      // div {border: 1px solid black;}
    }
    #Meta {
      background-color: transparent !important;
    }
  }
}

#Topper {
  position: relative;
  img {
    @include centerX;
    bottom: 0;
    height: 60px; width: 60px;
  }
  #siteName {
    position: relative;
    span {
      @include centerY;
      left: -15px;
      font-size: 18px;
      font-weight: bold;
      letter-spacing: 0.5px;
    }
  }
}
#Anmeldung {
  position: relative;
  font-size: 20px;
  font-weight: bold;
  span {
    @include centerXY;
    letter-spacing: .7px;
  }
}
$buttonColor: rgb(40, 135, 243);
#Buttons {
  position: relative;
  button {
    position: absolute;
    border-radius: 3px;
    bottom: 20px;
    color: white;
    font-size: 14px;
    padding: 8px 20px 8px 20px;
  }
  button:nth-child(1) {
    left: 20px;
    color: $buttonColor;
    font-weight: bold;
    background-color: rgba(0, 0, 255, 0.07);
    transition: .15s ease;
    &:hover {
      font-weight: normal;
      color: rgb(255, 255, 255);
      background-color: rgb(40, 196, 243);
    }
  }
  button:nth-child(2) {
    right: 20px;
    background-color: $buttonColor;
    transition: .15s ease;
    &:hover {
      transform: scale(1.02);
    }
  }
}

#Inputs {
  display: grid;
  grid-template-rows: 1fr 1fr;
  div {
    position: relative;
    // border: 1px solid black;
    display: block;
    label {
      z-index: 5;
      position: absolute;
      font-size: 14px;
      // font-weight: bold;
      padding-left: 5px;
      padding-right: 5px;
      top: 8px; left: 45px;
      color: rgba(0, 0, 0, 0.55);
      background-color: white;
    }
    input {
      @include centerX;
      margin-top: 15px;
      width: 350px;
      height: 40px;
      border-radius: 4px;
      border: 1px solid rgba(0, 0, 0, 0.15);
      padding-left: 15px;
      font-size: 15px;
      &:focus {
        box-shadow: 0 0 1pt 1pt $buttonColor;
      }
    }
    img {
      position: absolute;
      padding: 5px;
      border-radius: 3px;
      top: 20px; right: 30px;
      height: 22px; width: 22px;
      cursor: pointer;
      transition: .15s ease;
      &:hover {
        background-color: rgba(0, 0, 0, 0.15);
      }
    }
  }
}

#Error {
  position: relative;
  span {
    @include centerXY;
    font-size: 15px;
    border-radius: 4px;
    width: 350px;
    background-color: rgb(255, 103, 103);
    border: 1px solid  rgba(196, 59, 31, 0.7);
    padding: 5px;
    color: white;
  }
}

</style>