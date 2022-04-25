<template>
  <div class="playlog-view-container">
    <div v-if="form.isDisabled">
      <centered-loader />
    </div>

    <b-form @submit="onQuery" :disabled="form.isDisabled">
      <div class="m-3">
        <h4> <b-icon icon='list-stars' aria-hidden='true'></b-icon> 재생 이력 조회</h4>
      </div>

      <b-card bg-variant="light" >
        <b-row>
          <b-col sm="auto">
            <b-input-group prepend="시작일" class="mb-2 mr-sm-2 mb-sm-2">
              <b-form-datepicker v-model="form.dateFrom"></b-form-datepicker>
            </b-input-group>
          </b-col>
          <b-col sm="auto">
            <b-input-group prepend="종료일" class="mb-2 mr-sm-2 mb-sm-2">
              <b-form-datepicker v-model="form.dateTo"></b-form-datepicker>
            </b-input-group>
          </b-col>
          <b-col sm="auto">
            <b-button class="col" id="data-button1" v-on:click="onQuery" variant="info">
              조회
            </b-button>
          </b-col>
        </b-row>
      </b-card>
    </b-form>

    <div>
      <b-table head-variant="light" responsive :items="playlogs" :fields="fields">
        <!-- A virtual column -->
        <template v-slot:cell(index)="data">
          {{ data.index + 1 }}
        </template>
      </b-table>
    </div>

  </div>
</template>

<script>
import moment from 'moment'
import _ from 'lodash'

export default {
  name: 'Playlogs',

  data () {
    return {
      playlogs: [],
      fields: [
        {key: 'index', label: '순서', sortable: false},
        {key: 'startAt', label: '시작시간', sortable: true, formatter: (value) => moment(value).format('yyyy-MM-DD HH:mm:ss')},
        {key: 'stopAt', label: '종료시간', sortable: true, formatter: (value) => value ? moment(value).format('yyyy-MM-DD HH:mm:ss') : ''},
        {key: 'statusCode', label: '상태코드', sortable: true},
        {key: 'vmsName', label: '카메라', sortable: true},
        {key: 'userName', label: '사용자', sortable: true},
        {key: 'division', label: '소속', sortable: true},
      ],
      form: {
        dateFrom: moment().subtract(0, 'day').format('YYYY-MM-DD'),
        dateTo: moment().format('YYYY-MM-DD'),
        isDisabled: false
      }
    }
  },
  computed: {
  },
  methods: {
    async onQuery(evt) {
      evt.preventDefault()
      this.form.isDisabled = true
      try {
        let q = `dateFrom=${this.form.dateFrom}&dateTo=${this.form.dateTo}&limit=50000`
        let res = await this.axios.get('/v1/playlogs/query?' + q)
        this.playlogs = res.data.records
      }
      catch (error) {
        console.log(error)
        let text = error.response ? error.response.data.result : error.message
        this.$bvToast.toast(text, {
          title: '조회 실패',
          variant: 'danger',
          autoHideDelay: 10000,
          appendToast: true
        })
      }
      this.form.isDisabled = false
    },
  },
  mounted () {
  }
}
</script>
