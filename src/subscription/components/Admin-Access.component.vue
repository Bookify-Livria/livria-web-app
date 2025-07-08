<script>
import LanguageSwitcher from "../../public/components/language-switcher.component.vue";
import { UserApiService } from "../service/user-api.service.js";
import AuthService from "../../public/shared-services/authentication.service.js";

export default {
  name: "Admin-Access",
  components: {
    LanguageSwitcher,
  },
  data() {
    return {
      pin: '',
      password: '',
      adminUsername: ''
    }
  },
  methods: {
    goBack() { // Permite al usuario acceder a la ruta de "Login"
      this.$router.push('/login');
    },
    goAdminPage() { // Permite al usuario acceder a la ruta de "Admin Dashboard"
      this.$router.push('/dashboard');
    },
    showFail() { // Muestra un mensaje flotante (Toast) de error de inicio de sesión si es fallido
      try {
        this.$refs.toast.add({
          severity: 'error',
          summary: this.$t('login-fail'),
          detail: this.$t('login-fail-details'),
          life: 3000
        });
      } catch (error) {
        console.error("Error adding toast:", error);
      }
    },
    async validateAdminAccess() { // Esta función maneja la autenticación completa del administrador
      if (!this.adminUsername || !this.password || !this.pin) {
        this.showFail();
        return;
      }

      const credentials = {
        username: this.adminUsername,
        password: this.password,
        securityPin: this.pin
      };

      try {
        await AuthService.loginAsAdmin(credentials);

        const currentUser = AuthService.getCurrentUser();

        if (currentUser && currentUser.token && currentUser.role === 'Admin') {
          console.log("Admin access confirmed! Redirecting to dashboard.");
          this.goAdminPage();
        } else {
          console.warn("Admin access verification failed (Backend check). Invalid credentials or role mismatch.");
          this.showFail();
        }
      } catch (error) {
        console.error("Error during admin access validation:", error);
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          this.showFail();
        }
      }
    }
  },
  mounted() {

  },

}
</script>

<template>
  <div class="all">
    <div class="head">
      <img src="../../assets/images/logo/logo.png" alt="Logo" height="45px">
      <language-switcher />
    </div>
    <div class="content">
      <pv-card>
        <template #title>{{ $t('admin-access')}}</template>
        <template #content>
          <div class="form-group">
            <div class="label-class">
              <label class="form-label">{{ $t('userinput')}}</label>
            </div>

            <div class="input-class">
              <pv-input-text v-model="adminUsername" class="form-input" aria-label="User input"/>
            </div>
          </div>

          <div class="form-group">
            <div class="label-class">
              <label class="form-label">{{ $t('passinput') }}</label>
            </div>

            <div class="input-class">
              <pv-password v-model="password" :feedback="false" class="form-input" aria-label="Confirm password input"/>
            </div>
          </div>

          <div class="form-group">
            <div class="label-class">
              <label class="form-label">{{ $t('security-pin')}}</label>
            </div>

            <div class="otp-input-class">
              <pv-otp v-model="pin" integerOnly/>
            </div>
          </div>
        </template>

        <template #footer>
          <pv-toast ref="toast"  position="top-right" style="margin-top: 2rem" />
          <div class="same-line">
            <pv-button @click="goBack()" class="form-button">{{ $t('go-back') }}</pv-button>
            <pv-button @click="validateAdminAccess" class="form-button" aria-label="Login button">{{ $t('login') }}</pv-button>
          </div>
        </template>
      </pv-card>
    </div>
  </div>
</template>

<style scoped>

.all {
  display: block;
  justify-content: space-around;
  justify-items: center;
  height: 100%;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  align-items: center;
  margin-bottom: 0;
}

::v-deep(.p-card-title) {
  text-align: center;
  font-family: var(--font-heading);
  text-transform: uppercase;
  letter-spacing: 3px;
  font-size: 36px;
  font-weight: 600;
  color: var(--color-blue);
  margin-bottom: 1rem;
}

.head {
  display: flex;
  justify-items: center;
  justify-content: space-around;
  width: 100%;
  padding: 2rem 8rem;
}

.form-group {
  display: block;
  margin-bottom: 1rem;
  align-items: center;
  justify-items: center;
  justify-content: center;
  width: 100%;
}

.form-label {
  min-width: 90px;
  font-size: 1rem;
}

.label-class {
  text-align: left;
  justify-content: left;
  width: 100%;
}

.input-class {
  width: 100%;
}

.link-class {
  justify-content: right;
  justify-items: right;
  text-align: right;
  width: 100%;
  margin-bottom: 1rem;
}

.form-input {
  width: 100%;
  border: 2px solid var(--color-text);
  justify-self: center;
  padding: 0.5rem;
  border-radius: 5px;
}

.forgot-password {
  color: var(--color-blue);
}

.content {
  width: 50%;
  justify-items: center;
  justify-content: center;
  align-items: center;
}

::v-deep(.p-card-body) {
  justify-content: center;
  justify-items: center;
  width: 75%;
}

::v-deep(.p-card-content) {
  justify-content: center;
  text-align: center;
  width: 100%;
}

::v-deep(.p-card-footer) {
  justify-content: center;
  text-align: center;
}

.form-button {
  background-color: transparent;
  color: var(--color-blue);
  border: 2px solid var(--color-blue);
  width: 175px;
  height: 50px;
  border-radius: 15px;
  font-size: 18px;
  text-align: center;
  justify-content: center;
}

.p-card {
  border: 2px solid transparent;
  padding: 2.5rem;
  border-radius: 10px;
  margin-bottom: 1rem;
  color: var(--color-text);
  text-align: left;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  align-items: center;
  justify-content: center;
  background-color: rgba(var(--color-secondary-rgb), 0.15);
  width: 100%;
}

.half-width {
  width: 50%;
}

.otp-input-class {
  width: 100%;
  display: flex;
  justify-items: center;
  justify-content: center;
  align-items: center;
}

.p-inputotp {
  gap: 0.5rem;
}

::v-deep( .p-inputotp-input ) {
  text-align: center;
  border: 2px solid var(--color-text);
  border-radius: 5px;
  width: 100%;
  padding: 0.5rem;
}

.same-line {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 2rem;
  width: 100%;
  margin-top: 1rem;
}

</style>