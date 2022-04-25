<template>
<div  class="home-view-container">
  <!--
  <b-card>
    <b-row>

    </b-row>
  </b-card>
  -->

  <div v-if="loading">
    <centered-loader />
  </div>

  <div v-if="!loading" class="mt-3">
    <h4> <b-icon icon='list-stars' aria-hidden='true'></b-icon> 카메라 목록</h4>
    <div>
      <b-button size="sm" variant="info" class="mb-2 float-right" @click="refreshData(true)">새로고침</b-button>

      <b-table head-variant="light" responsive :items="playlists" :fields="playlistFields" >
        <template v-slot:cell(index)="data">
          {{ data.index + 1 }}
        </template>

        <template #cell(vmsGroupName)="data">
          <b-link>
            <router-link :to="`/cameragroups-edit/${data.item.id}`">{{ data.value }}
            </router-link>
          </b-link>
        </template>

        <template #cell(status)="data">
           <b-icon v-show="data.value == 'Offline'" variant="secondary" icon='circle-fill' aria-hidden='false'></b-icon>
           <b-icon v-show="data.value == 'Online'" variant="primary" icon='circle-fill' aria-hidden='false'></b-icon>
        </template> 

        <template v-slot:cell(addresses)="data">
          <!--
          <b-icon icon='map-fill' aria-hidden='true'
            v-b-popover.hover.top="'GPS 수신일시: ' + new Date(data.item.gpsDate).toLocaleString()"
            variant="primary"
            v-if="data.item.gpsDate"></b-icon>
          -->
          <div v-if="data.item.addresses.length">
          {{ data.item.addresses[0].text }}
          <br><b-badge pill variant="light">{{ new Date(data.item.gpsDate).toLocaleString() }}</b-badge>
          </div>
        </template>

        <template #cell(show_details)="row">
          <b-button size="sm" @click="row.toggleDetails" class="mr-2">
            {{ row.detailsShowing ? '닫기' : '보기'}}
          </b-button>
        </template>

        <template #row-details="row" >
          <b-card v-bind:key="camera.id" v-for="camera in row.item.cameras">
            <b-row class="mb-3">
              <b-col sm="3" class="text-sm-left"><b>{{ camera.vmsName }}</b></b-col>
              <b-col>
                고화질
                <b-icon v-show="!camera.vmsOnline1" variant="secondary" icon='circle-fill' aria-hidden='false'></b-icon>
                <b-icon v-show="camera.vmsOnline1" variant="primary" icon='circle-fill' aria-hidden='false'></b-icon>
                <b-col class="text-sm-left"><b>{{ camera.vmsUrl1 }}</b></b-col>
              </b-col>
              <b-col>
                저화질
                <b-icon v-show="!camera.vmsOnline2" variant="secondary" icon='circle-fill' aria-hidden='false'></b-icon>
                <b-icon v-show="camera.vmsOnline2" variant="primary" icon='circle-fill' aria-hidden='false'></b-icon>
                <b-col class="text-sm-left"><b>{{ camera.vmsUrl2 }}</b></b-col>
              </b-col>
            </b-row>
          </b-card>
        </template>
      </b-table>
    </div>
  </div>
</div>

</template>
<script>
import { mapState, mapActions } from "vuex"
import moment from 'moment'
//import _ from 'lodash'

export default {
  name: 'home',
 
  data() {
    return {
      loading: false,
      refreshInterval: 60000,
      timer: null,
      playlistFields: [
        {key: 'index', label: 'NO', sortable: false},
        {key: 'vmsGroupName', label: '헬기', sortable: true},
        {key: 'fcno', label: '호기', sortable: true},
        {key: 'status', label: '상태', sortable: true, formatter: (value) => this.decodeStatus(value)},
        {key: 'onlineAt', label: '온라인 일시', sortable: true, formatter: (value) => value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : ''},
        {key: 'offlineAt', label: '오프라인 일시', sortable: true, formatter: (value) => value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : ''},
        {key: 'addresses', label: '위치', sortable: true},
        {key: 'show_details', label: '카메라'},
      ],
    }
  },
  computed: {
    ...mapState([
      'playlists'
    ])
  },
  methods: {
    ...mapActions([
      'fetchPlaylists'
    ]),

    decodeStatus(value) {

      const codeMap = {0: '미확인', 1: 'Online', 2: 'Offline'}
      return codeMap[value]
    },

    async refreshData(setLoading) {
      if (setLoading)
        this.loading = true
        await this.fetchPlaylists()
      if (setLoading)
        this.loading = false
    },

    checkRefreshTimer() {
      clearInterval(this.timer)
      console.log('this.refreshInterval', this.refreshInterval)
      if (this.refreshInterval > 0) {
        this.timer = setInterval(() => this.refreshData(false), this.refreshInterval)
      }
    },
  },

  mounted() {
    this.refreshData(true)
    //this.checkRefreshTimer()
  },

  beforeDestroy() {
    clearInterval(this.timer)
  }
}
</script>
