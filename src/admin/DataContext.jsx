import { createContext, useContext, useState, useEffect } from 'react';
import { articles as initialArticles, categories as initialCategories } from '../data/articles';

const DataContext = createContext();

export function DataProvider({ children }) {
    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [mediaLibrary, setMediaLibrary] = useState([]);
    const [settings, setSettings] = useState({
        heroArticleId: null,
        categoryOrder: [],
    });
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        // Load from localStorage or use initial data
        const storedArticles = localStorage.getItem('newsArticles');
        const storedCategories = localStorage.getItem('newsCategories');
        const storedTheme = localStorage.getItem('newsTheme');
        const storedMedia = localStorage.getItem('newsMediaLibrary');
        const storedSettings = localStorage.getItem('newsSettings');

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
            setSettings(JSON.parse(storedSettings));
        }
    }, []);

    // Save to localStorage when data changes
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
        setSettings(newSettings);
        localStorage.setItem('newsSettings', JSON.stringify(newSettings));
    };

    // Theme toggle
    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('newsTheme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    // Article CRUD
    const addArticle = (article) => {
        const newArticle = {
            ...article,
            id: Math.max(...articles.map(a => a.id), 0) + 1,
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

    const getFeaturedArticles = () => articles.filter(a => a.featured);

    const getHeroArticle = () => {
        if (settings.heroArticleId) {
            return articles.find(a => a.id === settings.heroArticleId);
        }
        return getFeaturedArticles()[0] || articles[0];
    };

    const setHeroArticle = (articleId) => {
        saveSettings({ ...settings, heroArticleId: articleId });
    };

    const searchArticles = (query) => {
        const lowerQuery = query.toLowerCase();
        return articles.filter(a =>
            a.title.toLowerCase().includes(lowerQuery) ||
            a.excerpt.toLowerCase().includes(lowerQuery) ||
            (a.tags && a.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
        );
    };

    // Category CRUD with ordering
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
        // Sort by order if available
        return mainCats.sort((a, b) => (a.order || 0) - (b.order || 0));
    };

    const getSubcategories = (parentId) => categories.filter(c => c.parentId === parentId);

    const reorderCategories = (orderedIds) => {
        const updated = categories.map(c => ({
            ...c,
            order: orderedIds.indexOf(c.id),
        }));
        saveCategories(updated);
    };

    // Media Library
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

    return (
        <DataContext.Provider value={{
            articles,
            categories,
            mediaLibrary,
            settings,
            theme,
            toggleTheme,
            addArticle,
            updateArticle,
            deleteArticle,
            getArticleById,
            getArticlesByCategory,
            getFeaturedArticles,
            getHeroArticle,
            setHeroArticle,
            searchArticles,
            addCategory,
            updateCategory,
            deleteCategory,
            getMainCategories,
            getSubcategories,
            reorderCategories,
            addMedia,
            deleteMedia,
            searchMedia,
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
