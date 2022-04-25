<template>
  <b-container class="bv-example-row">
  <b-row class="justify-content-md-center">
    <b-col sm="6">
    <b-form @submit="onSubmit" v-if="show">
      <b-card-group style="text-align:center;">
          <b-card 
          header="관리자 정보 변경"
          header-text-variant="white"
          header-tag="header"
          header-bg-variant="dark"
          footer-tag="footer"
          footer-bg-variant="#eee"
          footer-border-variant="gray"
          style="box-shadow: 5px 5px 5px 5px #eee;color: #5b5d5f;margin-top:100px;"
        >  
      <b-form-group
        label-cols="4" label-cols-lg="2" label-size="sm"
        id="input-group-adminId"
        label="관리자 ID:"
        label-for="login-adminId"
        style="padding-top:20px"
      >
        <b-form-input
          id="login-adminId"
          v-model="this.admin.adminId"
          type="text"
          required
          autocomplete="adminname"
          readonly
        ></b-form-input>
      </b-form-group>

      <b-form-group
        label-cols="4" label-cols-lg="2" label-size="sm"
        id="input-group-password"
        label="새패스워드:"
        label-for="input-password"
      >
        <b-form-input
          id="input-password"
          v-model="form.password"
          type="password"
          autocomplete="current-password"
        ></b-form-input>
      </b-form-group>

      <b-form-group
        label-cols="4" label-cols-lg="2" label-size="sm"
        id="input-group-password-check"
        label="패스워드확인:"
        label-for="input-password-check"
      >
        <b-form-input
          id="input-password-check"
          v-model="form.passwordCheck"
          type="password"
        ></b-form-input>
      </b-form-group>

      <div style="padding-top:30px;">
        <b-button type='submit' :disabled='isDisabled || this.form.password != this.form.passwordCheck' variant="info">패스워드 변경</b-button>
      </div>

    </b-card>
    </b-card-group>
    </b-form>
    
    <b-card class="mt-3" header="Form Data Result" v-if="false">
      <pre class="m-0">{{ form }}</pre>
    </b-card>
    </b-col >

  </b-row >

</b-container>
</template>

<script>
import { mapState } from "vuex"

export default {
  // 데이터 객체
  data() {
    return {
      form: {
        adminId: '',
        password: '',
        passwordCheck: '',
      },
      show: true,
      isDisabled: false
    }
  },
  computed: {
    ...mapState([
      'admin'
    ])
  },
  methods: {
    onSubmit(evt) {
      evt.preventDefault()
      this.changePassword(this.form.password)
    },
    
    async changePassword(password) {
      if (!password) {
        if (!confirm('빈 패스워드를 설정하시 겠습니까?'))
          return
      }
      this.isDisabled = true
      try {
        let res = await this.axios.post('/v1/auth/admin-password', { password: password })
        alert('Password changed!')
        this.$router.push('/')
      }
      catch (ex) {
        console.log(error)
        let msg = ex.response ? ex.response.data.result : ex.message
        alert('Error: ' + msg)
      }
      this.isDisabled = false
    },
  },
  mounted() {
  },
}

</script>
<style scoped>
.b-card {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}
</style>
