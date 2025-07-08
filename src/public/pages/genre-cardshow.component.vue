<script>
import toolbarComponent from "../components/toolbar.component.vue";
import footerComponent from "../components/footer-content.component.vue";
import genreBooks from "../../commerce/books/components/genre-books.component.vue";

export default {
  name: "genre-cardshow.component",
  components: {
    toolbarComponent,
    footerComponent,
    genreBooks,
  },
  props: {
    genre: {
      type: String,
      required: true
    }
  },
  computed: {
    genreTitle() {
      const genreKeys = [
        "literature",
        "fiction",
        "non_fiction",
        "mangas_comics",
        "juvenile",
        "children",
        "ebooks_audiobooks"
      ]
      return genreKeys.includes(this.genre)
          ? this.$t(`genres.${this.genre}`)
          : this.$t("genres.default")
    }
  }
}
</script>

<template>
  <!-- Header -->
  <toolbarComponent />

  <div class="literature-container">
    <div class="literature__fullwidth">
      <div class="title__container">
        <h1 class="h1__title">{{ genreTitle }}</h1>
      </div>

      <div class="cards__container">
        <genreBooks :genre="genre" />
      </div>

    </div>
    <!-- Footer -->
    <div class="footer__container-fullwidth">
      <footerComponent />
    </div>
  </div>
</template>

<style scoped>
.literature-container {
  margin: 10rem calc(-1 * ((100vw - 100%) / 2)) 0;
}

.literature__fullwidth {
  padding: 0 2rem;
  margin-bottom: 4rem;
}

</style>