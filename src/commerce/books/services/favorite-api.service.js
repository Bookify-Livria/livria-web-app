import axios from "axios";
import { FavoriteAssembler } from "./favorite.assembler.js";

export class FavoriteApiService {
    getFavorites() {
        return axios.get('https://livria-6efh.onrender.com/favorites')
            .then(response => FavoriteAssembler.toEntitiesFromResponse(response))
            .catch(error => {
                console.error('Error fetching favorite books:', error);
                throw error;
            });
    }
    addFavorite(rawResource) {
        const adapted = FavoriteAssembler.toResource(rawResource);
        return axios.post('https://livria-6efh.onrender.com/favorites', adapted)
            .catch(error => {
                console.error('Error adding favorite:', error);
                throw error;
            });
    }
    deleteFavorite(id) {
        return axios.delete(`https://livria-6efh.onrender.com/favorites/${id}`)
            .catch(error => {
                console.error('Error deleting favorite book:', error);
                throw error;
            });
    }

}