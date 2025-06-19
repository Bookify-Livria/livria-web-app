import { Order } from '../model/order.entity.js';
import { CartAssembler } from '../../cart/services/cart.assembler.js';
import { Shipping } from '../model/shipping.entity.js';

export class OrderAssembler {
    static toEntityFromResource(resource) {
        const items = resource.items.map(CartAssembler.toEntityFromResource);
        const shipping = resource.shipping
            ? new Shipping(
                resource.shipping.address,
                resource.shipping.district,
                resource.shipping.reference
            )
            : null;

        return new Order(
            resource.id,
            resource.code,
            items,
            resource.fullName,
            resource.email,
            resource.phone,
            resource.delivery,
            shipping,
            resource.total,
            resource.date,
            resource.status,
        );
    }

    static toEntitiesFromResponse(response) {
        return response.data.map(this.toEntityFromResource);
    }

    static toResource(order) {
        return {
            id: order.id,
            code: order.code,
            items: order.items.map(CartAssembler.toResource),
            fullName: order.fullName,
            email: order.email,
            phone: order.phone,
            delivery: order.delivery,
            shipping: order.delivery
                ? {
                    address: order.shipping.address,
                    district: order.shipping.district,
                    reference: order.shipping.reference
                }
                : null,
            total: order.total,
            date: order.date,
            status: order.status,
        };
    }


}
