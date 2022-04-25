import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    admin: {
      id: null,
      adminId: '',
      email: '',
      name: '',
      level: false
    },
    playlists: [],
  },
  getters: {
    isAuthenticated(state) {
      return !!state.admin.id
    },
    currentAdmin(state) {
      return state.admin
    }
  },
  mutations: {
    CURRENT_ADMIN_FETCHED(state, admin) {
      console.log('CURRENT_ADMIN_FETCHED', admin)
      state.admin.id = admin.id
      state.admin.adminId = admin.adminId
      state.admin.email = admin.email
      state.admin.name = admin.name
      state.admin.level = admin.level
    },
    CURRENT_ADMIN_REMOVED(state) {
      console.log('CURRENT_ADMIN_REMOVED')
      state.admin.id = null
      state.admin.adminId = ''
      state.admin.email = ''
      state.admin.name = ''
      state.admin.level = false
    },
    PLAYLISTS_FETCHED(state, playlists) {
      console.log('PLAYLISTS_FETCHED', playlists ? `${playlists.length} playlists loaded` : 'empty playlists')
      state.playlists = playlists
    },
  },
  actions: {
    async initialLoad(context) {
      if (localStorage.authToken) {
        //console.log('check current admin with token:', localStorage.authToken)
        Vue.axios.defaults.headers.common.Authorization = `Bearer ${localStorage.authToken}`
        const response = await Vue.axios.get("/v1/auth/admin-current")
        context.commit("CURRENT_ADMIN_FETCHED", response.data)
      } else {
        /*
        var admin = {}
        admin.id = 1
        admin.email = 'admin@test.com'
        admin.name = 'test'
        context.commit("CURRENT_ADMIN_FETCHED", admin)
        */
      }
    },

    async login(context, idPassword) {
      //console.log(`idPassword=${idPassword}`)
      try {
        const response = await Vue.axios.post("/v1/auth/admin-login", idPassword)
        let admin = response.data.result
        let token = response.data.token
        localStorage.setItem('authToken', token)
        //console.log('jwt:', token)
        Vue.axios.defaults.headers.common.Authorization = `Bearer ${token}`
        context.commit("CURRENT_ADMIN_FETCHED", admin)
      } catch (ex) {
        let msg = ex.response ? ex.response.data.result : ex.message
        throw msg
      }
    },

    async logout(context) {
      delete Vue.axios.defaults.headers.common.Authorization
      localStorage.removeItem('authToken')
      context.commit("CURRENT_ADMIN_REMOVED")
    },

    async fetchPlaylists(context) {
      const response = await Vue.axios.get("/v1/playlists/all")
      context.commit("PLAYLISTS_FETCHED", response.data.records)
      return response.data.records
    }
  },
  modules: {
  }
})
