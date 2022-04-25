<template>
  <div>
    <navigation-bar v-on:setloading="setLoading" />
      <div v-if="loading">
        <centered-loader />
      </div>
      <div v-if="!loading">
        <b-container class="mt-3">
          <router-view />
        </b-container>
      </div>
      <!--
      <div v-if="!loading && error">
        Login Failed: {{errorMessage}}
        <br>
        <b-button v-on:click="goLoginPage()">로그인 페이지로 이동</b-button>
      </div>
      -->
  </div>
</template>

<script>
import NavigationBar from "./components/layout/NavigationBar"
import { mapActions, mapState } from "vuex"

export default {
  name: 'App',
  components: { NavigationBar },
  data() {
    return {
      loading: true,
      error: false,
      errorMessage: ''
    }
  },
  computed: {
    ...mapState([
      'admin'
    ])
  },
  methods: {
    ...mapActions(['initialLoad', 'fetchPlaylists', 'logout']),
    setLoading(isLoading) {
      console.log('setLoading', this.loading, '-->', isLoading)
      this.loading = isLoading
    },

    goLoginPage() {
      this.$router.push('/login')
    }
  },
  
  async mounted() {
    console.log('App mounted')
    try {
      await this.initialLoad()
      await this.fetchPlaylists()
      this.loading = false
    } catch (error) {
      console.log('initialLoad error: ', error)
      this.logout()
      this.loading = false
      this.error = true
      this.errorMessage = error
    }
  }
}
</script>
