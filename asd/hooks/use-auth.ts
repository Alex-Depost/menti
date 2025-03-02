import { useState, useEffect } from 'react';
import { authService, AuthType, AUTH_CHANGE_EVENT } from '../app/service/auth';

interface AuthStatus {
    isAuthenticated: boolean;
    authType: string | null;
    isUser: boolean;
    isMentor: boolean;
}

export function useAuth(): AuthStatus {
    const [authStatus, setAuthStatus] = useState<AuthStatus>({
        isAuthenticated: false,
        authType: null,
        isUser: false,
        isMentor: false,
    });

    // Function to update auth status
    const updateAuthStatus = () => {
        const isAuth = authService.isAuthenticated();
        const authType = isAuth ? authService.getAuthType() : null;

        setAuthStatus({
            isAuthenticated: isAuth,
            authType,
            isUser: authType === AuthType.user,
            isMentor: authType === AuthType.mentor,
        });
    };

    useEffect(() => {
        // Initial check
        updateAuthStatus();

        // Set up event listener for auth changes
        const handleAuthChange = () => {
            updateAuthStatus();
        };

        // Listen for custom auth change events
        window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
        
        // Also listen for storage events (for changes in other tabs)
        window.addEventListener('storage', (event) => {
            if (event.key === 'token' || event.key === 'authType') {
                updateAuthStatus();
            }
        });

        // Clean up event listeners
        return () => {
            window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
            window.removeEventListener('storage', handleAuthChange);
        };
    }, []);

    return authStatus;
}