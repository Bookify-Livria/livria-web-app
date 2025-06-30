<script>
import { BookApiService } from '../services/book-api.service.js'
import { CartApiService} from "../../shared-services/cart-api.service.js";
import { UserApiService } from "../../../subscription/service/user-api.service.js";
import { FavoriteApiService } from "../services/favorite-api.service.js";
import { BannedApiService } from "../services/banned-api.service.js";
import bookmarkIcon from "../../../assets/images/icons/Bookmark.svg";
import minusIcon from "../../../assets/images/icons/Minus.svg";
import starIcon from "../../../assets/images/icons/Star.svg";

export default {
  name: 'BookDetail',
  components: {
    bookmarkIcon,
    minusIcon,
    starIcon
  },
  props: {
    title: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      book: null,
      quantity: 1,
      newReview: {
        content: '',
        stars: 0
      },
      hoverRating: 0,
      isFavorited: false,
      isBanned: false,
      currentUser: null,
    }
  },
  methods: {
    async loadBook() { // Obtiene información del libro seleccionado y asigna su valor a una variable
      const service = new BookApiService();
      const userApiService = new UserApiService();

      try {
        const bookTitle = this.$route.params.title;
        const data = await service.getBooks();
        this.book = data.find(b => b.title.toString().toLowerCase() === bookTitle.toLowerCase());

        if (this.book) {
          this.$emit('book-loaded', this.book.title);
          const loggedUsers = await userApiService.getLoggedInUser();
          this.currentUser = loggedUsers.length > 0 ? loggedUsers[0] : null;
          if (this.currentUser) {
            await this.checkBookStatus();
          }
        }
      } catch (error) {
        console.error('Error loading book:', error);
      }
    },
    async checkBookStatus() {
      if (!this.currentUser || !this.book) return;

      const favoriteService = new FavoriteApiService();
      const bannedService = new BannedApiService();

      const favorites = await favoriteService.getFavorites();
      const banned = await bannedService.getBanned();

      this.isFavorited = favorites.some(fav => fav.userId === this.currentUser.id && fav.bookId === this.book.id);
      this.isBanned = banned.some(ban => ban.userId === this.currentUser.id && ban.bookId === this.book.id);
    },
    async addToCart(book, quantity) { // Agrega al carrito de compras el libro seleccionado, con una cantidad seleccionada por el usuario
      try {
        const service = new CartApiService();
        const currentCart = await service.getCart();

        const newId = String(
            currentCart.length > 0
                ? Math.max(...currentCart.map(item => parseInt(item.id))) + 1
                : 1
        );

        const cartItem = {
          id: newId,
          book,
          quantity: parseInt(quantity)
        };
        await service.addToCart(cartItem);
      } catch (error) {
        console.error("Error adding item:", error)
      }
    },
    showConfirmation() { // Muestra un mensaje flotante (Toast) que indica una inserción exitosa al carrito de compras
      try {
        this.$toast.add({
          severity: 'success',
          summary: this.$t('cart.modified'),
          detail: this.$t('cart.book-added'),
          life: 3000
        });
      } catch (error) {
        console.error("Error adding item:", error)
      }
    },
    setRating(value) {
      this.newReview.stars = value;
    },
    async makeReview() { // Permite al usuario registrar una reseña del libro en pantalla
      try {
        const service = new BookApiService();

        if (!this.newReview.content.trim()) {
          this.$toast.add({
            severity: 'warn',
            summary: this.$t('notice'),
            detail: this.$t('review-empty-content'),
            life: 3000
          });
          return;
        }

        const newId = this.book.reviews?.length
            ? String(Math.max(...this.book.reviews.map(p => parseInt(p.id))) + 1)
            : "1";

        const newPostReview = {
          id: newId,
          username: this.currentUser.username,
          content: this.newReview.content,
          stars: this.newReview.stars.toString()
        };

        const updatedReviews = {
          ...this.book,
          reviews: [...(this.book.reviews || []), newPostReview]
        };

        await service.updateBook(updatedReviews);

        this.book.reviews.push(newPostReview);
        this.newReview.content = '';
        this.newReview.stars = 0;
        this.hoverRating = 0;

      } catch (error) {
        console.error('Error posting!!!', error);
      }
    },
    async toggleFavorite() {
      if (!this.currentUser || !this.book) {
        console.log("Empty");
        return;
      }

      const favoriteService = new FavoriteApiService();
      const bannedService = new BannedApiService();

      try {
        if (this.isFavorited) {
          // Quitar si ya está como favorite
          const favorites = await favoriteService.getFavorites();
          const favItem = favorites.find(f => f.userId === this.currentUser.id && f.bookId === this.book.id);
          if (favItem) {
            await favoriteService.deleteFavorite(favItem.id);
            this.isFavorited = false;
          }
        } else {
          // Añadir como favorite viendo que no esté en banned
          if (this.isBanned) {
            const banned = await bannedService.getBanned();
            const bannedItem = banned.find(b => b.userId === this.currentUser.id && b.bookId === this.book.id);
            if (bannedItem) {
              await bannedService.deleteBanned(bannedItem.id);
              this.isBanned = false;
            }
          }
          const newFavoriteId = String(
              (await favoriteService.getFavorites()).length > 0
                  ? Math.max(...(await favoriteService.getFavorites()).map(item => parseInt(item.id))) + 1
                  : 1
          );

          const newFavorite = {
            id: newFavoriteId,
            userId: this.currentUser.id,
            userUsername: this.currentUser.username,
            bookId: this.book.id,
            bookTitle: this.book.title
          };
          await favoriteService.addFavorite(newFavorite);
          this.isFavorited = true;
          this.$toast.add({
            severity: 'secondary',
            summary: this.$t('success'),
            detail: this.$t('add-favorite'),
            life: 3000
          });
        }
      } catch (error) {
        console.error('Error toggling favorite:', error);
      }
    },
    async toggleBanned() {
      if (!this.currentUser || !this.book) {
        console.log("Empty");
        return;
      }

      const bannedService = new BannedApiService();
      const favoriteService = new FavoriteApiService();

      try {
        if (this.isBanned) {
          // Quitar de banned si ya existe
          const banned = await bannedService.getBanned();
          const bannedItem = banned.find(b => b.userId === this.currentUser.id && b.bookId === this.book.id);
          if (bannedItem) {
            await bannedService.deleteBanned(bannedItem.id);
            this.isBanned = false;
          }
        } else {
          // Añadir a banned viendo que no esté en favorite
          if (this.isFavorited) {
            const favorites = await favoriteService.getFavorites();
            const favItem = favorites.find(f => f.userId === this.currentUser.id && f.bookId === this.book.id);
            if (favItem) {
              await favoriteService.deleteFavorite(favItem.id);
              this.isFavorited = false;
            }
          }
          const newBannedId = String(
              (await bannedService.getBanned()).length > 0
                  ? Math.max(...(await bannedService.getBanned()).map(item => parseInt(item.id))) + 1
                  : 1
          );

          const newBanned = {
            id: newBannedId,
            userId: this.currentUser.id,
            userUsername: this.currentUser.username,
            bookId: this.book.id,
            bookTitle: this.book.title
          };
          await bannedService.addBanned(newBanned);
          this.isBanned = true;
          this.$toast.add({
            severity: 'secondary',
            summary: this.$t('success'),
            detail: this.$t('add-banned'),
            life: 3000
          });
        }
      } catch (error) {
        console.error('Error toggling banned:', error);
      }
    }
  },
  mounted() {
    this.loadBook() // Carga la información del libro al iniciar el componente
  }
}
</script>

<template>

  <div class="book-detail__container" v-if="book" aria-label="Book detail section">
    <div class="book-detail__left-section">
      <div class="book-detail__image-container">
        <img :src="book.cover" :alt="book.title" class="book-detail__image-cover" />
      </div>
      <div class="book-detail__description-container">
        <h3 class="h3__title">{{ $t('synopsis')}}</h3>
        <p class="book-detail__description-text">{{ book.description }}</p>
      </div>
    </div>

    <div class="book-detail__right-section">
      <div class="book-detail__details-container">
        <h3 class="h2__title">{{ book.author }}</h3>
        <p class="language">{{ $t('languages.' + book.language) }}</p>
        <p class="price">S/ {{ book.salePrice.toFixed(2) }}</p>
      </div>

      <div class="book-detail__actions">
        <select v-model="quantity" class="quantity" aria-label="Select quantity">
          <option>1</option>
          <option>2</option>
          <option>3</option>
        </select>
        <div class="book-detail__add-cart">
          <pv-toast position="top-right" style="margin-top: 10rem" />
          <button @click="addToCart(book, quantity); showConfirmation()" aria-label="Add to cart">{{ $t('add-to-cart') }}</button>
        </div>
        <span
            aria-label="Mark as 'favorite'"
            :class="[
                 'book-detail__markings',
                 { filled: isFavorited }
            ]"
            @click="toggleFavorite"
        >
          <bookmarkIcon />
        </span>
        <span
            aria-label="Mark as 'banned'"
            :class="[
                 'book-detail__markings',
                 { filled: isBanned }
            ]"
            @click="toggleBanned"
        >
          <minusIcon />
        </span>
      </div>

      <div class="book-detail__opinion">
        <div class="book-detail__opinion-titles">
          <h2 class="h2__title go--orange">{{$t('reviews')}}</h2>
          <h3 class="h3__title">{{ $t('make-review') }}</h3>
        </div>
        <div class="book-detail__opinion-post">
          <span class="rating-stars">
            <starIcon
                v-for="(star, index) in 5"
                :key="index"
                :class="[
                 'star',
                 { filled: index < newReview.stars },
                 { hovered: index < hoverRating }
               ]"
                @mouseover="hoverRating = index + 1"
                @mouseleave="hoverRating = 0"
                @click="setRating(index + 1)" />
          </span>
          <form @submit.prevent="makeReview">
            <textarea v-model="newReview.content" :placeholder="$t('comm.thoughts')" aria-label="Add comment section"></textarea>
            <button type="submit" class="" aria-label="Publish comment">{{ $t("comm.post")}}</button>
          </form>
        </div>
        <h3 class="h3__title">{{ $t('previous-reviews') }}</h3>
        <div
            v-for="review in book.reviews.slice().reverse()"
            :key="review.id"
            class="comments"
        >
          <div class="comment">
            <div class="comment__user">
              <strong>@{{ review.username }}</strong>
            </div>
            <div class="comment__review">
              {{ review.stars }} <starIcon class="comment__review-star"/> {{ review.content }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="loading">
    <p>{{ $t('loading-book') }}</p>
  </div>
</template>

<style scoped>
.book-detail__container {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  padding: 0 2rem;
  margin: 0 2rem;
  position: relative;
  height: auto;
}

.book-detail__left-section {
  flex: 0 0 30%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  background-color: var(--color-light);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
  padding: 2rem;
  height: 70vh;
}

.book-detail__image-container {
  width: 300px;
  height: 450px;
}

.book-detail__image-cover {
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.book-detail__description-container {
  text-align: left;
  width: 100%;
  padding: 0 2rem;
}

.book-detail__description-text {
  color: #333;
  font-size: 1rem;
  line-height: 1.5;
}

.book-detail__right-section {
  flex: 0 0 65%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: left;
  padding: 0 2rem;
}

.book-detail__details-container {
  margin-bottom: 1rem;
}

.language {
  font-size: 1rem;
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.price {
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-accent-orange);
  margin-bottom: 1rem;
}

.book-detail__actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
}

.quantity {
  padding: 0.5rem;
  border-radius: 6px;
}

.book-detail__markings {
  width: 24px;
  height: 24px;
  stroke: currentColor;
  fill: none;
  transition: transform 0.2s ease, fill 0.2s ease;
  cursor: pointer;
}

.book-detail__markings:hover {
  transform: scale(1.1);
  color: var(--color-accent-orange);
}

.book-detail__markings.filled {
  color: var(--color-accent-orange);
}

.book-detail__opinion {
  margin-top: 17rem;
  border-top: 1px solid #ccc;
  padding-top: 1rem;
}

.book-detail__opinion-titles {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1rem 0;
}

.book-detail__opinion-post {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 2rem;
}

.book-detail__opinion-post form {
  display: flex;
  width: 100%;
  gap: 0.5rem;
}

.book-detail__opinion-post textarea {
  flex: 1;
  resize: none;
  padding: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 10px;
  background-color: rgba(var(--color-blue-rgb), 0.15);
  font-family: var(--font-primary);
  font-size: 1rem;
  color: var(--color-text);
}

.book-detail__opinion-post textarea:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-secondary);
}

.book-detail__opinion-post button {
  padding: 0.5rem 1rem;
  white-space: nowrap;
  height: auto;
}

.comments {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 8px;
}

.comment {
  font-size: 1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.comment__user {
  font-weight: bold;
  color: var(--color-primary);
}

.comment__review {
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 2rem;
  padding: 0.25rem;
}

.comment__review-star {
  transform: scale(0.65);
  vertical-align: middle;
  margin-left: -0.5rem;
  margin-top: -0.1rem;
}

.rating-stars {
  display: flex;
  gap: 0.5rem;
  cursor: pointer;
}

.star {
  width: 24px;
  height: 24px;
  color: var(--color-accent-yellow);
  stroke: currentColor;
  fill: none;
  transition: transform 0.2s ease, fill 0.2s ease;
}

.star:hover {
  transform: scale(1.1);
}

.star.filled {
  fill: var(--color-accent-yellow);
}

</style>
