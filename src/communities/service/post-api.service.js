import axios from 'axios';
import{ PostAssembler } from "./post.assembler.js";
import authHeader from "../../public/shared-services/auth-header.js";

const API_URL = 'https://app-250621192653.azurewebsites.net/api/v1/';

export class PostApiService {
    getPosts() {
        return axios.get(API_URL + 'posts',{ headers: authHeader()})
            .then(response => PostAssembler.toEntitiesFromResponse(response))
            .catch(error => {
                console.error('Error fetching posts:', error);
                throw error;
            });
    }

    createPost(post, communityId) {
        const adapted = PostAssembler.toResource(post);
        return axios.post(API_URL + `posts/communities/${communityId}`, adapted,{ headers: authHeader()})
            .then(response => PostAssembler.toEntity(response.data))
            .catch(error => {
                console.error('Error creating post:', error);
                throw error;
            });
    }
}