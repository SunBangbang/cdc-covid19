<template>
  <div>
    <h3>登录腾讯文档......</h3>
  </div>
</template>

<script>

  export default {
    name: "login-doc",
    data() {
      return {userId: null}
    },
    created() {
      this.loginTencent()
    },
    methods: {
      // 登录在线文档
      loginTencent() {
        this.userId = this.$route.params.userId
        const wordUrl = window.SITE_CONFIG['wordUrl'] + '/covid19-admin/tencentWord/getToken'
        const encodeUrl = encodeURIComponent(wordUrl)

        // let url = 'http://localhost:8001/#/login-doc-success'
        // console.log('login tencent:', this.userId,  wordUrl, encodeUrl)

        let url = 'https://docs.qq.com/oauth/v2/authorize?client_id=' + window.SITE_CONFIG['tencentClientId'] + '&redirect_uri=' + encodeUrl + '&response_type=code&scope=all&state=' + this.userId
        window.location.href=url
      }
    }
  }
</script>
<style>
  body {
    background-color: rgba(245, 245, 251, 1);
  }
</style>
