import { baseLogin, baseRegister } from "./login"

enum AuthType {
    user = "user",
    admin = "admin",
    mentor = "mentor"
}
class AuthService {
    async loginAsUser(login: string) {
        try {
            const userData = await baseLogin(login, "/auth/users/signin");
            if (userData) {
                this.setToken(userData.access_token);
                this.setAuthType(AuthType.user);
            }
        } catch (error) {
            await this.logout();
            throw error;
        }
    }
    
    async loginAsMentor(login: string) {
        try {
            const userData = await baseLogin(login, "/auth/mentors/signin");
            if (userData) {
                this.setToken(userData.access_token);
                this.setAuthType(AuthType.mentor);
            }
        } catch (error) {
            await this.logout();
            throw error;
        }
    }
    
    async registerUser(name: string) {
        try {
            const userData = await baseRegister(name, "/auth/users/signup");
            if (userData && userData.access_token) {
                this.setToken(userData.access_token);
                this.setAuthType(AuthType.user);
            }
            return userData;
        } catch (error) {
            throw error;
        }
    }
    
    async registerMentor(name: string) {
        try {
            const userData = await baseRegister(name, "/auth/mentors/signup");
            if (userData && userData.access_token) {
                this.setToken(userData.access_token);
                this.setAuthType(AuthType.mentor);
            }
            return userData;
        } catch (error) {
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
export {authService, AuthType};