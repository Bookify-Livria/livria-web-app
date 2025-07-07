import { CartItem } from '../model/cart-item.entity.js';
import { BookAssembler } from '../../books/services/book.assembler.js';

export class CartAssembler {
    static toEntityFromResource(resource) {
        const book = BookAssembler.toEntityFromResource(resource.book);
        return new CartItem(resource.id, book, resource.quantity, resource.userClientId);
    }

    static toEntitiesFromResponse(response) {
        return response.data.map(this.toEntityFromResource);
    }

    static toResource(cartItem) {
        return {
            bookId: cartItem.bookId,
            quantity: cartItem.quantity,
            userClientId: cartItem.userClientId,
        };
    }
}
