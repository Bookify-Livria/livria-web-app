import { Banned } from '../model/banned.entity.js'

export class BannedAssembler {
    static toEntityFromResource(resource) {
        return new Banned(
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

    static toResource(banned) {
        return {
            id: banned.id,
            userId: banned.userId,
            userUsername: banned.userUsername,
            bookId: banned.bookId,
            bookTitle: banned.bookTitle
        };
    }

}