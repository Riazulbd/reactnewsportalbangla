import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { articlesApi, categoriesApi, settingsApi, authApi } from '../services/api';

const DataContext = createContext();

// Check if API is available
const isApiAvailable = async () => {
    try {
        const response = await fetch('/api/health');
        return response.ok;
    } catch {
        return false;
    }
};

export function DataProvider({ children }) {
    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [mediaLibrary, setMediaLibrary] = useState([]);
    const [users, setUsers] = useState([]);
    const [settings, setSettings] = useState({
        heroArticleId: null,
        featuredArticleIds: [],
        categoryOrder: [],
        siteLogo: '',
        openaiApiKey: '',
        openaiModel: 'gpt-3.5-turbo',
        webhookApiKey: '',
    });
    const [theme, setTheme] = useState('dark');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [useApi, setUseApi] = useState(false);

    // Load data on mount
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);

            // Check if API is available
            const apiAvailable = await isApiAvailable();
            setUseApi(apiAvailable);

            if (apiAvailable) {
                // Load from API
                try {
                    const [articlesData, categoriesData, settingsData] = await Promise.all([
                        articlesApi.getAll(),
                        categoriesApi.getAll(),
                        settingsApi.getAll().catch(() => ({})),
                    ]);
                    setArticles(articlesData || []);
                    setCategories(categoriesData || []);
                    setSettings(prev => ({ ...prev, ...settingsData }));

                    // Try to get current user
                    const token = localStorage.getItem('authToken');
                    if (token) {
                        try {
                            const userData = await authApi.getCurrentUser();
                            setUser(userData);
                        } catch {
                            localStorage.removeItem('authToken');
                        }
                    }

                    // Load users list
                    try {
                        const usersData = await authApi.getUsers();
                        setUsers(usersData || []);
                    } catch {
                        setUsers([]);
                    }
                } catch (error) {
                    console.error('API load error:', error);
                }
            } else {
                // Fallback to localStorage
                const { articles: initialArticles, categories: initialCategories } = await import('../data/articles');

                const storedArticles = localStorage.getItem('newsArticles');
                const storedCategories = localStorage.getItem('newsCategories');
                const storedSettings = localStorage.getItem('newsSettings');
                const storedUsers = localStorage.getItem('newsUsers');

                setArticles(storedArticles ? JSON.parse(storedArticles) : initialArticles);
                setCategories(storedCategories ? JSON.parse(storedCategories) : initialCategories);
                if (storedSettings) setSettings(prev => ({ ...prev, ...JSON.parse(storedSettings) }));
                if (storedUsers) setUsers(JSON.parse(storedUsers));
            }

            // Load theme
            const storedTheme = localStorage.getItem('newsTheme');
            if (storedTheme) {
                setTheme(storedTheme);
                document.documentElement.setAttribute('data-theme', storedTheme);
            }

            setLoading(false);
        };

        loadData();
    }, []);

    // Theme toggle
    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('newsTheme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    // Articles CRUD
    const addArticle = useCallback(async (article) => {
        if (useApi) {
            try {
                const newArticle = await articlesApi.create(article);
                setArticles(prev => [newArticle, ...prev]);
                return newArticle;
            } catch (error) {
                console.error('Add article error:', error);
                throw error;
            }
        } else {
            const newArticle = {
                ...article,
                id: Math.max(...articles.map(a => a.id || 0), 0) + 1,
                createdAt: new Date().toISOString(),
            };
            const updated = [newArticle, ...articles];
            setArticles(updated);
            localStorage.setItem('newsArticles', JSON.stringify(updated));
            return newArticle;
        }
    }, [useApi, articles]);

    const updateArticle = useCallback(async (id, updates) => {
        if (useApi) {
            try {
                const updated = await articlesApi.update(id, updates);
                setArticles(prev => prev.map(a => a.id === id ? updated : a));
                return updated;
            } catch (error) {
                console.error('Update article error:', error);
                throw error;
            }
        } else {
            const updated = articles.map(a =>
                a.id === parseInt(id) ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
            );
            setArticles(updated);
            localStorage.setItem('newsArticles', JSON.stringify(updated));
            return updated.find(a => a.id === parseInt(id));
        }
    }, [useApi, articles]);

    const deleteArticle = useCallback(async (id) => {
        if (useApi) {
            try {
                await articlesApi.delete(id);
                setArticles(prev => prev.filter(a => a.id !== id));
            } catch (error) {
                console.error('Delete article error:', error);
                throw error;
            }
        } else {
            const updated = articles.filter(a => a.id !== parseInt(id));
            setArticles(updated);
            localStorage.setItem('newsArticles', JSON.stringify(updated));
        }
    }, [useApi, articles]);

    const getArticleById = useCallback((id) => {
        return articles.find(a => a.id === parseInt(id) || a.slug === id);
    }, [articles]);

    const getArticlesByCategory = useCallback((categoryId) => {
        return articles.filter(a => a.category === categoryId);
    }, [articles]);

    const getFeaturedArticles = useCallback(() => {
        if (settings.featuredArticleIds?.length > 0) {
            return settings.featuredArticleIds
                .map(id => articles.find(a => a.id === id))
                .filter(Boolean);
        }
        return articles.filter(a => a.featured).slice(0, 5);
    }, [articles, settings.featuredArticleIds]);

    const setFeaturedArticles = useCallback(async (ids) => {
        await saveSettings({ featuredArticleIds: ids });
    }, []);

    const getHeroArticle = useCallback(() => {
        if (settings.heroArticleId) {
            return articles.find(a => a.id === settings.heroArticleId);
        }
        return articles.find(a => a.featured) || articles[0];
    }, [articles, settings.heroArticleId]);

    const searchArticles = useCallback((query) => {
        const lower = query.toLowerCase();
        return articles.filter(a =>
            a.title?.toLowerCase().includes(lower) ||
            a.excerpt?.toLowerCase().includes(lower) ||
            a.content?.toLowerCase().includes(lower)
        );
    }, [articles]);

    // Categories CRUD
    const addCategory = useCallback(async (category) => {
        if (useApi) {
            try {
                const newCat = await categoriesApi.create(category);
                setCategories(prev => [...prev, newCat]);
                return newCat;
            } catch (error) {
                console.error('Add category error:', error);
                throw error;
            }
        } else {
            const newCat = {
                ...category,
                id: category.slug || category.name.toLowerCase().replace(/\s+/g, '-'),
            };
            const updated = [...categories, newCat];
            setCategories(updated);
            localStorage.setItem('newsCategories', JSON.stringify(updated));
            return newCat;
        }
    }, [useApi, categories]);

    const updateCategory = useCallback(async (id, updates) => {
        if (useApi) {
            try {
                const updated = await categoriesApi.update(id, updates);
                setCategories(prev => prev.map(c => c.id === id ? updated : c));
                return updated;
            } catch (error) {
                console.error('Update category error:', error);
                throw error;
            }
        } else {
            const updated = categories.map(c =>
                c.id === id ? { ...c, ...updates } : c
            );
            setCategories(updated);
            localStorage.setItem('newsCategories', JSON.stringify(updated));
            return updated.find(c => c.id === id);
        }
    }, [useApi, categories]);

    const deleteCategory = useCallback(async (id) => {
        if (useApi) {
            try {
                await categoriesApi.delete(id);
                setCategories(prev => prev.filter(c => c.id !== id));
            } catch (error) {
                console.error('Delete category error:', error);
                throw error;
            }
        } else {
            const updated = categories.filter(c => c.id !== id);
            setCategories(updated);
            localStorage.setItem('newsCategories', JSON.stringify(updated));
        }
    }, [useApi, categories]);

    const getMainCategories = useCallback(() => {
        const mainCats = categories.filter(c => !c.parent_id && !c.parentId);
        if (settings.categoryOrder?.length > 0) {
            return settings.categoryOrder
                .map(id => mainCats.find(c => c.id === id || c.slug === id))
                .filter(Boolean)
                .concat(mainCats.filter(c =>
                    !settings.categoryOrder.includes(c.id) &&
                    !settings.categoryOrder.includes(c.slug)
                ));
        }
        return mainCats;
    }, [categories, settings.categoryOrder]);

    const getSubcategories = useCallback((parentId) => {
        return categories.filter(c => c.parent_id === parentId || c.parentId === parentId);
    }, [categories]);

    const getAllCategories = useCallback(() => categories, [categories]);

    const reorderCategories = useCallback(async (order) => {
        if (useApi) {
            try {
                await categoriesApi.reorder(order);
            } catch (error) {
                console.error('Reorder error:', error);
            }
        }
        await saveSettings({ categoryOrder: order });
    }, [useApi]);

    // Settings
    const saveSettings = useCallback(async (newSettings) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);

        if (useApi) {
            try {
                await settingsApi.save(newSettings);
            } catch (error) {
                console.error('Save settings error:', error);
            }
        }
        localStorage.setItem('newsSettings', JSON.stringify(updated));
    }, [useApi, settings]);

    // Webhook API Key
    const generateWebhookApiKey = useCallback(async () => {
        if (useApi) {
            try {
                const { apiKey } = await settingsApi.generateApiKey();
                setSettings(prev => ({ ...prev, webhookApiKey: apiKey }));
                return apiKey;
            } catch (error) {
                console.error('Generate API key error:', error);
            }
        }
        // Fallback
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let key = 'whk_';
        for (let i = 0; i < 32; i++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        await saveSettings({ webhookApiKey: key });
        return key;
    }, [useApi, saveSettings]);

    // Users (API only for full CRUD)
    const addUser = useCallback(async (userData) => {
        if (useApi) {
            try {
                const newUser = await authApi.createUser(userData);
                setUsers(prev => [...prev, newUser]);
                return newUser;
            } catch (error) {
                console.error('Add user error:', error);
                throw error;
            }
        }
        // Fallback
        const newUser = { ...userData, id: users.length + 1, createdAt: new Date().toISOString() };
        const updated = [...users, newUser];
        setUsers(updated);
        localStorage.setItem('newsUsers', JSON.stringify(updated));
        return newUser;
    }, [useApi, users]);

    const updateUser = useCallback(async (id, updates) => {
        if (useApi) {
            try {
                const updated = await authApi.updateUser(id, updates);
                setUsers(prev => prev.map(u => u.id === id ? updated : u));
                return updated;
            } catch (error) {
                console.error('Update user error:', error);
                throw error;
            }
        }
        const updated = users.map(u => u.id === id ? { ...u, ...updates } : u);
        setUsers(updated);
        localStorage.setItem('newsUsers', JSON.stringify(updated));
        return updated.find(u => u.id === id);
    }, [useApi, users]);

    const deleteUser = useCallback(async (id) => {
        if (id === 1) return;
        if (useApi) {
            try {
                await authApi.deleteUser(id);
                setUsers(prev => prev.filter(u => u.id !== id));
            } catch (error) {
                console.error('Delete user error:', error);
                throw error;
            }
        } else {
            const updated = users.filter(u => u.id !== id);
            setUsers(updated);
            localStorage.setItem('newsUsers', JSON.stringify(updated));
        }
    }, [useApi, users]);

    const getUserById = useCallback((id) => users.find(u => u.id === id), [users]);

    // Slug generation
    const generateSlug = useCallback((title) => {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }, []);

    const generateSlugWithAI = useCallback(async (title) => {
        if (!settings.openaiApiKey) return generateSlug(title);

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${settings.openaiApiKey}`,
                },
                body: JSON.stringify({
                    model: settings.openaiModel || 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'Convert the title to an SEO-friendly English URL slug. Use only lowercase letters, numbers, and hyphens. Max 60 chars. Respond with ONLY the slug.'
                        },
                        { role: 'user', content: title }
                    ],
                    temperature: 0.3,
                    max_tokens: 100,
                }),
            });

            if (!response.ok) return generateSlug(title);
            const data = await response.json();
            return data.choices[0].message.content.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
        } catch {
            return generateSlug(title);
        }
    }, [settings.openaiApiKey, settings.openaiModel, generateSlug]);

    // SEO generation
    const generateSEOWithAI = useCallback(async (title, content) => {
        if (!settings.openaiApiKey) return null;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${settings.openaiApiKey}`,
                },
                body: JSON.stringify({
                    model: settings.openaiModel || 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'Generate SEO metadata as JSON: {"metaTitle": "60 chars max", "metaDescription": "160 chars max", "keywords": ["5 keywords"]}'
                        },
                        { role: 'user', content: `Title: ${title}\n\nContent: ${content.substring(0, 500)}` }
                    ],
                    temperature: 0.5,
                }),
            });

            if (!response.ok) return null;
            const data = await response.json();
            return JSON.parse(data.choices[0].message.content);
        } catch {
            return null;
        }
    }, [settings.openaiApiKey, settings.openaiModel]);

    // Media library
    const addMedia = useCallback((media) => {
        const newMedia = { ...media, id: Date.now(), createdAt: new Date().toISOString() };
        const updated = [newMedia, ...mediaLibrary];
        setMediaLibrary(updated);
        localStorage.setItem('newsMediaLibrary', JSON.stringify(updated));
        return newMedia;
    }, [mediaLibrary]);

    const deleteMedia = useCallback((id) => {
        const updated = mediaLibrary.filter(m => m.id !== id);
        setMediaLibrary(updated);
        localStorage.setItem('newsMediaLibrary', JSON.stringify(updated));
    }, [mediaLibrary]);

    const searchMedia = useCallback((query) => {
        const lower = query.toLowerCase();
        return mediaLibrary.filter(m =>
            m.name?.toLowerCase().includes(lower) ||
            m.alt?.toLowerCase().includes(lower)
        );
    }, [mediaLibrary]);

    // User password update
    const updateUserPassword = useCallback(async (currentPassword, newPassword) => {
        if (useApi) {
            // API handles password update
            try {
                await authApi.updateUser(user.id, { password: newPassword });
                return { success: true };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }
        // Fallback
        const currentUser = users.find(u => u.id === user?.id);
        if (currentUser && currentUser.password === currentPassword) {
            await updateUser(user.id, { password: newPassword });
            return { success: true };
        }
        return { success: false, error: 'ভুল পাসওয়ার্ড' };
    }, [useApi, user, users, updateUser]);

    const saveUser = useCallback((userData) => {
        setUser(userData);
        localStorage.setItem('newsUser', JSON.stringify(userData));
    }, []);

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
        <DataContext.Provider value={{
            articles,
            categories,
            mediaLibrary,
            settings,
            theme,
            user,
            users,
            loading,
            useApi,
            toggleTheme,
            generateSlug,
            generateSlugWithAI,
            generateSEOWithAI,
            addArticle,
            updateArticle,
            deleteArticle,
            getArticleById,
            getArticlesByCategory,
            getFeaturedArticles,
            setFeaturedArticles,
            getHeroArticle,
            searchArticles,
            addCategory,
            updateCategory,
            deleteCategory,
            getMainCategories,
            getSubcategories,
            getAllCategories,
            reorderCategories,
            addMedia,
            deleteMedia,
            searchMedia,
            saveSettings,
            generateWebhookApiKey,
            updateUserPassword,
            saveUser,
            addUser,
            updateUser,
            deleteUser,
            getUserById,
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
