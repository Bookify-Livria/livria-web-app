import axios from 'axios';
import { CommunityAssembler } from './community.assembler.js';
import authHeader from "../../public/shared-services/auth-header.js";

const API_URL = 'https://app-250621192653.azurewebsites.net/api/v1/';

export class CommunityApiService {
    getCommunities() {
        return axios.get(API_URL + 'communities',{ headers: authHeader()})
            .then(response => CommunityAssembler.toEntitiesFromResponse(response))
            .catch(error => {
                console.error('Error fetching communities:', error);
                throw error;
            });
    }
    createCommunity(community) {
        const adapted = CommunityAssembler.toResource(community);
        return axios.post(API_URL + 'communities', adapted, { headers: authHeader()})
            .catch(error => {
                console.error('Error creating community:', error);
                throw error;
            });
    }
    async joinCommunity(communityId, userClientId) {
        try {
            const requestBody = {
                userClientId: userClientId,
                communityId: communityId
            };

            const response = await axios.post(API_URL + 'communities/join', requestBody, { headers: authHeader() });

            console.log('Successfully joined community:', response.data);
            return response.data;

        } catch (error) {
            console.error('Error joining community:', error);
            throw error;
        }
    }
    async leaveCommunity(communityId, userId) {
        try {
            const response = await axios.delete(
                `${API_URL}communities/${communityId}/members/${userId}`,
                { headers: authHeader() }
            );

            console.log(`Successfully left community ${communityId} for user ${userId}:`, response.data);
            return response.data;

        } catch (error) {
            console.error('Error leaving community:', error);
            throw error;
        }
    }
}