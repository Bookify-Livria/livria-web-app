<script>
import dashboardSidebar from "../../manager/components/dashboard-sidebar.component.vue"
import LanguageSwitcher from "../../public/components/language-switcher.component.vue"
import { UserApiService } from "@/subscription/service/user-api.service.js";

export default {
  name: "SettingsComponent",
  components: {
    dashboardSidebar,
    LanguageSwitcher
  },
  data() {
    return {
      admin: null,
      loading: true,
      sidebarCollapsed: false,
      activeTab: 'profile',
      saveStatus: '',
      showChangePassword: false,

      userProfile: {
        display: '',
        username: '',
        email: '',
        securityPin: '',
      },

      passwordForm: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      // App
      appSettings: {
        notifications: true,
        emailAlerts: true,
        autoSave: true,
        pageSize: 10
      },

      profileErrors: {},
      passwordErrors: {},
      systemErrors: {}
    };
  },
  methods: {
    async fetchUserInfo() { // Carga la información del administrador
      try {
        this.loading = true;
        const userApiService = new UserApiService();
        this.admin = await userApiService.getAdminUser();

        if (this.admin) {
          this.userProfile.display = this.admin.display;
          this.userProfile.username = this.admin.username;
          this.userProfile.email = this.admin.email;
          this.userProfile.securityPin = this.admin.securityPin;
        } else {
          console.warn("No administrator user found.");
        }

      } catch (error) {
        console.error("Error fetching admin user info:", error);
        this.saveStatus = 'error';
      } finally {
        this.loading = false;
      }
    },
    toggleSidebar() { // Para ocultar el menú vertical
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },
    switchTab(tab) { // Para alternar entre pestañas de ajustes
      this.activeTab = tab;
      this.saveStatus = '';
      this.profileErrors = {};
      this.passwordErrors = {};
      this.systemErrors = {};
    },
    validateProfileForm() { // Valida que se ingresen los valores correctos en los campos de información
      const errors = {};
      if (!this.userProfile.display.trim()) {
        errors.display = 'El nombre es obligatorio';
      }
      if (!this.userProfile.username.trim()) {
        errors.username = 'El nombre de usuario es obligatorio';
      }
      if (!this.userProfile.email.trim()) {
        errors.email = 'El correo electrónico es obligatorio';
      } else if (!/^\S+@\S+\.\S+$/.test(this.userProfile.email)) {
        errors.email = 'El correo electrónico no es válido';
      }
      if (!this.userProfile.securityPin.trim()) {
        errors.securityPin = 'El PIN es obligatorio';
      } else if (!/^\d{4}$/.test(this.userProfile.securityPin)) {
        errors.securityPin = 'El PIN debe tener exactamente 4 dígitos';
      }
      this.profileErrors = errors;
      return Object.keys(errors).length === 0;
    },
    async saveProfile() { // Actualiza los datos del administrador
      if (!this.validateProfileForm()) {
        this.saveStatus = 'error';
        return;
      }
      try {
        this.loading = true;
        const userApiService = new UserApiService();

        const updatedAdminData = {
          ...this.admin,
          display: this.userProfile.display,
          username: this.userProfile.username,
          email: this.userProfile.email,
          securityPin: this.userProfile.securityPin,
        };

        const updatedAdmin = await userApiService.updateAdminUser(updatedAdminData);

        this.admin = updatedAdmin;
        this.userProfile.display = updatedAdmin.display;
        this.userProfile.username = updatedAdmin.username;
        this.userProfile.email = updatedAdmin.email;
        this.userProfile.securityPin = updatedAdmin.securityPin;

        this.saveStatus = 'success';
        setTimeout(() => {
          this.saveStatus = ''
        }, 3000);
      } catch (error) {
        console.error("Error saving profile:", error);
        this.saveStatus = 'error';
      } finally {
        this.loading = false;
      }
    },
    async saveAppSettings() { // Simula el guardar la configuración de la app
      try {
        this.loading = true;
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulated save

        this.saveStatus = 'success';
        setTimeout(() => {
          this.saveStatus = '';
        }, 3000);
      } catch (error) {
        console.error("Error saving app settings:", error);
        this.saveStatus = 'error';
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    this.fetchUserInfo();
  }
};
</script>

<template>
  <div class="settings-page" :class="{ 'sidebar-expanded': !sidebarCollapsed }">
    <dashboardSidebar
        :collapsed="sidebarCollapsed"
        @toggle-sidebar="toggleSidebar"
    />

    <div class="main-content">
      <div v-if="loading && !admin" class="loading-container">
        <p>{{ $t('dashboard-settings.loading') }}</p>
      </div>

      <div v-else class="settings-container">
        <div class="settings-header">
          <h1>{{ $t('dashboard-settings.title') }}</h1>
          <p>{{ $t('dashboard-settings.subtitle') }}</p>
        </div>

        <div class="settings-content">
          <div class="settings-tabs">
            <div
                class="tab-item"
                :class="{ active: activeTab === 'profile' }"
                @click="switchTab('profile')"
            >
              <i class="pi pi-user"></i>
              <span>{{ $t('dashboard-settings.profile') }}</span>
            </div>
            <div
                class="tab-item"
                :class="{ active: activeTab === 'app' }"
                @click="switchTab('app')"
            >
              <i class="pi pi-desktop"></i>
              <span>{{ $t('dashboard-settings.app') }}</span>
            </div>
            <div
                class="tab-item"
                :class="{ active: activeTab === 'system' }"
                @click="switchTab('system')"
                v-if="admin?.role === 'Administrator'"
            >
              <i class="pi pi-cog"></i>
              <span>{{ $t('dashboard-settings.system') }}</span>
            </div>
          </div>

          <div class="settings-forms">
            <div v-if="saveStatus" class="status-message" :class="saveStatus">
              <i :class="saveStatus === 'success' ? 'pi pi-check-circle' : 'pi pi-times-circle'"></i>
              <span v-if="saveStatus === 'success'">{{ $t('dashboard-settings.save-success') }}</span>
              <span v-else>{{ $t('dashboard-settings.save-error') }}</span>
            </div>

            <div v-if="activeTab === 'profile'" class="form-section">
              <h2 class="h2__title" style="margin-bottom: 2rem">{{ $t('dashboard-settings.profile-info') }}</h2>

              <div class="user-greeting">
                <div class="user-avatar">
                  <span>{{ admin?.username?.charAt(0).toUpperCase() || 'U' }}</span>
                </div>
                <div class="greeting-text">
                  <h2>{{ $t('dashboard-home.hello') }}, {{ admin?.display || $t('dashboard-home.user') }}!</h2>
                  <p>{{ $t('dashboard-home.role') }}: {{ $t('dashboard-home.admin') }}</p>
                </div>
              </div>

              <div class="same-line">
                <div class="form-group">
                  <label for="name">{{ $t('dashboard-settings.name') }}:</label>
                  <input
                      type="text"
                      id="name"
                      v-model="userProfile.display"
                      class="form-control"
                      :class="{ 'error': profileErrors.display }"
                  />
                  <span class="error-message" v-if="profileErrors.display">{{ profileErrors.display }}</span>
                </div>

                <div class="form-group">
                  <label for="name">{{ $t('dashboard-settings.username') }}:</label>
                  <input
                      type="text"
                      id="name"
                      v-model="userProfile.username"
                      class="form-control"
                      :class="{ 'error': profileErrors.username }"
                  />
                  <span class="error-message" v-if="profileErrors.username">{{ profileErrors.username }}</span>
                </div>
              </div>

              <div class="same-line">
                <div class="form-group">
                  <label for="email">{{ $t('dashboard-settings.email') }}:</label>
                  <input
                      type="email"
                      id="email"
                      v-model="userProfile.email"
                      class="form-control"
                      :class="{ 'error': profileErrors.email }"
                  />
                  <span class="error-message" v-if="profileErrors.email">{{ profileErrors.email }}</span>
                </div>
                <div class="form-group">
                  <label for="securityPin">{{ $t('dashboard-settings.security-pin') }}:</label>
                  <input
                      type="text"
                      id="securityPin"
                      v-model="userProfile.securityPin"
                      class="form-control"
                      maxlength="4"
                      pattern="\d{4}"
                      inputmode="numeric"
                      :class="{ 'error': profileErrors.securityPin }"
                  />
                  <span class="error-message" v-if="profileErrors.securityPin">{{ profileErrors.securityPin }}</span>
                </div>
              </div>

              <div class="form-actions">
                <button class="btn-save" @click="saveProfile" :disabled="loading">
                  <i class="pi pi-save" v-if="!loading"></i>
                  <i class="pi pi-spin pi-spinner" v-else></i>
                  {{ $t('dashboard-settings.save') }}
                </button>
              </div>
            </div>

            <div v-if="activeTab === 'app'" class="form-section">
              <h2 class="h2__title" style="margin-bottom: 2rem">{{ $t('dashboard-settings.app-settings') }}</h2>

              <div class="same-line">
                <div class="setting-item">
                  <div class="setting-info">
                    <h3>{{ $t('dashboard-settings.notifications') }}</h3>
                  </div>
                  <div class="same-line">
                    <div class="toggle-switch">
                      <input type="checkbox" id="notifications" v-model="appSettings.notifications" />
                      <label for="notifications"></label>
                    </div>
                    <p>{{ $t('dashboard-settings.notifications-desc') }}</p>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <h3>{{ $t('dashboard-settings.email-alerts') }}</h3>
                  </div>
                  <div class="same-line">
                    <div class="toggle-switch">
                      <input type="checkbox" id="email-alerts" v-model="appSettings.emailAlerts" />
                      <label for="email-alerts"></label>
                    </div>
                    <p>{{ $t('dashboard-settings.email-alerts-desc') }}</p>
                  </div>
                </div>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h3>{{ $t('dashboard-settings.auto-save') }}</h3>
                </div>
                <div class="same-line">
                  <div class="toggle-switch">
                    <input type="checkbox" id="auto-save" v-model="appSettings.autoSave" />
                    <label for="auto-save"></label>
                  </div>
                  <p>{{ $t('dashboard-settings.auto-save-desc') }}</p>
                </div>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h3>{{ $t('dashboard-settings.page-size') }}</h3>
                  <p>{{ $t('dashboard-settings.page-size-desc') }}</p>
                </div>
                <div class="same-line">
                  <select v-model="appSettings.pageSize" class="form-control">
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
              </div>

              <div class="form-actions">
                <button class="btn-save" @click="saveAppSettings" :disabled="loading">
                  <i class="pi pi-save" v-if="!loading"></i>
                  <i class="pi pi-spin pi-spinner" v-else></i>
                  {{ $t('dashboard-settings.save') || 'Guardar cambios' }}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 70px;
  transition: margin-left 0.3s ease;
  width: 100%;
}

.sidebar-expanded .main-content {
  margin-left: 250px;
  width: calc(100% - 250px);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  font-size: 1.2rem;
  color: var(--color-primary);
}

.settings-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.settings-header {
  text-align: center;
  margin-bottom: 2rem;
}

.settings-header h1 {
  font-size: 2.2rem;
  font-weight: bold;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.settings-header p {
  font-size: 1rem;
  color: var(--color-text);
  text-align: center;
  opacity: 0.8;
}

.settings-content {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.settings-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
}

.tab-item {
  padding: 1.2rem 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: var(--color-text);
  transition: all 0.2s ease;
}

.tab-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.tab-item.active {
  color: var(--color-primary);
  font-weight: 600;
  border-bottom: 3px solid var(--color-accent-orange);
  margin-bottom: -1px;
}

.tab-item i {
  margin-right: 0.8rem;
  font-size: 1.1rem;
}

.settings-forms {
  padding: 2rem;
}

.status-message {
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.status-message.success {
  background-color: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
}

.status-message.error {
  background-color: rgba(244, 67, 54, 0.1);
  color: #F44336;
}

.status-message i {
  margin-right: 0.8rem;
  font-size: 1.2rem;
}

.form-section {
  margin-bottom: 2rem;
}

.user-greeting {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: rgba(var(--color-blue-rgb), 0.05);
  border-radius: 10px;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: var(--color-accent-orange);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.8rem;
  color: white;
  margin-right: 1.5rem;
}

.greeting-text h2 {
  font-size: 1.4rem;
  color: var(--color-primary);
  text-align: left;
}

.greeting-text p {
  font-size: 1rem;
  color: var(--color-text);
  opacity: 0.8;
}

.setting-item {
  width: 100%;
  margin-bottom: 2rem;
}

.setting-info h3 {
  margin: 0;
  text-align: left;
}

.same-line {
  display: flex;
  align-items: center;
  justify-content: left;
  gap: 2rem;
}

.same-line p {
  margin: 1rem 0;
}

.form-group {
  margin: 0 0 2rem;
  width: 100%;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text);
  font-weight: 500;
  text-align: left;
}

.form-control {
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(var(--color-accent-yellow-rgb), 0.1);
}

.form-control.error {
  border-color: #F44336;
}

.form-control.narrow {
  max-width: 100px;
}

.form-control:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.error-message {
  color: #F44336;
  font-size: 0.85rem;
  margin-top: 0.4rem;
  display: block;
}

.form-actions {
  margin: 0 0 2rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-save, .btn-password, .btn-cancel {
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-save {
  background-color: var(--color-primary);
  color: white;
  border: none;
}

.btn-save:hover:not(:disabled) {
  background-color: #005a87;
}

.btn-save i {
  margin-right: 0.5rem;
}

.btn-save:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-password {
  background-color: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.btn-password:hover {
  background-color: rgba(var(--color-blue-rgb), 0.05);
}

.btn-cancel {
  background-color: #f5f5f5;
  color: var(--color-text);
  border: none;
}

.btn-cancel:hover {
  background-color: #e0e0e0;
}
</style>