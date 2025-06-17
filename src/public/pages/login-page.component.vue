<script>
import Login from "../../subscription/components/Login.component.vue";

export default {
  name: "login-page",
  components: {
    Login,
  }
}

</script>


<template>
  <!-- Login form -->
  <div class="login__container">
    <Login/>
  </div>

</template>

<style scoped>
.login__container {
<<<<<<< Updated upstream
  margin-top: 200px;
=======
  margin: 3rem calc(-1 * ((100vw - 100%) / 2));
  width: 100vw;
  padding: 0 3rem;
>>>>>>> Stashed changes
}
</style>