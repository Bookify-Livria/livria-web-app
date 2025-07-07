
export class Order {
    constructor(id, code, userClientId, userEmail, userPhone, userFullName, recipientName, status, isDelivery, shipping = null, total, date, items) {
        this.id = id;
        this.code = code;
        this.userClientId = userClientId;
        this.userEmail = userEmail;
        this.userPhone = userPhone;
        this.userFullName = userFullName;
        this.recipientName = recipientName;
        this.status = status;
        this.isDelivery = isDelivery;
        this.shipping = shipping;
        this.total = total;
        this.date = date;
        this.items = items; // CartItem[]
    }
}