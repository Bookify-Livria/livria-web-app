import { Order } from '../model/order.entity.js';
import { CartAssembler } from '../../cart/services/cart.assembler.js';
import { Shipping } from '../model/shipping.entity.js';

export class OrderAssembler {
    static toEntityFromResource(resource) {
        //const items = resource.items.map(CartAssembler.toEntityFromResource);
        const items = resource.items ? resource.items.map(itemResource => {
            const simulatedBookResource = {
                id: itemResource.bookId,
                title: itemResource.bookTitle,
                description: "",
                author: itemResource.bookAuthor,
                salePrice: itemResource.bookPrice,
                purchasePrice: 0,
                stock: 0,
                cover: itemResource.bookCover,
                genre: "",
                language: ""
            };
            const simulatedCartItemResource = {
                id: itemResource.id, // The item ID from the order response
                book: simulatedBookResource, // The newly created nested book object
                quantity: itemResource.quantity,
                userClientId: resource.userClientId // User ID from the main order resource
            };
            return CartAssembler.toEntityFromResource(simulatedCartItemResource);
        }) : [];

        const shipping = resource.shipping
            ? new Shipping(
                resource.shipping.address,
                resource.shipping.city,
                resource.shipping.district,
                resource.shipping.reference
            )
            : null;

        return new Order(
            resource.id,
            resource.code,
            resource.userClientId,
            resource.userEmail,
            resource.userPhone,
            resource.userFullName,
            resource.recipientName,
            resource.status,
            resource.isDelivery,
            shipping,
            resource.total,
            resource.date,
            items,
        );
    }

    static toEntitiesFromResponse(response) {
        return response.data.map(this.toEntityFromResource);
    }

    static toResource(order) {
        let shippingDetailsPayload = null;
        if (order.isDelivery && order.shipping) {
            shippingDetailsPayload = {
                address: order.shipping.address,
                city: order.shipping.city,
                district: order.shipping.district,
                reference: order.shipping.reference
            };
        }

        return {
            userClientId: order.userClientId,
            userEmail: order.userEmail,
            userPhone: order.userPhone,
            userFullName: order.userFullName,
            recipientName: order.recipientName,
            status: order.status,
            isDelivery: order.isDelivery,
            shippingDetails: shippingDetailsPayload,
        };
    }


}
