import axios from "axios";
import { ReviewAssembler } from "@/commerce/books/services/review.assembler.js";

export class ReviewApiService {
    getReviews() {
        return axios.get('https://app-250621192653.azurewebsites.net/api/v1/reviews')
            .then(response => ReviewAssembler.toEntitiesFromResponse(response))
            .catch(error => {
                console.error('Error fetching reviews:', error);
                throw error;
            });
    }

    createReview(review) {
        const adapted = ReviewAssembler.toResource(review);
        return axios.post('https://app-250621192653.azurewebsites.net/api/v1/reviews', adapted)
            .catch(error => {
                console.error('Error creating review:', error);
                throw error;
            });
    }
}