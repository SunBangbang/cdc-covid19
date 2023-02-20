<template>
  <div>
    <h3>成功登录腾讯文档!</h3>
  </div>
</template>

<script>

export default {
  name: "login-doc-success",
  data() {
      return {}
    },
  created() {
    localStorage.setItem('loginDoc', true)
    //3秒后自动关闭页面
    setTimeout(()=>{
      window.close()
    }, 3000)
  },
  methods: {
  }
}
</script>
<style>
  body {
    background-color: rgba(245, 245, 251, 1);
  }
</style>

