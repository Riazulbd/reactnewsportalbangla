import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check session storage on mount
        const authData = sessionStorage.getItem('adminAuth');
        if (authData) {
            const parsed = JSON.parse(authData);
            setIsAuthenticated(true);
            setUser(parsed.user);
        }
        setLoading(false);
    }, []);

    const login = (username, password) => {
        // Demo credentials
        if (username === 'admin' && password === 'admin123') {
            const userData = {
                username: 'admin',
                name: 'অ্যাডমিন',
                role: 'প্রশাসক'
            };
            setIsAuthenticated(true);
            setUser(userData);
            sessionStorage.setItem('adminAuth', JSON.stringify({ user: userData }));
            return { success: true };
        }
        return { success: false, error: 'ভুল ইউজারনেম বা পাসওয়ার্ড' };
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        sessionStorage.removeItem('adminAuth');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
