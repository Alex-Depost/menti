import { baseLogin, baseRegister } from "./login"

export enum AuthType {
    user = "user",
    admin = "admin",
    mentor = "mentor"
}

// Custom event for auth changes
export const AUTH_CHANGE_EVENT = 'auth-state-change';

class AuthService {
    async loginAsUser(login: string) {
        try {
            const userData = await baseLogin(login, "/auth/users/signin");
            if (userData) {
                this.setToken(userData.access_token);
                this.setAuthType(AuthType.user);
                this.notifyAuthChange();
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
                this.notifyAuthChange();
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
                this.notifyAuthChange();
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
                this.notifyAuthChange();
            }
            return userData;
        } catch (error) {
            throw error;
        }
    }

    async logout() {
        this.removeToken();
        window.localStorage.removeItem("authType");
        this.notifyAuthChange();
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
    
    // Notify about auth state changes
    private notifyAuthChange() {
        // Dispatch a custom event that can be listened to
        window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT));
    }
}

const authService = new AuthService();
export {authService};