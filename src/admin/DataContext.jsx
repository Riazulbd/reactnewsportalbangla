import { createContext, useContext, useState, useEffect } from 'react';
import { articles as initialArticles, categories as initialCategories } from '../data/articles';

const DataContext = createContext();

export function DataProvider({ children }) {
    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        // Load from localStorage or use initial data
        const storedArticles = localStorage.getItem('newsArticles');
        const storedCategories = localStorage.getItem('newsCategories');
        const storedTheme = localStorage.getItem('newsTheme');

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
        // Get articles from this category and all subcategories
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

    const searchArticles = (query) => {
        const lowerQuery = query.toLowerCase();
        return articles.filter(a =>
            a.title.toLowerCase().includes(lowerQuery) ||
            a.excerpt.toLowerCase().includes(lowerQuery)
        );
    };

    // Category CRUD with subcategory support
    const addCategory = (category) => {
        const newCategory = {
            ...category,
            id: category.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
            parentId: category.parentId || null,
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
        // Also delete subcategories
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

    // Get main categories (no parent)
    const getMainCategories = () => categories.filter(c => !c.parentId);

    // Get subcategories of a category
    const getSubcategories = (parentId) => categories.filter(c => c.parentId === parentId);

    return (
        <DataContext.Provider value={{
            articles,
            categories,
            theme,
            toggleTheme,
            addArticle,
            updateArticle,
            deleteArticle,
            getArticleById,
            getArticlesByCategory,
            getFeaturedArticles,
            searchArticles,
            addCategory,
            updateCategory,
            deleteCategory,
            getMainCategories,
            getSubcategories,
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
