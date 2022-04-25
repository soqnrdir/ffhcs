<template>

  <div class="user-view-container">
    <div v-if="form.isDisabled">
      <centered-loader />
    </div>
    <div class="m-3">
      <h4> <b-icon icon='list-stars' aria-hidden='true'></b-icon> 사용자 목록</h4>
      <b-link class="mb-1 float-right">
        <router-link :to="`/users-edit/_new_`">       
        <b-button pill variant="outline-secondary; outline-light">
        <b-icon icon='person-plus' aria-hidden='true' variant="info" font-scale="2"></b-icon> 추가
        </b-button> 
        </router-link>
      </b-link>
      <b-modal @ok="deleteok" title="사용자 삭제" v-model="deleteModal.show">{{deleteModal.text}}</b-modal>
    </div>

    <div>
      <b-table head-variant="light" responsive :items="users" :fields="fields" >
        <!-- A virtual column -->
        <template v-slot:cell(index)="data">
          {{ data.index + 1 }}
        </template>
        <template #cell(userId)="data">
          <b-link>
            <router-link :to="`/users-edit/${data.item.id}`">{{ data.value }}
            </router-link>
          </b-link>          
        </template>  
        <template #cell(level)="data">
          <span v-for="(v, i) in data.value" :key="i">
            <b-badge variant="primary" v-if=v>{{i+1}}</b-badge><b-badge variant="secondary" v-else>{{i+1}}</b-badge>
          </span>
        </template>  
        <template v-slot:cell(button)="data">
          <b-button size="sm" variant = "danger" @click= "onDeleteData(data.item.id, data.item.name)">삭제</b-button>
        </template>      
      </b-table>     
    </div>

  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'Users',

  data () {
    return {
      user: {
        name: ''
      },
      users: [],
      form: {
        isDisabled: false
      },
      fields: [
        {key: 'index', label: 'NO', sortable: false},
        {key: 'userId', label: 'ID', sortable: true},
        {key: 'name', label: '이름', sortable: true},
        {key: 'division', label: '소속', sortable: true},
        {key: 'level', label: '권한', sortable: true, formatter: (value) => this.decordLevel(value)},
        {key: 'phone', label: '전화', sortable: true},
        {key: 'createdAt', label: '등록일', sortable: true, formatter: (value) => moment(value).format('YYYY-MM-DD')},
        {key: 'lastLogin', label: '최근로그인', sortable: true, formatter: (value) => value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : ''},
        {key: 'button', label: ''}
      ],
      deleteModal: {
        show: false,
        text: '',
        idToDelete: ''
      }
    }
  },
  computed: {
  },
  methods: {
    decordLevel(level) {
      //return  '<b-badge variant="primary">Primary</b-badge>' + level
      let existNums = level.split(',').map(v => parseInt(v)).filter(v => !isNaN(v))
      let result = [false, false, false, false]
      for (let i of existNums) {
        result[i-1] = true
      }
      return result
    },
    async onQuery(evt) {
      evt.preventDefault()
      this.queryList()
    },
    async queryList() {
      this.form.isDisabled = true
      try {
        let res = await this.axios.get('/v1/users/all')
        console.log(res.data)
        this.users = res.data.records
      }
      catch (error) {
        console.log(error)
        alert('load error: ' + error.message)
      }
      this.form.isDisabled = false
    },
    async onDeleteData(id, name) {
      this.deleteModal.text = `사용자: ${name} 삭제하시겠습니까?`
      this.deleteModal.idToDelete = id
      this.deleteModal.show = true
    },
    deleteok(bvModalEvt){
      bvModalEvt.preventDefault()
      this.deleteData(this.deleteModal.idToDelete)
      this.deleteModal.show = false
    },
    async deleteData(id){
      console.log(`delete id=${id}`)
      this.form.isDisabled = true
        try {
        let res = await this.axios.delete('/v1/users/delete/' + id)
        console.log(res.data)
        for (var i = 0; i < this.users.length; ++i) {
          if (this.users[i].id == id) {
            this.users.splice(i, 1)
            break
          }
        }
      } catch (error) {
        console.log(error)
        let text = error.response ? error.response.data.result : error.message
        this.$bvToast.toast(text, {
          title: '삭제 실패',
          variant: 'danger',
          autoHideDelay: 10000,
          appendToast: true
        })
      }
      this.form.isDisabled = false
    }
    
  },
  mounted () {
    this.queryList()
  },
}
</script>
