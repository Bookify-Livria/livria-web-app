import { Review } from '../model/review.entity.js'

export class ReviewAssembler {
    static toEntityFromResource(resource) {

        return new Review(
            resource.id,
            resource.bookId,
            resource.userId,
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
            id: review.id,
            bookId: review.bookId,
            userId: review.userId,
            username: review.username,
            content: review.content,
            stars: review.stars,
        }
    }

}