import { createContext, useContext, useState, useEffect } from 'react';
import { articles as initialArticles, categories as initialCategories } from '../data/articles';

const DataContext = createContext();

// Default users with roles
const defaultUsers = [
    { id: 1, username: 'admin', password: 'admin123', name: 'অ্যাডমিন', email: 'admin@example.com', role: 'admin' },
];

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
    });
    const [theme, setTheme] = useState('dark');
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Load from localStorage or use initial data
        const storedArticles = localStorage.getItem('newsArticles');
        const storedCategories = localStorage.getItem('newsCategories');
        const storedTheme = localStorage.getItem('newsTheme');
        const storedMedia = localStorage.getItem('newsMediaLibrary');
        const storedSettings = localStorage.getItem('newsSettings');
        const storedUser = localStorage.getItem('newsUser');
        const storedUsers = localStorage.getItem('newsUsers');

        if (storedArticles) {
            setArticles(JSON.parse(storedArticles));
        } else {
            setArticles(initialArticles);
            localStorage.setItem('newsArticles', JSON.stringify(initialArticles));
        }

        if (storedCategories) {
            setCategories(JSON.parse(storedCategories));
        } else {
            setCategories(initialCategories);
            localStorage.setItem('newsCategories', JSON.stringify(initialCategories));
        }

        if (storedTheme) {
            setTheme(storedTheme);
            document.documentElement.setAttribute('data-theme', storedTheme);
        }

        if (storedMedia) {
            setMediaLibrary(JSON.parse(storedMedia));
        }

        if (storedSettings) {
            setSettings(prev => ({ ...prev, ...JSON.parse(storedSettings) }));
        }

        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        if (storedUsers) {
            setUsers(JSON.parse(storedUsers));
        } else {
            setUsers(defaultUsers);
            localStorage.setItem('newsUsers', JSON.stringify(defaultUsers));
        }
    }, []);

    // Save functions
    const saveArticles = (newArticles) => {
        setArticles(newArticles);
        localStorage.setItem('newsArticles', JSON.stringify(newArticles));
    };

    const saveCategories = (newCategories) => {
        setCategories(newCategories);
        localStorage.setItem('newsCategories', JSON.stringify(newCategories));
    };

    const saveMedia = (newMedia) => {
        setMediaLibrary(newMedia);
        localStorage.setItem('newsMediaLibrary', JSON.stringify(newMedia));
    };

    const saveSettings = (newSettings) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        localStorage.setItem('newsSettings', JSON.stringify(updated));
    };

    const saveUser = (userData) => {
        setUser(userData);
        localStorage.setItem('newsUser', JSON.stringify(userData));
    };

    const saveUsers = (newUsers) => {
        setUsers(newUsers);
        localStorage.setItem('newsUsers', JSON.stringify(newUsers));
    };

    // Theme toggle
    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('newsTheme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    // Basic slug generation (fallback)
    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    // AI-powered English slug generation
    const generateSlugWithAI = async (title) => {
        if (!settings.openaiApiKey) {
            return generateSlug(title);
        }

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
                            content: 'You are a URL slug generator. Convert the given title (which may be in Bengali or any language) to an SEO-friendly English URL slug. Use only lowercase letters, numbers, and hyphens. Max 60 chars. Respond with ONLY the slug, nothing else.'
                        },
                        {
                            role: 'user',
                            content: title
                        }
                    ],
                    temperature: 0.3,
                    max_tokens: 100,
                }),
            });

            if (!response.ok) {
                return generateSlug(title);
            }

            const data = await response.json();
            const slug = data.choices[0].message.content.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
            return slug;
        } catch (error) {
            console.error('AI Slug Error:', error);
            return generateSlug(title);
        }
    };

    // User Management
    const addUser = (userData) => {
        const newUser = {
            ...userData,
            id: Math.max(...users.map(u => u.id), 0) + 1,
            createdAt: new Date().toISOString(),
        };
        saveUsers([...users, newUser]);
        return newUser;
    };

    const updateUser = (id, updates) => {
        const updated = users.map(u =>
            u.id === id ? { ...u, ...updates } : u
        );
        saveUsers(updated);
    };

    const deleteUser = (id) => {
        if (id === 1) return; // Can't delete main admin
        saveUsers(users.filter(u => u.id !== id));
    };

    const getUserById = (id) => users.find(u => u.id === id);

    const authenticateUser = (username, password) => {
        return users.find(u => u.username === username && u.password === password);
    };

    // Article CRUD
    const addArticle = (article) => {
        const newArticle = {
            ...article,
            id: Math.max(...articles.map(a => a.id), 0) + 1,
            slug: article.slug || generateSlug(article.title),
            date: new Date().toLocaleDateString('bn-BD'),
            tags: article.tags || [],
            seo: article.seo || {
                metaTitle: '',
                metaDescription: '',
                keywords: '',
                canonical: '',
                googleNewsKeywords: '',
            },
        };
        saveArticles([newArticle, ...articles]);
        return newArticle;
    };

    const updateArticle = (id, updates) => {
        const updated = articles.map(a =>
            a.id === id ? { ...a, ...updates } : a
        );
        saveArticles(updated);
    };

    const deleteArticle = (id) => {
        saveArticles(articles.filter(a => a.id !== id));
        // Remove from featured if present
        if (settings.featuredArticleIds?.includes(id)) {
            saveSettings({
                featuredArticleIds: settings.featuredArticleIds.filter(fid => fid !== id)
            });
        }
    };

    const getArticleById = (id) => articles.find(a => a.id === parseInt(id));

    const getArticlesByCategory = (categoryId) => {
        const allCategoryIds = [categoryId];
        const getSubcategoryIds = (parentId) => {
            categories.forEach(cat => {
                if (cat.parentId === parentId) {
                    allCategoryIds.push(cat.id);
                    getSubcategoryIds(cat.id);
                }
            });
        };
        getSubcategoryIds(categoryId);
        return articles.filter(a => allCategoryIds.includes(a.category));
    };

    const getFeaturedArticles = () => {
        if (settings.featuredArticleIds?.length > 0) {
            return settings.featuredArticleIds
                .map(id => articles.find(a => a.id === id))
                .filter(Boolean);
        }
        return articles.filter(a => a.featured).slice(0, 5);
    };

    const setFeaturedArticles = (articleIds) => {
        saveSettings({ featuredArticleIds: articleIds.slice(0, 5) });
    };

    const getHeroArticle = () => {
        const featured = getFeaturedArticles();
        return featured[0] || articles[0];
    };

    const searchArticles = (query) => {
        const lowerQuery = query.toLowerCase();
        return articles.filter(a =>
            a.title.toLowerCase().includes(lowerQuery) ||
            a.excerpt.toLowerCase().includes(lowerQuery) ||
            (a.tags && a.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
        );
    };

    // Category CRUD
    const addCategory = (category) => {
        const newCategory = {
            ...category,
            id: category.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
            parentId: category.parentId || null,
            order: categories.length,
        };
        saveCategories([...categories, newCategory]);
        return newCategory;
    };

    const updateCategory = (id, updates) => {
        const updated = categories.map(c =>
            c.id === id ? { ...c, ...updates } : c
        );
        saveCategories(updated);
    };

    const deleteCategory = (id) => {
        const idsToDelete = [id];
        const getSubcategoryIds = (parentId) => {
            categories.forEach(cat => {
                if (cat.parentId === parentId) {
                    idsToDelete.push(cat.id);
                    getSubcategoryIds(cat.id);
                }
            });
        };
        getSubcategoryIds(id);
        saveCategories(categories.filter(c => !idsToDelete.includes(c.id)));
    };

    const getMainCategories = () => {
        const mainCats = categories.filter(c => !c.parentId);
        return mainCats.sort((a, b) => (a.order || 0) - (b.order || 0));
    };

    const getSubcategories = (parentId) => categories.filter(c => c.parentId === parentId);

    const getAllCategories = () => categories;

    const reorderCategories = (orderedIds) => {
        const updated = categories.map(c => ({
            ...c,
            order: orderedIds.indexOf(c.id),
        }));
        saveCategories(updated);
    };

    // Media Library with file upload
    const addMedia = (media) => {
        const newMedia = {
            ...media,
            id: Date.now(),
            uploadedAt: new Date().toISOString(),
        };
        saveMedia([newMedia, ...mediaLibrary]);
        return newMedia;
    };

    const deleteMedia = (id) => {
        saveMedia(mediaLibrary.filter(m => m.id !== id));
    };

    const searchMedia = (query) => {
        const lowerQuery = query.toLowerCase();
        return mediaLibrary.filter(m =>
            m.name?.toLowerCase().includes(lowerQuery) ||
            m.alt?.toLowerCase().includes(lowerQuery)
        );
    };

    // OpenAI Integration
    const generateSEOWithAI = async (content, title) => {
        if (!settings.openaiApiKey) {
            throw new Error('OpenAI API কী সেটিংসে যোগ করুন');
        }

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
                            content: 'You are an SEO expert. Generate SEO metadata in JSON format with these fields: metaTitle (max 60 chars), metaDescription (max 160 chars), keywords (comma-separated), googleNewsKeywords (comma-separated news keywords). Respond ONLY with valid JSON, no markdown.'
                        },
                        {
                            role: 'user',
                            content: `Generate SEO for this article:\nTitle: ${title}\nContent: ${content.substring(0, 1500)}`
                        }
                    ],
                    temperature: 0.7,
                }),
            });

            if (!response.ok) {
                throw new Error('OpenAI API error');
            }

            const data = await response.json();
            const seoText = data.choices[0].message.content;
            return JSON.parse(seoText);
        } catch (error) {
            console.error('AI SEO Error:', error);
            throw error;
        }
    };

    // User Profile
    const updateUserPassword = (currentPassword, newPassword) => {
        // Simple password update (demo - in real app use proper auth)
        if (currentPassword === 'admin123' || user?.password === currentPassword) {
            saveUser({ ...user, password: newPassword });
            return { success: true };
        }
        return { success: false, error: 'বর্তমান পাসওয়ার্ড ভুল' };
    };

    return (
        <DataContext.Provider value={{
            articles,
            categories,
            mediaLibrary,
            settings,
            theme,
            user,
            toggleTheme,
            generateSlug,
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
            generateSEOWithAI,
            generateSlugWithAI,
            updateUserPassword,
            saveUser,
            users,
            addUser,
            updateUser,
            deleteUser,
            getUserById,
            authenticateUser,
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
