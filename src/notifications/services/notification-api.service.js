import axios from 'axios';
import { NotificationAssembler } from './notification.assembler.js';
import authHeader from "../../public/shared-services/auth-header.js";
import AuthService from "../../public/shared-services/authentication.service.js";

const API_URL = 'https://app-250621192653.azurewebsites.net/api/v1/';

export class NotificationApiService {
    getNotifications(Id) {
        return axios.get(API_URL + `notifications/user/${Id}`, { headers: authHeader()})
            .then(res => NotificationAssembler.toEntitiesFromResponse(res))
            .catch(err => { throw err });
    }

    addNotification(notification) {
        return axios.post(API_URL + 'notifications', NotificationAssembler.toResource(notification), { headers: authHeader()})
            .catch(err => { throw err });
    }

    async clearList() {
        try {
            const currentUser = AuthService.getCurrentUser();
            if (!currentUser || !currentUser.userId) {
                console.error('No current user or user ID available to clear notifications.');
                throw new Error('User not authenticated or user ID missing.');
            }

            const userClientId = currentUser.userId;

            const requestBody = {
                userClientId: userClientId
            };

            const response = await axios.patch(API_URL + 'notifications/hide-all', requestBody, { headers: authHeader() });

            console.log('Notifications hidden successfully:', response.data);
            return response.data;

        } catch (error) {
            console.error('Error hiding notifications:', error);
            throw error;
        }
    }

}
