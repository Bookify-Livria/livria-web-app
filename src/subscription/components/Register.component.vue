<script>

import 'primeicons/primeicons.css';
import LanguageSwitcher from "../../public/components/language-switcher.component.vue";
import AuthService from "../../public/shared-services/authentication.service.js";

export default {
  name: "Register",
  components: {
    LanguageSwitcher,
  },
  data() {
    return {
      value1: '', // display
      value2: '', // username
      value3: '', // phrase
      value4: '', // icon
      value5: '', // email
      value6: '', // password
      value7: '', // confirmPassword
      info: []
    }
  },
  computed: {
    nicknameError() {
      return this.value1 && !/^[A-Za-zÀ-ÿ\s]{1,20}$/.test(this.value1);
    },
    usernameError() {
      return this.value2 && !/^[A-Za-z0-9]{1,20}$/.test(this.value2);
    },
    urlError() {
      return this.value4 && !/^https?:\/\/[^\s]+$/.test(this.value4);
    },
    emailError() {
      return this.value5 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value5);
    },
    passwordLengthError() {
      return this.value6 && (this.value6.length < 6 || this.value6.length > 50);
    },
    passwordMatchError() {
      return this.value6 && this.value7 && this.value6 !== this.value7;
    }
  },
  methods: {
    goToLogin() { // Permite al usuario acceder a la ruta de "Login"
      this.$router.push('/login');
    },
    goToHome() { // Permite al usuario acceder a la ruta de "Home"
      this.$router.push('/home');
    },
    showFail() { // Muestra un mensaje flotante (Toast) de error si es que ocurre un error de validación para registro
      try {
        this.$refs.toast.add({
          severity: 'error',
          summary: this.$t('register-fail'),
          detail: this.$t('register-fail-details'),
          life: 3000
        });
      } catch (error) {
        console.error("Error adding toast:", error);
      }
    },
    showSuccess() { // Muestra un mensaje flotante (Toast) de confirmación si es que se registra el usuario correctamente
      try {
        this.$refs.toast.add({
          severity: 'success',
          summary: this.$t('register-success'),
          detail: this.$t('register-success-details'),
          life: 3000
        });
      } catch (error) {
        console.error("Error adding toast:", error);
      }
    },
    async registerUser() { // Permite registrar un nuevo usuario con una id auto asignada en base a la cantidad de usuario registrados
      if (this.nicknameError || this.usernameError || this.urlError || this.emailError || this.passwordMatchError) {
        this.showFail();
        return;
      }

      if (!this.value1 || !this.value2 || !this.value3 || !this.value4 || !this.value5 || !this.value6 || !this.value7) {
        this.showFail();
        return;
      }

      if (this.value6 !== this.value7) {
        this.showFail();
        return;
      }

      try {
        const newUser = {
          display: this.value1,
          username: this.value2,
          phrase: this.value3,
          icon: this.value4,
          email: this.value5,
          password: this.value6,
          confirmPassword: this.value7
        };

        const response = await AuthService.register(newUser);

        if (response.status === 200 || response.status === 201) {
          this.showSuccess();
          this.goToLogin();
        } else {
          this.showFail();
        }

      } catch (error) {
        console.error("Error registering user:", error);
        if (error.response) {
          if (error.response.status === 400 && error.response.data.message) {
            this.showFail(error.response.data.message);
          } else {
            this.showFail();
          }
        } else {
          this.showFail();
        }
      }
    }
  },
  mounted() {
  }
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
        <template #title>{{ $t('register') }}</template>
        <template #content>
          <div class="same-line">
            <div class="form-group">
              <div class="label-class">
                <label class="form-label">{{ $t('displayinput') }}</label>
              </div>

              <div class="input-class">
                <pv-input-text
                    v-model="value1"
                    class="form-input"
                    aria-label="Nickname input"
                    :class="{ 'is-invalid': nicknameError }"
                />
                <div v-if="nicknameError" class="error-msg">
                  {{ $t('errors.nickname') }}
                </div>
              </div>
            </div>

            <div class="form-group">
              <div class="label-class">
                <label class="form-label">{{ $t('userinput') }}</label>
              </div>

              <div class="input-class">
                <pv-input-text
                    v-model="value2"
                    class="form-input"
                    aria-label="Username input"
                    :class="{ 'is-invalid': usernameError }"
                />
                <div v-if="usernameError" class="error-msg">
                  {{ $t('errors.username') }}
                </div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <div class="label-class">
              <label class="form-label">{{ $t('phraseinput') }}</label>
            </div>

            <div class="input-class">
              <pv-input-text v-model="value3" class="form-input" aria-label="Phrase input"/>
            </div>
          </div>

          <div class="form-group">
            <div class="label-class">
              <label class="form-label">{{ $t('icon-input') }}</label>
            </div>

            <div class="input-class">
              <pv-input-text
                  v-model="value4"
                  class="form-input"
                  aria-label="Avatar URL input"
                  :class="{ 'is-invalid': urlError }"
              />
              <div v-if="urlError" class="error-msg">
                {{ $t('errors.url') }}
              </div>
            </div>
          </div>

          <div class="form-group">
            <div class="label-class">
              <label class="form-label">{{ $t('emailinput') }}</label>
            </div>

            <div class="input-class">
              <pv-input-text
                  inputmode="email"
                  v-model="value5"
                  class="form-input"
                  aria-label="Email input"
                  :class="{ 'is-invalid': emailError }"
              />
              <div v-if="emailError" class="error-msg">
                {{ $t('errors.email') }}
              </div>
            </div>
          </div>

          <div class="form-group">
            <div class="label-class">
              <label class="form-label">{{ $t('passinput') }}</label>
            </div>

            <div class="input-class">
              <pv-password
                  v-model="value6"
                  :feedback="false"
                  class="form-input"
                  aria-label="Password input"
                  :class="{ 'is-invalid': passwordLengthError }"
              />
              <div v-if="passwordLengthError" class="error-msg">
                {{ $t('errors.password-length') }}
              </div>
            </div>
          </div>

          <div class="form-group">
            <div class="label-class">
              <label class="form-label">{{ $t('confpass') }}</label>
            </div>

            <div class="input-class">
              <pv-password
                  v-model="value7"
                  :feedback="false"
                  class="form-input"
                  aria-label="Confirm password input"
                  :class="{ 'is-invalid': passwordMatchError && value7 !== '' }"
              />
            </div>
          </div>
        </template>

        <template #footer>
          <pv-toast ref="toast" position="top-right" style="margin-top: 8.5rem"/>
          <div class="same-line">
            <pv-button @click="goToLogin()" class="form-button">{{ $t('go-back') }}</pv-button>
            <pv-button type="submit" @click="registerUser" class="form-button" aria-label="Register button">{{ $t('register') }}</pv-button>
          </div>
        </template>
      </pv-card>
    </div>
  </div>
</template>

<style scoped>

.all {
  display: block;
  background: white;
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
  margin: 0;
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

.form-input {
  width: 100%;
  border: 2px solid var(--color-text);
  justify-self: center;
  padding: 0.5rem;
  border-radius: 5px;
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

::v-deep(.p-password) {
  width: 100%;
}

::v-deep(.p-password-input) {
  width: 100%;
  font-size: 1rem;
}

::v-deep(.p-button:hover) {
  border: 2px solid var(--color-text);
}

.p-card {
  border: 2px solid transparent;
  padding: 3rem 2rem;
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

.same-line {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 2rem;
  width: 100%;
  margin-top: 1rem;
}

.is-invalid {
  border-color: #9f000c;
  box-shadow: 0 0 0 2px #9f000c;
}
.error-msg {
  color: #9f000c;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

</style>