import { Favorite } from '../model/favorite.entity.js'

export class FavoriteAssembler {
    static toEntityFromResource(resource) {
        return new Favorite(
            resource.id,
            resource.userId,
            resource.userUsername,
            resource.bookId,
            resource.bookTitle
        );
    }

    static toEntitiesFromResponse(response) {
        return response.data.map(this.toEntityFromResource);
    }

    static toResource(favorite) {
        return {
            id: favorite.id,
            userId: favorite.userId,
            userUsername: favorite.userUsername,
            bookId: favorite.bookId,
            bookTitle: favorite.bookTitle
        };
    }

}