import { Community } from '../model/community.entity.js';

export class CommunityAssembler {
    // Convert API response to entity model
    static toEntitiesFromResponse(response) {
        if (!response || !response.data) {
            return [];
        }

        return response.data.map(item => this.toEntity(item));
    }

    // Convert a single API item to entity model
    static toEntity(item) {
        if (!item) {
            return null;
        }
        return new Community(
            item.id,
            item.name,
            item.description,
            item.type,
            item.image,
            item.banner,
        );
    }

    //Convert data to API item using the entity model
    static toResource(community) {
        return {
            id: community.id,
            name: community.name,
            description: community.description,
            type: community.type,
            image: community.image,
            banner: community.banner
        }
    }

}