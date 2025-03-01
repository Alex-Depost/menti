import { baseLogin } from "./login"

enum AuthType {
    user = "user",
    admin = "admin",
    mentor = "mentor"
}
class AuthService {
    async loginAsUser(username: string, password: string) {
        try {
            const userData = await baseLogin(username, password, "/auth/users/signin");
            if (userData) {
                this.setToken(userData.access_token);
                this.setAuthType(AuthType.user);
            }
        } catch (error) {
            await this.logout();
            throw error;
        }
    }
    async loginAsMentor(username: string, password: string) {
        try {
            const userData = await baseLogin(username, password, "/auth/mentors/signin");
            if (userData) {
                this.setToken(userData.access_token);
                this.setAuthType(AuthType.mentor);
            }
        } catch (error) {
            await this.logout();
            throw error;
        }
    }

    async logout() {
        this.removeToken();
        window.localStorage.removeItem("authType");
    }
    getToken() {
        return window.localStorage.getItem("token")
    }
    getAuthType() {
        return window.localStorage.getItem("authType");
    }
    isAuthenticated() {
        return !!this.getToken()
    }

    isMentor() {
        return this.getAuthType() === AuthType.mentor;
    }

    isUser() {
        return this.getAuthType() === AuthType.user;
    }

    private setToken(token: string) {
        window.localStorage.setItem("token", token)
    }
    private removeToken() {
        window.localStorage.removeItem("token")
    }
    private setAuthType(authType: AuthType) {
        window.localStorage.setItem("authType", authType)
    }
}

const authService = new AuthService();
export default authService;