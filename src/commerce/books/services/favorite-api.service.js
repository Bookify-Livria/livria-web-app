import axios from 'axios';
import authHeader from "../../../public/shared-services/auth-header.js";

const API_URL = 'https://app-250621192653.azurewebsites.net/api/v1/';

export class FavoriteApiService {
    async addBookToFavorites(userClientId, bookId) {
        try {
            const response = await axios.post(
                `${API_URL}userclients/${userClientId}/favorites/${bookId}`,
                {},
                { headers: authHeader() }
            );
            console.log(`Book ${bookId} added to favorites for user ${userClientId}:`, response.data);
            return response.data;
        } catch (error) {
            console.error(`Error adding book ${bookId} to favorites for user ${userClientId}:`, error);
            throw error;
        }
    }

    async getFavoriteBooks(userClientId) {
        try {
            const response = await axios.get(
                `${API_URL}userclients/${userClientId}/favorites`,
                { headers: authHeader() }
            );
            console.log(`Favorite books for user ${userClientId}:`, response.data);
            return response.data;
        } catch (error) {
            console.error(`Error fetching favorite books for user ${userClientId}:`, error);
            throw error;
        }
    }

    async deleteFavoriteBook(userClientId, bookId) {
        try {
            const response = await axios.delete(
                `${API_URL}userclients/${userClientId}/favorites/${bookId}`,
                { headers: authHeader() }
            );
            console.log(`Book ${bookId} deleted from favorites for user ${userClientId}:`, response.data);
            return response.data;
        } catch (error) {
            console.error(`Error deleting favorite book ${bookId}:`, error);
        }
    }
}
