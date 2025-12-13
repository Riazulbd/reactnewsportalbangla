import { createContext, useContext, useState, useEffect } from 'react';
import { articles as initialArticles, categories as initialCategories } from '../data/articles';

const DataContext = createContext();

export function DataProvider({ children }) {
    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [mediaLibrary, setMediaLibrary] = useState([]);
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

    // Theme toggle
    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('newsTheme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    // Generate slug from title
    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
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
            updateUserPassword,
            saveUser,
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
