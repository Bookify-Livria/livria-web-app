import axios from 'axios';
import { UserAdminAssembler } from "./user-admin.assembler.js";
import { UserClientAssembler } from "./user-client.assembler.js";

export class UserApiService {
    //for UserClient
    getUsers() {
<<<<<<< Updated upstream
        return axios.get('http://localhost:3000/users')
            .then(response => UserAssembler.toEntitiesFromResponse(response))
=======
        return axios.get('https://livria-6efh.onrender.com/clientUsers')
            .then(response => UserClientAssembler.toEntitiesFromResponse(response))
>>>>>>> Stashed changes
            .catch(error => {
                console.error('Error fetching users:', error);
                throw error;
            });
    }
<<<<<<< Updated upstream
    createUser(rawResource) {
        const adapted = UserAssembler.toResource(rawResource);
        return axios.post('http://localhost:3000/users', adapted)
            .catch(error => {
                console.error('Error creating order:', error);
                throw error;
            });
    }


    updateUser(user) {
        return axios.put(`http://localhost:3000/users/${user.id}`, user)
            .catch(error => {
                console.error('Error updating users:', error);
                throw error;
            });
    }


    getUserById(id) {
        return axios.get(`http://localhost:3000/users/${id}`)
=======
    getUserById(id) {
        return axios.get(`https://livria-6efh.onrender.com/clientUsers/${id}`)
>>>>>>> Stashed changes
            .then(response => response.data)
            .catch(error => {
                console.error('Error getting user:', error);
                throw error;
            });
    }
    createUser(rawResource) {
        const adapted = UserClientAssembler.toResource(rawResource);
        return axios.post('https://livria-6efh.onrender.com/clientUsers', adapted)
            .catch(error => {
                console.error('Error creating order:', error);
                throw error;
            });
    }
    updateUser(user) {
        return axios.put(`https://livria-6efh.onrender.com/clientUsers/${user.id}`, user)
            .catch(error => {
                console.error('Error updating users:', error);
                throw error;
            });
    }
    deleteUser(id) {
<<<<<<< Updated upstream
        return axios.delete(`http://localhost:3000/users/${id}`)
=======
        return axios.delete(`https://livria-6efh.onrender.com/clientUsers/${id}`)
>>>>>>> Stashed changes
            .catch(error => {
                console.error('Error deleting user:', error);
                throw error;
            });
    }


    //for UserAdmin
    getAdminUser() {
        return axios.get('https://livria-6efh.onrender.com/adminUser')
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
        return axios.put(`https://livria-6efh.onrender.com/adminUser/${user.id}`, user)
            .catch(error => {
                console.error('Error updating users:', error);
                throw error;
            });
    }

}
