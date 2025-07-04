import axios from 'axios';
import { UserAdminAssembler } from "./user-admin.assembler.js";
import { UserClientAssembler } from "./user-client.assembler.js";
import  authHeader from "../../public/shared-services/auth-header.js";

const API_URL = 'https://app-250621192653.azurewebsites.net/api/v1/';

export class UserApiService {
    //for UserClient
    getUsers() {
        return axios.get(API_URL +'userclients', { headers: authHeader()})
            .then(response => UserClientAssembler.toEntitiesFromResponse(response))
            .catch(error => {
                console.error('Error fetching users:', error);
                throw error;
            });
    }
    getUserById(id) {
        return axios.get(API_URL + `userclients/${id}`, { headers: authHeader()})
            .then(response => response.data)
            .catch(error => {
                console.error('Error getting user:', error);
                throw error;
            });
    }
    createUser(rawResource) {
        const adapted = UserClientAssembler.toResource(rawResource);
        return axios.post(API_URL +'userclients', adapted, { headers: authHeader()})
            .catch(error => {
                console.error('Error creating user:', error);
                throw error;
            });
    }
    updateUser(user) {
        return axios.put(API_URL + `userclients/${user.id}`, user, { headers: authHeader()})
            .catch(error => {
                console.error('Error updating users:', error);
                throw error;
            });
    }
    deleteUser(id) {
        return axios.delete(API_URL + `userclients/${id}`, { headers: authHeader()})
            .catch(error => {
                console.error('Error deleting user:', error);
                throw error;
            });
    }


    //for UserAdmin
    getAdminUser() {
        return axios.get(API_URL + 'useradmins', { headers: authHeader()})
            .then(response => {
                const adminData = response.data[0]; // toma el primer (y único) admin
                return UserAdminAssembler.toEntityFromResource(adminData);
            })
            .catch(error => {
                console.error('Error fetching admin user:', error);
                throw error;
            });
    }
    updateAdminUser(user) {
        return axios.put(API_URL + `/useradmins/${user.id}`, user, { headers: authHeader()} )
            .then(response => response.data)
            .catch(error => {
                console.error('Error updating users:', error);
                throw error;
            });
    }

    //logged-in user
    getLoggedInUser() {
        return axios.get('https://livria-6efh.onrender.com/userLogin')
            .then(response => response.data)
            .catch(error => {
                console.error('Error fetching logged-in users:', error);
                throw error;
            });
    }
    createLoggedInUser(userData) {
        return axios.post('https://livria-6efh.onrender.com/userLogin', userData)
            .then(response => response.data)
            .catch(error => {
                console.error('Error creating logged-in user:', error);
                throw error;
            });
    }
    deleteLoggedInUser(id) {
        return axios.delete(`https://livria-6efh.onrender.com/userLogin/${id}`)
            .catch(error => {
                console.error('Error deleting logged-in user:', error);
                throw error;
            });
    }

}
