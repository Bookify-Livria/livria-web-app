<script>
import AuthService from "../../public/shared-services/authentication.service.js";
import {UserApiService} from "../service/user-api.service.js";
import confirmation from "../components/Subscription-confirmation.component.vue"

export default {
  name: "CommunityPlanComponent",
  components: {
    confirmation
  },
  data() {
    return {
      acceptedTerms: false,
      acceptedPrivacy: false,
      showConfirmation: false,
      planAccess: false
    };
  },
  methods: {
    loadInfo() {
      const freshUser = AuthService.getCurrentUser();
      this.user = freshUser;

      if (this.user.subscription === "communityplan") {
        this.goCommunities();
      }

    },
    goCommunities(){ // Permite al usuario acceder directamente a la ruta de "communitites"
      this.$router.push('/communities');
    },
    youveGotANoti() { // Muestra un mensaje flotante (Toast) para informar al usuario que recibió una notificación
      this.$toast.add({
        severity: 'secondary',
        summary: this.$t('noti.notice'),
        detail: this.$t('noti.info'),
        life: 3000
      });
    },
    async updateSubs() { // Permite asignar la suscripción a comunidades del usuario loggeado
      const service = new UserApiService();

      if (!this.user) {
        console.error('No se pudo obtener el usuario loggeado. Operación de actualización cancelada.');
        return;
      }

      try {
        await service.updateUserSubscription(this.user.userId, "communityplan");

        this.showConfirmation = true;
        console.log('showConfirmation:', this.showConfirmation);
        this.youveGotANoti();
      } catch (error) {
        console.error('Fail!!!!!!!', error);
      }
    },
  },
  mounted(){
    this.loadInfo();
  }
};
</script>

<template>
  <div class="plan-container" aria-label="Subscription info section">
    <div class="intro-content">
      <h1 class="h1__title">{{ $t("plan")}}</h1>
      <h3 class="h3__title">
        {{ $t("plan-content-1")}}
      </h3>
      <h3 class="h3__title">
        {{ $t("plan-content-2")}}
      </h3>
    </div>

    <pv-card class="plan-card">
      <template #content>
        <div class="step-content">
          <h3 class="h3__title go--orange">{{ $t("purchase.payment") }}</h3>
          <p>{{ $t("purchase.izipay")}}</p>

          <div class="izipay-box">
            <img
                class="izipay-logo"
                alt="izipay"
                src="https://recurrentes.izipay.pe/pre-affiliation/static/media/Logo-izipay-v2.5fcb6d37210c5929c08e.png"
            />
          </div>

          <div class="checkbox-group">
            <label>
              <input type="checkbox" v-model="acceptedTerms" />
              {{ $t("purchase.terms") }}
            </label>
            <label>
              <input type="checkbox" v-model="acceptedPrivacy" />
              {{ $t("purchase.privacy") }}
            </label>
          </div>

          <div class="nav-buttons">
            <pv-toast position="top-right" style="margin-top: 10rem" />
            <button
                class="pay-button"
                type="button"
                :disabled="!acceptedTerms || !acceptedPrivacy"
                @click="updateSubs"
                aria-label="Pay subscription"
            >
              {{ $t("purchase.pay") }}
            </button>
          </div>
        </div>
      </template>
    </pv-card>
  </div>
  <confirmation v-if="showConfirmation" @close="goCommunities"></confirmation>

</template>


<style scoped>
.plan-container {
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.plan-card {
  margin: 2rem;
  max-width: 1000px;
  width: 100%;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
}

.step-content {
  margin: 2rem;
}

.izipay-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-bottom: 2rem;
}

.izipay-logo {
  height: 4rem;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.95rem;
}

.nav-buttons {
  display: flex;
  justify-content: flex-end;
}

.pay-button {
  background-color: #ffcc00;
  color: #1a237e;
  font-weight: 600;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.pay-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pay-button:hover:not(:disabled) {
  background-color: #ffb300;
}
</style>

