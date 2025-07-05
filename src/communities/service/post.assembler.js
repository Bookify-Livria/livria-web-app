import { Post } from '../model/post.entity.js';

export class PostAssembler {
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
        return new Post(
            item.id,
            item.communityId,
            item.userId,
            item.username,
            item.content,
            item.img,
        );
    }

    //Convert data to API item using the entity model
    static toResource(post) {
        return {
            username: post.username,
            content: post.content,
            img: post.img
        }
    }
    
    
}