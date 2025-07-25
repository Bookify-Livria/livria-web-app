<script>
import {CartApiService} from "../../shared-services/cart-api.service.js";
import trashIcon from "../../../assets/images/icons/Trash.svg";
import {UserApiService} from "../../../subscription/service/user-api.service.js";
import AuthService from "../../../public/shared-services/authentication.service.js";

export default {
  name: "cartDrawer",
  components: {
    trashIcon,
  },
  data() {
    return {
      visibleRight: false,
      cartItems: [],
      currentUser: null
    }
  },
  methods: {
    toggleDrawer() { // Alterna la visibilidad del Drawer de carrito de compras
      this.visibleRight = !this.visibleRight
      if (this.visibleRight) this.loadCart()
    },
    closeDrawer() {
      this.visibleRight = false
    },
    async loadCart() { // Carga la información almacenada dentro del carrito de compras (lista de compras)
      try {
        const service = new CartApiService()
        const userService = new UserApiService();
        const user = AuthService.getCurrentUser();
        const authUser = await userService.getUserById(user.userId);

        this.currentUser = authUser;

        this.cartItems = await service.getCart(this.currentUser.id);
      } catch (error) {
        console.error("Error fetching cart:", error)
      }
    },
    getSubtotal() { // Calcula el sub total de los productos almacenados dentro del carrito de compras
      return this.cartItems.reduce((total, item) => total + item.book.salePrice * item.quantity, 0)
    },
    async updateBookQuantity(cartId, quantity) { //Actualiza la cantidad de un libro en el carrito
      try {
        const service = new CartApiService();
        await service.updateQuantity(cartId, this.currentUser.id, quantity);
      } catch (error) {
        console.error("Error updating quantity of cart item:", error)
      }
    },
    async removeItem(Id) { // Elimina un único elemento de la lista de compras en base a su id
      try {
        const service = new CartApiService()
        await service.removeFromCart(Id, this.currentUser.id)
        this.cartItems = await service.getCart(this.currentUser.id);
      } catch (error) {
        console.error("Error deleting item:", error)
      }
    },
    async emptyCart(){ // Elimina todos los elementos almacenados dentro del carrito de compras
      try {
        const service = new CartApiService();
        await service.clearCart(this.currentUser.id);
        this.cartItems = [];
      } catch (error) {
        console.error("Error clearing shopping cart:", error);
      }
    }
  },
  watch: { // Detecta cambios en la variable "visibleRight" para alternar la visualización del carrito de compras
    visibleRight(val) {
      this.$emit('visibility-change', val)
    }
  },
  mounted() {
    this.loadCart() // Al iniciar el componente, se carga la información almacenada en la lista de compras
  }
}
</script>

<template>

  <div class="shopping-cart__container">
    <!-- Overlay  -->
    <div
        v-if="visibleRight"
        class="custom-overlay"
        @click="closeDrawer"
    ></div>
    <!-- Drawer -->
    <pv-drawer v-model:visible="visibleRight" position="right" style="width: 600px" aria-labelledby="cart-title">
      <template #header>
        <div class="title__container">
          <h1 id="cart-title" class="h1__title go--yellow">{{$t('cart-toolbar')}}</h1>
        </div>
      </template>

      <button @click="emptyCart" aria-label="Empty cart">{{$t('empty-cart')}}</button>
      <div v-for="item in cartItems" :key="item.book.id" class="shopping-cart__cart-item">
        <img :src="item.book.cover" alt="Book cover" width="60" />
        <div class="shopping-cart__item-info">
          <strong>{{ item.book.title }}</strong><br />
          <span>{{ item.book.author }}</span><br />
          <span>S/ {{ item.book.salePrice.toFixed(2) }}</span>
        </div>
        <div class="shopping-cart__actions">
          <select v-model="item.quantity" @change="updateBookQuantity(item.id, item.quantity)" aria-label="Item quantity for book">
            <option v-for="n in 3" :key="n" :value="n">{{ n }}</option>
          </select>
          <button @click="removeItem(item.id)" aria-label="Remove item from cart"><trashIcon /></button>
        </div>
      </div>

      <template #footer>
        <div class="shopping-cart__footer">
          <p>Subtotal: <strong>S/ {{ getSubtotal().toFixed(2) }}</strong></p>
          <router-link to="/purchase" class="shopping-cart__purchase" aria-label="Proceed to purchase"><button>{{$t('buy-cart')}}</button></router-link>
        </div>
      </template>
    </pv-drawer>
  </div>

</template>

<style scoped>

:deep(.custom-overlay) {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  transition: background 0.3s ease;
  z-index: 999;
}

.shopping-cart__cart-item {
  display: flex;
  align-items: center;
  background-color: var(--color-light);
  color: var(--color-text);
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  margin: 1rem 0;
  gap: 1rem;
}

.shopping-cart__cart-item img {
  border-radius: 5px;
}

.shopping-cart__item-info {
  flex: 1;
  font-size: 0.9rem;
}

.shopping-cart__actions {
  display: flex;
  align-items: center;
}

.shopping-cart__actions select {
  padding: 0.3rem;
  border-radius: 5px;
  margin-right: 0.5rem;
}

.shopping-cart__actions button {
  background: none;
  border: none;
  cursor: pointer;
  stroke: currentColor;
  fill: none;
  overflow: visible;
  transition: fill 0.3s;
}

.shopping-cart__actions button:hover {
  color: var(--color-accent-orange);
}

.shopping-cart__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--color-light);
  padding-top: 1rem;
  margin-top: 2rem;
}

.shopping-cart__footer p {
  margin: 0;
  color: var(--color-accent-light-yellow);
  font-weight: 400;
}

.shopping-cart__purchase {
  color: var(--color-blue);
  text-decoration: none;
  cursor: pointer;
}

.shopping-cart__purchase:hover {
  color: var(--color-background);
}

</style>