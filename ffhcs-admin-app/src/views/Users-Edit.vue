<template>
  <div class="user-view-container">
    <div v-if="form.isDisabled">
      <centered-loader />
    </div>

    <b-form @submit="onSubmitInput" :disabled="form.isDisabled"><br><br> 
    
      <b-card class="text-center">

        <div>
          <h4> <b-icon icon='person-fill' aria-hidden='true'></b-icon> 사용자 정보  {{modeName}}</h4>
          <b-col sm = "9">
          <b-form-group class="my-3"
                        id="input-group-userId"
                        label-cols="4"
                        label-cols-lg="5"
                        label-align-lg="right"
                        label-size="md"
                        label="ID"
                        label-for="update-userId">

            <b-form-input id="update-userId"
                          size="md"
                          v-model="form.user.userId"
                          type="text"
                          :disabled="form.isDisabled"
                          required>
            </b-form-input>
          </b-form-group>

          <b-form-group class="my-3"
                        id="input-group-name"
                        label-cols="4"
                        label-cols-lg="5"
                        label-align-lg="right"
                        label-size="md"
                        label="이름"
                        label-for="update-name">
                        
            <b-form-input id="update-name"
                          size="md" 
                          v-model="form.user.name"
                          type="text"
                          :disabled="form.isDisabled" 
                          required>
            </b-form-input>
          </b-form-group>
          
          <b-form-group class="my-3"
                        label-cols="4"
                        label-cols-lg="5"
                        label-align-lg="right"
                        label-size="md"
                        label="소속"
                        label-for="input-md">

            <b-form-input size="md" 
                          v-model="form.user.division"
                          :disabled="form.isDisabled"
                          required>
            </b-form-input>
          </b-form-group>

          <b-form-group class="my-3"
                        label-cols="4"
                        label-cols-lg="5"
                        label-align-lg="right"
                        label-size="md"
                        label="권한"
                        label-for="input-cmd">

              <b-input-group>
                <div>
                  <b-check v-model="form.level1">계기판</b-check>
                </div>
                <div style="margin-left:10px">
                  <b-check v-model="form.level2">승객</b-check>
                </div>
                <div style="margin-left:10px">
                  <b-check v-model="form.level3">전방</b-check>
                </div>
                <div style="margin-left:10px">
                  <b-check v-model="form.level4">호이스트</b-check>
                </div>
              </b-input-group>
            </b-form-group>

          <b-form-group class="my-3"
                        id="input-group-phone"
                        label-cols="4" 
                        label-cols-lg="5" 
                        label-align-lg="right" 
                        label-size="md" 
                        label="전화" 
                        label-for="update-phone">
                      
            <b-form-input id="update-phone"
                          size="md" 
                          v-model="form.user.phone"
                          type="text"
                          placeholder="숫자만 입력하세요."
                          :disabled="form.isDisabled" 
                          required>
            </b-form-input>
          </b-form-group>
        
          <b-form-group class="my-3" 
                        id="input-group-createdAt"
                        label-cols="4" 
                        label-cols-lg="5" 
                        label-align-lg="right" 
                        label-size="md" 
                        label="등록일" 
                        label-for="update-createdAt">

              <b-input-group>
                <b-form-input id="update-createdAt"
                              type = "date" 
                              placeholder="YYYY-MM-DD" 
                              size="md" 
                              v-model="form.user.createdAt"
                              :disabled="form.isDisabled" 
                              required>
                </b-form-input>
            </b-input-group>
          </b-form-group>

          <b-form-group class="my-3"
                        label-cols="4"
                        label-cols-lg="5"
                        label-align-lg="right"
                        label-size="md"
                        label="비밀번호"
                        label-for="input-cmd">

              <b-input-group>
                <b-form-input type = "text"
                              size="md" 
                              v-model="form.user.password"
                              :disabled="form.isDisabled || !form.user.passwordChange" 
                              required>
                </b-form-input>
            <div align="right">
              <b-check v-model="form.user.passwordChange">비밀번호 설정</b-check>
            </div>
            </b-input-group>
          </b-form-group>
          </b-col>
        </div>
        <hr>
        <div>
          <b-button size="md" v-on:click="onSubmitInput" 
                    :disabled='inputInvalid' variant="info">
            저장
          </b-button>
            &nbsp;
          <b-button size="md" v-on:click="onGotoList" variant="info">
            닫기
          </b-button>
        </div>
      </b-card>

    </b-form>

  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex"
import moment from 'moment'

export default {
  name: 'Users',
 
  data () {
    return {
      form: {
        user: {
          userId: '',
          name: '',
          level:'',
          phone: '',
          createdAt:  moment().format('YYYY-MM-DD'),
          password: '',
          passwordChange: false,
        },
        level1: true,
        level2: true,
        level3: true,
        level4: true,
        show: true,
        isDisabled: false
      },
      visible: false
    }
  },

  computed: {
    ...mapState([
    ]),
    modeName: function() {
      return this.isAddMode ? '추가' : '수정'
    },
    inputInvalid() {
      return this.form.isDisabled || 
          this.form.user.userId.length == 0 ||
          this.form.user.name.length == 0 ||
          this.form.user.phone.length == 0 ||
          this.form.user.createdAt.length == 0
    }
  },
  methods: {
    ...mapGetters([
    ]),
   
    async onSubmitInput(evt) {
      evt.preventDefault()        
      this.form.isDisabled = true
      if (this.isAddMode) {
        this.requestAdd()
      } else {
        this.requestUpdate()
      }
      this.form.isDisabled = false
    },
    async requestUpdate(evt) {
      var data = this.form.user
      try {
        //권한 설정
        let levelVal = []
        if(this.form.level1 == true) levelVal.push('1')
        if(this.form.level2 == true) levelVal.push('2')
        if(this.form.level3 == true) levelVal.push('3')
        if(this.form.level4 == true) levelVal.push('4')
        data.level = levelVal.join(',')
        let res = await this.axios.put('/v1/users/update', data)
        this.makeToast('추가', '적용 되었습니다.')
        this.$router.push('/users')
      }
      catch (error) {
        console.log('exception: ', error)
        this.makeToast('오류', error.message, 'danger')
      }
    },
    async requestAdd(evt) {
      var data = this.form.user
      try {
        // 권한 설정
        let levelVal = []
        if(this.form.level1 == true) levelVal.push('1')
        if(this.form.level2 == true) levelVal.push('2')
        if(this.form.level3 == true) levelVal.push('3')
        if(this.form.level4 == true) levelVal.push('4')
        data.level = levelVal.join(',')

        await this.axios.post('/v1/users/add', data)
        this.makeToast('추가', '적용 되었습니다.')
        this.$router.push('/users')
      }
      catch (error) {
        console.log('exception: ', error)
        let msg = error.response ? error.response.data.result : error.message
        this.makeToast('오류', msg, 'danger')
      }
    },
    onClearInput(evt) {
      evt.preventDefault()
      this.form.user = {...this.userSaved}  // clone
    },
    onGotoList(evt) {
      evt.preventDefault()
      this.$router.push('/users')
    },
    makeToast(title, text, variant='success') {
      console.log(`toast ${text} ${variant}`)
        this.$bvToast.toast(text, {
          title: title,
          variant: variant,
          autoHideDelay: 10000,
          appendToast: false
        })
      }
  },
  async mounted () {
    console.log('mounted: id=', this.$route.params.id)
    this.isAddMode = (this.$route.params.id === '_new_')
    if (!this.isAddMode) {
      let res = await this.axios.get('/v1/users/get/' + this.$route.params.id)
      if (res.data) {     
        this.form.user = {...res.data}  // clone
        // 권한 checked설정
        let getAuth = this.form.user.level
        
        if(getAuth.indexOf('1') != -1) {
           this.form.level1 = true
        } else {
          this.form.level1 = false
        }
        if(getAuth.indexOf('2') != -1) {

          this.form.level2 = true
        } else {
          this.form.level2 = false
        }

        if(getAuth.indexOf('3') != -1) {
          this.form.level3 = true
        } else {
          this.form.level3 = false
        }

        if(getAuth.indexOf('4') != -1) {
          this.form.level4 = true
        } else {
          this.form.level4 = false
        }
      } else {
        this.makeToast('사용자 조회', '사용자 정보를 찾을 수 없습니다.', 'error')
      }
    }
  }
}
</script>