<template>
  <b-container class="bv-example-row">
  </b-container>
</template>

<script>
import { mapActions } from "vuex"

export default {
  methods: {
    ...mapActions(["logout"]),
  },
  async mounted() {
    console.log('logout')
    this.$emit('setloading', true)
    await this.logout()
    this.$emit('resetloading', false)
    this.$router.replace('/login')
  },
}
</script>
