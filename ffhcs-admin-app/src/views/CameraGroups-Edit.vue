<template>
  <div class="cameraGroup-view-container">
    <div v-if="form.isDisabled">
      <centered-loader />
    </div>

    <b-form @submit="onSubmitInput" :disabled="form.isDisabled"><br><br> 
    
      <b-card class="text-center">

        <div>
          <h4> <b-icon icon='camera-video-fill' aria-hidden='true'></b-icon> 카메라 그룹 정보</h4>
          <b-col sm = "9">

          <b-form-group class="my-3"
            id="input-group-vmsGroupName"
            label-cols="4"
            label-cols-lg="5"
            label-align-lg="right"
            label-size="md"
            label="헬기"
            label-for="input-vmsGroupName">
            <b-form-input id="input-vmsGroupName"
              size="md"
              v-model="form.cameraGroup.vmsGroupName"
              type="text"
              readonly
              :disabled="form.isDisabled" 
              >
            </b-form-input>
          </b-form-group>
          
          <b-form-group class="my-3"
            id="input-group-fcno"
            label-cols="4"
            label-cols-lg="5"
            label-align-lg="right"
            label-size="md"
            label="호기번호"
            label-for="input-fcno">
            <b-form-input id="input-fcno"
              size="md"
              v-model="form.cameraGroup.fcno"
              :disabled="form.isDisabled"
              required
              >
            </b-form-input>
          </b-form-group>

<!--
          <b-form-group class="my-3"
            id="input-group-disabled"
            label-cols="4"
            label-cols-lg="5"
            label-align-lg="right"
            label-size="md"
            label="사용중지"
            label-for="input-disabled">
            <b-form-checkbox id="input-disabled"
              size="md"
              v-model="form.cameraGroup.disabled"
              :disabled="form.isDisabled"
              >
            </b-form-checkbox>
          </b-form-group>
-->
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
        cameraGroup: {
          fcno: ''
        },
        show: true,
        isDisabled: false
      },
      visible: false
    }
  },

  computed: {
    ...mapState([
    ]),
    inputInvalid() {
      return this.form.cameraGroup.fcno.length == 0
    }
  },
  methods: {
    ...mapGetters([
    ]),
   
    async onSubmitInput(evt) {
      evt.preventDefault()        
      this.form.isDisabled = true
      this.requestUpdate()
      this.form.isDisabled = false
    },
    async requestUpdate(evt) {
      var data = {...this.form.cameraGroup}
      try {
        console.log(`update: ${JSON.stringify(data)}`)
        data.disabled = data.disabled ? 1 : 0
        let res = await this.axios.put('/v1/cameragroups/update', data)
        this.makeToast('완료', '적용 되었습니다.')
        this.$router.push('/')
      }
      catch (error) {
        console.log('exception: ', error)
        this.makeToast('오류', error.message, 'danger')
      }
    },
    onGotoList(evt) {
      evt.preventDefault()
      this.$router.push('/')  // goto home
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
    let res = await this.axios.get('/v1/cameragroups/get/' + this.$route.params.id)
    if (res.data) {     
      this.form.cameraGroup = {...res.data}  // clone
      this.form.cameraGroup.disabled = this.form.cameraGroup.disabled ? true : false
      //console.log(`get: ${JSON.stringify(this.form.cameraGroup)}`)
    } else {
      this.makeToast('카메라그룹 조회', '카메라그룹 정보를 찾을 수 없습니다.', 'error')
    }
  }
}
</script>