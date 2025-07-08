import axios from 'axios';
import { CartAssembler} from "../cart/services/cart.assembler.js";
import authHeader from "../../public/shared-services/auth-header.js";

const API_URL = 'https://app-250621192653.azurewebsites.net/api/v1/';

export class CartApiService {
    getCart(Id) {
        return axios.get(API_URL + `cart-items/users/${Id}`, { headers: authHeader()})
            .then(response => CartAssembler.toEntitiesFromResponse(response))
            .catch(error => {
                console.error('Error fetching cart:', error);
                throw error;
            });
    }

    addToCart(cartItem) {
        const adapted = CartAssembler.toResource(cartItem);
        return axios.post(API_URL + 'cart-items', adapted,{ headers: authHeader()})
            .then(response => CartAssembler.toEntityFromResource(response.data))
            .catch(error => {
                console.error('Error adding to cart:', error);
                throw error;
            });
    }

    updateQuantity(cartId, userId, quantityToAddValue) {
        const requestBody = {
            newQuantity: quantityToAddValue
        };
        return axios.put(API_URL + `cart-items/${cartId}/users/${userId}`, requestBody, { headers: authHeader()})
            .then(response => response.data)
            .catch(error => {
                console.error(`Error updating quantity of book in cart ${cartId}:`, error);
                throw error;
            });
    }

    removeFromCart(Id, userId) {
        return axios.delete(API_URL + `cart-items/${Id}/users/${userId}`, { headers: authHeader()})
            .then(response => {
                console.log('Cart Item deleted successfully:', response.data);
            })
            .catch(error => {
                console.error('Error deleting cart item:', error);
                throw error;
            });
    }

    clearCart(userId) {
        return axios.get(API_URL + `cart-items/users/${userId}`, { headers: authHeader()})
            .then(response => {
                const items = response.data;
                return Promise.all(items.map(item =>
                    axios.delete(API_URL + `cart-items/${item.id}/users/${userId}`, { headers: authHeader()})
                ));
            })
            .catch(error => {
                console.error('Error clearing cart:', error);
                throw error;
            });
    }
}