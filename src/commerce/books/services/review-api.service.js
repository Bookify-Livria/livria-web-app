import axios from "axios";
import { ReviewAssembler } from "./review.assembler.js";
import authHeader from "../../../public/shared-services/auth-header.js";

const API_URL = 'https://app-250621192653.azurewebsites.net/api/v1/';

export class ReviewApiService {
    getReviews() {
        return axios.get(API_URL + 'reviews', { headers: authHeader()})
            .then(response => ReviewAssembler.toEntitiesFromResponse(response))
            .catch(error => {
                console.error('Error fetching reviews:', error);
                throw error;
            });
    }

    createReview(review) {
        const adapted = ReviewAssembler.toResource(review);

        return axios.post(API_URL + 'reviews', adapted, { headers: authHeader()})
            .then(response => ReviewAssembler.toEntityFromResource(response.data))
            .catch(error => {
                console.error('Error creating review:', error);
                throw error;
            });
    }
}