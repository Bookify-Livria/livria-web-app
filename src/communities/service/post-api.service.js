import axios from 'axios';
import{ PostAssembler } from "@/communities/service/post.assembler.js";

export class PostApiService {
    getPosts() {
        return axios.get('https://app-250621192653.azurewebsites.net/api/v1/posts')
            .then(response => PostAssembler.toEntitiesFromResponse(response))
            .catch(error => {
                console.error('Error fetching posts:', error);
                throw error;
            });
    }

    createPost(post) {
        const adapted = PostAssembler.toResource(post);
        return axios.post('https://app-250621192653.azurewebsites.net/api/v1/posts', adapted)
            .catch(error => {
                console.error('Error creating post:', error);
                throw error;
            });
    }
}