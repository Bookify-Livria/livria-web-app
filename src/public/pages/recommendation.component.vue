<script>
import toolbarComponent from "../components/toolbar.component.vue";
import footerComponent from "../components/footer-content.component.vue";
import recommendedBooks from "../../commerce/books/components/recommended-books.component.vue";

export default {
  name: "recomendation.component",
  components: {
    toolbarComponent,
    footerComponent,
    recommendedBooks
  }
};
</script>

<template>
  <!-- Header -->
  <toolbarComponent />

  <div class="book-container">
    <div class="book__fullwidth">
      <div class="title__container">
        <h2 class="h1__title">{{ $t("recommended.title") }}</h2>
        <p class="h3__title">{{ $t("recommended.subtitle") }}</p>
        <p class="h3__title">{{ $t("recommended.reminder") }}</p>
      </div>

      <div class="cards__container">
        <recommendedBooks />
      </div>

    </div>

    <div class="footer__container-fullwidth">
      <footerComponent />
    </div>
  </div>

</template>

<style scoped>
.footer__container-fullwidth {
  margin-top: 2rem;
}

.book-container {
  margin: 10rem calc(-1 * ((100vw - 100%) / 2)) 0;
}

.book__fullwidth {
  padding: 0 2rem;
  margin-bottom: 3rem;
}

.cards__container {
  margin: 0 0 3rem;
  padding: 0 2rem;
}

</style>
