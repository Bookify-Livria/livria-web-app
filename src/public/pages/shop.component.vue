<script>
import {defineComponent} from "vue";
import toolbarComponent from "../components/toolbar.component.vue";
import footerComponent from "../components/footer-content.component.vue";

export default defineComponent({
  name: "shop.component",
  components: {
    footerComponent,
    toolbarComponent
  }
})
</script>

<template>
  <toolbarComponent/>
  <div class="shop-container">
    <div class="shop-left">
      <h2>LIVRIA STORE</h2>
      <img src="../../assets/images/store/shopLivria.png" alt="Store_img" class="shop-photo" />
    </div>
    <div class="shop-right">
      <h4 class="h3__title">{{$t("address")}}</h4>
      <p>Av. República de Chile 661, Jesús María 15072, Peru</p>
      <iframe
          class="shop-map"
          src="https://www.google.com/maps?q==Av.+República+de+Chile+661,+Jesús+María+15072&output=embed"
          width="300"
          height="200"
          style="border:0;"
          allowfullscreen=""
          loading="lazy"
      ></iframe>
    </div>
  </div>
  <div class="footer__container-fullwidth">
    <footerComponent/>
  </div>
</template>
