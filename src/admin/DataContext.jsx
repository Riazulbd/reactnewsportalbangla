import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { articlesApi, categoriesApi, settingsApi, authApi } from '../services/api';

const DataContext = createContext();

// Check if API is available
const isApiAvailable = async () => {
    try {
        const response = await fetch('/api/health');
        if (!response.ok) return false;
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return false;
        }
        return true;
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
        sliderInterval: 5000,
        maxImageSizeMB: 5,
    });
    const [theme, setTheme] = useState('dark');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [apiAvailable, setApiAvailable] = useState(false);
    const [error, setError] = useState(null);

    // Load data on mount
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);

            // Check if API is available
            const available = await isApiAvailable();
            setApiAvailable(available);

            if (!available) {
                // API not available - show error (no localStorage fallback)
                setError('API সার্ভার চালু নেই। অনুগ্রহ করে Backend সার্ভার চালু করুন।');
                setLoading(false);
                return;
            }

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
            } catch (err) {
                console.error('API load error:', err);
                setError('ডাটা লোড করতে সমস্যা হয়েছে।');
            }

            // Load theme (only theme stays in localStorage - it's just preference)
            const storedTheme = localStorage.getItem('newsTheme');
            if (storedTheme) {
                setTheme(storedTheme);
                document.documentElement.setAttribute('data-theme', storedTheme);
            }

            setLoading(false);
        };

        loadData();
    }, []);

    // Theme toggle (theme preference can stay in localStorage)
    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('newsTheme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    // ===================== ARTICLES CRUD (API ONLY) =====================
    const addArticle = useCallback(async (article) => {
        if (!apiAvailable) throw new Error('API not available');
        const newArticle = await articlesApi.create(article);
        setArticles(prev => [newArticle, ...prev]);
        return newArticle;
    }, [apiAvailable]);

    const updateArticle = useCallback(async (id, updates) => {
        if (!apiAvailable) throw new Error('API not available');
        const updated = await articlesApi.update(id, updates);
        setArticles(prev => prev.map(a => a.id === id ? updated : a));
        return updated;
    }, [apiAvailable]);

    const deleteArticle = useCallback(async (id) => {
        if (!apiAvailable) throw new Error('API not available');
        await articlesApi.delete(id);
        setArticles(prev => prev.filter(a => a.id !== id));
    }, [apiAvailable]);

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

    // ===================== CATEGORIES CRUD (API ONLY) =====================
    const addCategory = useCallback(async (category) => {
        if (!apiAvailable) throw new Error('API not available');
        const newCat = await categoriesApi.create(category);
        setCategories(prev => [...prev, newCat]);
        return newCat;
    }, [apiAvailable]);

    const updateCategory = useCallback(async (id, updates) => {
        if (!apiAvailable) throw new Error('API not available');
        const updated = await categoriesApi.update(id, updates);
        setCategories(prev => prev.map(c => c.id === id ? updated : c));
        return updated;
    }, [apiAvailable]);

    const deleteCategory = useCallback(async (id) => {
        if (!apiAvailable) throw new Error('API not available');
        await categoriesApi.delete(id);
        setCategories(prev => prev.filter(c => c.id !== id));
    }, [apiAvailable]);

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
        if (apiAvailable) {
            try {
                await categoriesApi.reorder(order);
            } catch (err) {
                console.error('Reorder error:', err);
            }
        }
        await saveSettings({ categoryOrder: order });
    }, [apiAvailable]);

    // ===================== SETTINGS (API ONLY) =====================
    const saveSettings = useCallback(async (newSettings) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);

        if (apiAvailable) {
            try {
                await settingsApi.save(newSettings);
            } catch (err) {
                console.error('Save settings error:', err);
                throw err;
            }
        }
    }, [apiAvailable, settings]);

    // Webhook API Key
    const generateWebhookApiKey = useCallback(async () => {
        if (!apiAvailable) throw new Error('API not available');
        const { apiKey } = await settingsApi.generateApiKey();
        setSettings(prev => ({ ...prev, webhookApiKey: apiKey }));
        return apiKey;
    }, [apiAvailable]);

    // ===================== USERS (API ONLY) =====================
    const addUser = useCallback(async (userData) => {
        if (!apiAvailable) throw new Error('API not available');
        const newUser = await authApi.createUser(userData);
        setUsers(prev => [...prev, newUser]);
        return newUser;
    }, [apiAvailable]);

    const updateUser = useCallback(async (id, updates) => {
        if (!apiAvailable) throw new Error('API not available');
        const updated = await authApi.updateUser(id, updates);
        setUsers(prev => prev.map(u => u.id === id ? updated : u));
        return updated;
    }, [apiAvailable]);

    const deleteUser = useCallback(async (id) => {
        if (id === 1) return; // Protect admin
        if (!apiAvailable) throw new Error('API not available');
        await authApi.deleteUser(id);
        setUsers(prev => prev.filter(u => u.id !== id));
    }, [apiAvailable]);

    const getUserById = useCallback((id) => users.find(u => u.id === id), [users]);

    // ===================== SLUG GENERATION =====================
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

    // ===================== MEDIA LIBRARY (API when available) =====================
    const addMedia = useCallback(async (media) => {
        const newMedia = { ...media, id: Date.now(), createdAt: new Date().toISOString() };
        setMediaLibrary(prev => [newMedia, ...prev]);
        // TODO: Implement media API when ready
        return newMedia;
    }, []);

    const deleteMedia = useCallback(async (id) => {
        setMediaLibrary(prev => prev.filter(m => m.id !== id));
        // TODO: Implement media API when ready
    }, []);

    const searchMedia = useCallback((query) => {
        const lower = query.toLowerCase();
        return mediaLibrary.filter(m =>
            m.name?.toLowerCase().includes(lower) ||
            m.alt?.toLowerCase().includes(lower)
        );
    }, [mediaLibrary]);

    // User password update
    const updateUserPassword = useCallback(async (currentPassword, newPassword) => {
        if (!apiAvailable) throw new Error('API not available');
        const response = await fetch('/api/auth/password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
            body: JSON.stringify({ currentPassword, newPassword }),
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Password update failed');
        }
        return true;
    }, [apiAvailable]);

    // Refresh data
    const refreshData = useCallback(async () => {
        if (!apiAvailable) return;
        try {
            const [articlesData, categoriesData] = await Promise.all([
                articlesApi.getAll(),
                categoriesApi.getAll(),
            ]);
            setArticles(articlesData || []);
            setCategories(categoriesData || []);
        } catch (err) {
            console.error('Refresh error:', err);
        }
    }, [apiAvailable]);

    const value = {
        // State
        articles,
        categories,
        mediaLibrary,
        users,
        settings,
        theme,
        user,
        loading,
        error,
        apiAvailable,
        setUser,

        // Theme
        toggleTheme,

        // Articles
        addArticle,
        updateArticle,
        deleteArticle,
        getArticleById,
        getArticlesByCategory,
        getFeaturedArticles,
        setFeaturedArticles,
        getHeroArticle,
        searchArticles,

        // Categories
        addCategory,
        updateCategory,
        deleteCategory,
        getMainCategories,
        getSubcategories,
        getAllCategories,
        reorderCategories,

        // Settings
        saveSettings,
        generateWebhookApiKey,

        // Users
        addUser,
        updateUser,
        deleteUser,
        getUserById,
        updateUserPassword,

        // Utilities
        generateSlug,
        generateSlugWithAI,
        generateSEOWithAI,

        // Media
        addMedia,
        deleteMedia,
        searchMedia,

        // Refresh
        refreshData,
    };

    return (
        <DataContext.Provider value={value}>
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

export default DataContext;
