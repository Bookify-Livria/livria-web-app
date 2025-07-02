import axios from 'axios';
import { CommunityAssembler } from './community.assembler.js';

export class CommunityApiService {
    getCommunities() {
        return axios.get('https://app-250621192653.azurewebsites.net/api/v1/communities')
            .then(response => CommunityAssembler.toEntitiesFromResponse(response))
            .catch(error => {
                console.error('Error fetching communities:', error);
                throw error;
            });
    }
    createCommunity(community) {
        const adapted = CommunityAssembler.toResource(community);
        return axios.post('https://app-250621192653.azurewebsites.net/api/v1/communities', adapted)
            .catch(error => {
                console.error('Error creating community:', error);
                throw error;
            });
    }
}