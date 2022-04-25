<template>
<div style="box-shadow: 0px 2px black;">
  <b-navbar toggleable="lg" type="light" variant="info">
    <b-navbar-brand to="/">
    <img alt="" src="../../assets/logo.png" width='30'>
    소방헬기통합지휘시스템
    </b-navbar-brand>
    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav v-show="isAuthenticated()">
        <b-nav-item to="/users">사용자관리</b-nav-item>
      </b-navbar-nav>
      <b-navbar-nav v-show="isAuthenticated()">
        <b-nav-item to="/playlogs">재생이력</b-nav-item>
      </b-navbar-nav>
      <b-navbar-nav v-show="isAuthenticated()">
        <b-nav-item to="/playlogCount">재생이력횟수</b-nav-item>
      </b-navbar-nav>

      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <b-nav-item-dropdown right>
          <!-- Using 'button-content' slot -->
          <template v-slot:button-content>
            <em><b-icon icon="gear-fill" aria-hidden="true"></b-icon></em>
          </template>
          <b-dropdown-item to="/login" v-if="!isAuthenticated()"><b-icon icon="person" aria-hidden="true"></b-icon>로그인</b-dropdown-item>
          <b-dropdown-item to="/admin-edit" replace v-if="isAuthenticated()"><b-icon icon="power" aria-hidden="true"></b-icon>관리자정보</b-dropdown-item>
          <b-dropdown-item to="/logout" replace v-if="isAuthenticated()"><b-icon icon="power" aria-hidden="true"></b-icon>로그아웃</b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: "NavigationBar",
  methods: {
    ...mapGetters(["isAuthenticated"])
  },
  computed: {
  }
}
</script>
