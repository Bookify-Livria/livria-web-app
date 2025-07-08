
export class CartItem {
    constructor(id, book, quantity = 1, userClientId) {
        this.id = id;
        this.book = book;
        this.quantity = quantity;
        this.userClientId = userClientId;
    }
}

