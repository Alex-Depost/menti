import { userLogin } from "./userlogin"

enum AuthType {
    user = "user",
    admin = "admin",
    mentor = "mentor"
}
class AuthService {
    getToken() {
        return window.localStorage.getItem("token")
    }
    setToken(token: string) {
        window.localStorage.setItem("token", token)
    }
    removeToken() {
        window.localStorage.removeItem("token")
    }
    setAuthType(authType: AuthType) {
        window.localStorage.setItem("authType", authType)
    }
    getAuthType() {
        return window.localStorage.getItem("authType")
    }

    async loginAsUser(username: string, password: string) {
        try {
            const userData = await userLogin(username, password);
            if (userData) {
                this.setToken(userData.access_token);
                this.setAuthType(AuthType.user);
            }
        } catch (error) {
            this.removeToken();
            throw error;
        }
    }

    async logout() {
        this.removeToken();
        window.localStorage.removeItem("authType");
    }
}

const authService = new AuthService();
export default authService;