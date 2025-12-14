import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check localStorage on mount (using localStorage instead of sessionStorage for persistence)
        const authData = localStorage.getItem('adminAuth');
        if (authData) {
            try {
                const parsed = JSON.parse(authData);
                if (parsed && parsed.user) {
                    setIsAuthenticated(true);
                    setUser(parsed.user);
                }
            } catch (e) {
                localStorage.removeItem('adminAuth');
            }
        }
        setLoading(false);
    }, []);

    const login = (username, password) => {
        // First check default credentials (always works)
        if (username === 'admin' && password === 'admin123') {
            const userData = {
                id: 1,
                username: 'admin',
                name: 'অ্যাডমিন',
                email: 'admin@example.com',
                role: 'admin'
            };
            setIsAuthenticated(true);
            setUser(userData);
            localStorage.setItem('adminAuth', JSON.stringify({ user: userData }));
            return { success: true };
        }

        // Then check users from localStorage
        const storedUsers = localStorage.getItem('newsUsers');
        if (storedUsers) {
            try {
                const users = JSON.parse(storedUsers);
                const foundUser = users.find(u => u.username === username && u.password === password);

                if (foundUser) {
                    const userData = {
                        id: foundUser.id,
                        username: foundUser.username,
                        name: foundUser.name,
                        email: foundUser.email,
                        role: foundUser.role
                    };
                    setIsAuthenticated(true);
                    setUser(userData);
                    localStorage.setItem('adminAuth', JSON.stringify({ user: userData }));
                    return { success: true };
                }
            } catch (e) {
                console.error('Error parsing users:', e);
            }
        }

        return { success: false, error: 'ভুল ইউজারনেম বা পাসওয়ার্ড' };
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('adminAuth');
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
