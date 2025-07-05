import { Review } from '../model/review.entity.js'

export class ReviewAssembler {
    static toEntityFromResource(resource) {

        return new Review(
            resource.id,
            resource.bookId,
            resource.userClientId,
            resource.username,
            resource.content,
            resource.stars
        );
    }

    static toEntitiesFromResponse(response) {
        return response.data.map(this.toEntityFromResource);
    }

    static toResource(review) {
        return {
            bookId: review.bookId,
            userClientId: review.userClientId,
            content: review.content,
            stars: review.stars,
        }
    }

}