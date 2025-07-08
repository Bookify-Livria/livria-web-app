import axios from 'axios';
import authHeader from "../../../public/shared-services/auth-header.js";

const API_URL = 'https://app-250621192653.azurewebsites.net/api/v1/';

export class RecommendationsApiService {
    async getRecommendations(userClientId) {
        try {
            const response = await axios.get(
                `${API_URL}recommendations/users/${userClientId}`,
                {headers: authHeader()}
            );
            console.log(`Recommended books for user ${userClientId}:`, response.data);
            return response.data;
        } catch (error) {
            console.error(`Error fetching recommended books for user ${userClientId}:`, error);
            throw error;
        }
    }
}