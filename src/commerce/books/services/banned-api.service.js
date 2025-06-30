import axios from "axios";
import { BannedAssembler } from "./banned.assembler.js";

export class BannedApiService {
    getBanned() {
        return axios.get('https://livria-6efh.onrender.com/banned')
            .then(response => BannedAssembler.toEntitiesFromResponse(response))
            .catch(error => {
                console.error('Error fetching banned books:', error);
                throw error;
            });
    }
    addBanned(rawResource) {
        const adapted = BannedAssembler.toResource(rawResource);
        return axios.post('https://livria-6efh.onrender.com/banned', adapted)
            .catch(error => {
                console.error('Error adding banned:', error);
                throw error;
            });
    }
    deleteBanned(id) {
        return axios.delete(`https://livria-6efh.onrender.com/banned/${id}`)
            .catch(error => {
                console.error('Error deleting banned book:', error);
                throw error;
            });
    }

}