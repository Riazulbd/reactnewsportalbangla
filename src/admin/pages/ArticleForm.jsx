import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../DataContext';
import '../admin.css';

function ArticleForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { articles, categories, addArticle, updateArticle } = useData();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        category: '',
        author: '',
        authorAvatar: 'https://i.pravatar.cc/150?img=1',
        image: '',
        readTime: '৫ মিনিট',
        featured: false,
    });

    useEffect(() => {
        if (isEditing) {
            const article = articles.find(a => a.id === parseInt(id));
            if (article) {
                setFormData({
                    title: article.title,
                    excerpt: article.excerpt,
                    content: article.content,
                    category: article.category,
                    author: article.author,
                    authorAvatar: article.authorAvatar,
                    image: article.image,
                    readTime: article.readTime,
                    featured: article.featured,
                });
            }
        }
    }, [id, isEditing, articles]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditing) {
            updateArticle(parseInt(id), formData);
        } else {
            addArticle(formData);
        }

        navigate('/admin/articles');
    };

    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1 className="admin-page-title">
                        {isEditing ? 'প্রবন্ধ সম্পাদনা' : 'নতুন প্রবন্ধ'}
                    </h1>
                    <p className="admin-breadcrumb">
                        অ্যাডমিন / প্রবন্ধ / {isEditing ? 'সম্পাদনা' : 'নতুন'}
                    </p>
                </div>
                <Link to="/admin/articles" className="admin-btn admin-btn-secondary">
                    ← ফিরে যান
                </Link>
            </div>

            <div className="admin-table-container" style={{ padding: 'var(--space-xl)' }}>
                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="admin-form-group">
                        <label className="admin-form-label">শিরোনাম *</label>
                        <input
                            type="text"
                            name="title"
                            className="admin-form-input"
                            placeholder="প্রবন্ধের শিরোনাম লিখুন"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="admin-form-group">
                        <label className="admin-form-label">সংক্ষেপ *</label>
                        <textarea
                            name="excerpt"
                            className="admin-form-textarea"
                            placeholder="প্রবন্ধের সংক্ষিপ্ত বিবরণ"
                            value={formData.excerpt}
                            onChange={handleChange}
                            style={{ minHeight: '80px' }}
                            required
                        />
                    </div>

                    <div className="admin-form-group">
                        <label className="admin-form-label">বিস্তারিত *</label>
                        <textarea
                            name="content"
                            className="admin-form-textarea"
                            placeholder="প্রবন্ধের পূর্ণ বিষয়বস্তু লিখুন..."
                            value={formData.content}
                            onChange={handleChange}
                            style={{ minHeight: '250px' }}
                            required
                        />
                    </div>

                    <div className="admin-form-row">
                        <div className="admin-form-group">
                            <label className="admin-form-label">বিভাগ *</label>
                            <select
                                name="category"
                                className="admin-form-select"
                                value={formData.category}
                                onChange={handleChange}
                                required
                            >
                                <option value="">বিভাগ নির্বাচন করুন</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.parentId ? '↳ ' : ''}{cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">লেখক *</label>
                            <input
                                type="text"
                                name="author"
                                className="admin-form-input"
                                placeholder="লেখকের নাম"
                                value={formData.author}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="admin-form-group">
                        <label className="admin-form-label">ফিচার ছবির URL *</label>
                        <input
                            type="url"
                            name="image"
                            className="admin-form-input"
                            placeholder="https://example.com/image.jpg"
                            value={formData.image}
                            onChange={handleChange}
                            required
                        />
                        {/* Image Preview */}
                        {formData.image && (
                            <div style={{ marginTop: 'var(--space-md)' }}>
                                <img
                                    src={formData.image}
                                    alt="Preview"
                                    style={{
                                        maxWidth: '300px',
                                        maxHeight: '200px',
                                        borderRadius: 'var(--radius-md)',
                                        objectFit: 'cover',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                    onLoad={(e) => {
                                        e.target.style.display = 'block';
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="admin-form-row">
                        <div className="admin-form-group">
                            <label className="admin-form-label">পড়ার সময়</label>
                            <input
                                type="text"
                                name="readTime"
                                className="admin-form-input"
                                placeholder="৫ মিনিট"
                                value={formData.readTime}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">লেখকের ছবি URL</label>
                            <input
                                type="url"
                                name="authorAvatar"
                                className="admin-form-input"
                                placeholder="https://example.com/avatar.jpg"
                                value={formData.authorAvatar}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="admin-form-group">
                        <label className="admin-form-checkbox">
                            <input
                                type="checkbox"
                                name="featured"
                                checked={formData.featured}
                                onChange={handleChange}
                            />
                            <span>ফিচার্ড প্রবন্ধ হিসেবে প্রদর্শন করুন</span>
                        </label>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
                        <button type="submit" className="admin-btn admin-btn-primary">
                            {isEditing ? '💾 আপডেট করুন' : '➕ প্রবন্ধ যোগ করুন'}
                        </button>
                        <Link to="/admin/articles" className="admin-btn admin-btn-secondary">
                            বাতিল
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ArticleForm;
