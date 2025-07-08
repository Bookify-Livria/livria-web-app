import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'https://app-250621192653.azurewebsites.net/api/v1/authentication/';

class AuthService {
    async loginAsClient(credentials) {
        try {
            const response = await axios.post(API_URL + 'sign-in/client', {
                username: credentials.username,
                password: credentials.password
            });

            if (response.data.token) {
                const decodedToken = jwtDecode(response.data.token);
                const userRole = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

                const userDataToStore = {
                    ...response.data,
                    role: userRole
                };
                localStorage.setItem('user', JSON.stringify(userDataToStore));
                console.log("Client login successful, role:", userRole);
            }
            return response.data;
        } catch (error) {
            console.error("Error during client login:", error);
            throw error;
        }
    }
    async loginAsAdmin(credentials) {
        try {
            const response = await axios.post(API_URL + 'sign-in/admin', {
                username: credentials.username,
                password: credentials.password,
                securityPin: credentials.securityPin
            });

            if (response.data.token) {
                const decodedToken = jwtDecode(response.data.token);
                const userRole = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

                const userDataToStore = {
                    ...response.data,
                    role: userRole
                };
                localStorage.setItem('user', JSON.stringify(userDataToStore));
                console.log("Admin login successful, role:", userRole);
            }
            return response.data;
        } catch (error) {
            console.error("Error during admin login:", error);
            throw error;
        }
    }
    logOut() {
        localStorage.removeItem('user');
        console.log("User logged out, token removed from localStorage.");
    }
    register(user) {
        return axios.post(API_URL + 'register', {
            username: user.username,
            password: user.password,
            confirmPassword: user.confirmPassword,
            display: user.display,
            email: user.email,
            icon: user.icon,
            phrase: user.phrase
        });
    }
    getCurrentUser() {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user && user.token) {
                if (!user.role) {
                    const decodedToken = jwtDecode(user.token);
                    user.role = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
                }
            }
            return user;
        } catch (e) {
            console.error("Error parsing user from localStorage:", e);
            return null;
        }
    }
}

export default new AuthService();