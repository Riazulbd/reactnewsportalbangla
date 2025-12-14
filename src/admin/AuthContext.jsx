import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing token
        const checkAuth = async () => {
            const token = localStorage.getItem('authToken');

            if (token) {
                try {
                    const userData = await authApi.getCurrentUser();
                    setUser(userData);
                    setIsAuthenticated(true);
                } catch {
                    // Token invalid, clear it
                    localStorage.removeItem('authToken');
                }
            } else {
                // Check localStorage fallback
                const authData = localStorage.getItem('adminAuth');
                if (authData) {
                    const { user: storedUser } = JSON.parse(authData);
                    setUser(storedUser);
                    setIsAuthenticated(true);
                }
            }

            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (username, password) => {
        try {
            // Try API login first
            const result = await authApi.login(username, password);

            if (result.success) {
                setUser(result.user);
                setIsAuthenticated(true);
                return { success: true };
            }

            return { success: false, error: result.error || 'লগইন ব্যর্থ' };
        } catch (error) {
            console.log('API login failed, trying fallback:', error.message);

            // Fallback: check default admin
            if (username === 'admin' && password === 'admin123') {
                const userData = {
                    id: 1,
                    username: 'admin',
                    name: 'অ্যাডমিন',
                    email: 'admin@example.com',
                    role: 'admin'
                };
                setUser(userData);
                setIsAuthenticated(true);
                localStorage.setItem('adminAuth', JSON.stringify({ user: userData }));
                return { success: true };
            }

            // Fallback: check localStorage users
            const storedUsers = localStorage.getItem('newsUsers');
            if (storedUsers) {
                const users = JSON.parse(storedUsers);
                const found = users.find(u => u.username === username && u.password === password);
                if (found) {
                    const userData = {
                        id: found.id,
                        username: found.username,
                        name: found.name,
                        email: found.email,
                        role: found.role
                    };
                    setUser(userData);
                    setIsAuthenticated(true);
                    localStorage.setItem('adminAuth', JSON.stringify({ user: userData }));
                    return { success: true };
                }
            }

            return { success: false, error: 'ভুল ইউজারনেম বা পাসওয়ার্ড' };
        }
    };

    const logout = () => {
        authApi.logout();
        localStorage.removeItem('adminAuth');
        setUser(null);
        setIsAuthenticated(false);
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'var(--color-bg-primary)',
                color: 'var(--color-text-primary)'
            }}>
                <div>লোড হচ্ছে...</div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
