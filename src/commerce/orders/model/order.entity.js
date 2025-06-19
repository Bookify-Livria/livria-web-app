
export class Order {
    constructor(id, code, items, fullName, email, phone, isDelivery, shipping = null, total, date, status) {
        this.id = id;
        this.code = code;
        this.items = items; // CartItem[]
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.delivery = isDelivery;
        this.shipping = shipping;
        this.total = total;
        this.date = date;
        this.status = status;
    }
}