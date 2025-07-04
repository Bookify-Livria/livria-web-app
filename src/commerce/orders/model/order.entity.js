
export class Order {
    constructor(id, code, items, userId, userName, email, recipientName, phone, isDelivery, shipping = null, total, date, status) {
        this.id = id;
        this.code = code;
        this.items = items; // CartItem[]
        this.userId = userId;
        this.userName = userName;
        this.email = email;
        this.recipientName = recipientName;
        this.phone = phone;
        this.delivery = isDelivery;
        this.shipping = shipping;
        this.total = total;
        this.date = date;
        this.status = status;
    }
}