import axios from 'axios';
import { OrderAssembler } from './order.assembler.js';
import authHeader from "../../../public/shared-services/auth-header.js";

const API_URL = 'https://app-250621192653.azurewebsites.net/api/v1/';

export class OrderApiService {
    getOrders() {
        return axios.get(API_URL + 'orders', { headers: authHeader()})
            .then(response => OrderAssembler.toEntitiesFromResponse(response))
            .catch(error => {
                console.error('Error fetching orders:', error);
                throw error;
            });
    }

    getUserOrders(Id) {
        return axios.get(API_URL + `orders/users/${Id}`, { headers: authHeader()})
            .then(response => OrderAssembler.toEntitiesFromResponse(response))
            .catch(error => {
                console.error('Error fetching orders:', error);
                throw error;
            });
    }

    createOrder(rawResource) {
        const adapted = OrderAssembler.toResource(rawResource);
        return axios.post(API_URL + 'orders', adapted,{ headers: authHeader()})
            .then(response => OrderAssembler.toEntityFromResource(response.data))
            .catch(error => {
                console.error('Error creating order:', error);
                throw error;
            });
    }

    updateOrderStatus(orderId, newStatus) {
        return axios.put(API_URL + `orders/${orderId}/status`,{
            status: newStatus
        }, { headers: authHeader()})
            .then(response => response.data)
            .catch(error => {
                console.error(`Error updating status of order ${orderId}:`, error);
                throw error;
            });
    }
}
