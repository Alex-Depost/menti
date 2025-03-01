import { useState, useEffect } from 'react';
import { authService, AuthType } from '../app/service/auth';

interface AuthStatus {
    isAuthenticated: boolean;
    authType: string | null;
    isUser: boolean;
}

export function useAuth(): AuthStatus {
    const [authStatus, setAuthStatus] = useState<AuthStatus>({
        isAuthenticated: false,
        authType: null,
        isUser: false,
    });

    useEffect(() => {
        const isAuth = authService.isAuthenticated();
        const authType = isAuth ? authService.getAuthType() : null;

        setAuthStatus({
            isAuthenticated: isAuth,
            authType,
            isUser: authType === AuthType.user,
        });
    }, []);

    return authStatus;
}