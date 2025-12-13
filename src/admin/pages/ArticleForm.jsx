import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../DataContext';
import '../admin.css';

function ArticleForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { articles, categories, mediaLibrary, addArticle, updateArticle, searchMedia } = useData();
    const isEditing = Boolean(id);
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [mediaSearch, setMediaSearch] = useState('');
    const [activeTab, setActiveTab] = useState('content');

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
        tags: [],
        seo: {
            metaTitle: '',
            metaDescription: '',
            keywords: '',
            canonical: '',
            googleNewsKeywords: '',
        },
    });

    const [tagInput, setTagInput] = useState('');

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
                    tags: article.tags || [],
                    seo: article.seo || {
                        metaTitle: '',
                        metaDescription: '',
                        keywords: '',
                        canonical: '',
                        googleNewsKeywords: '',
                    },
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

    const handleSeoChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            seo: { ...prev.seo, [name]: value },
        }));
    };

    const handleAddTag = (e) => {
        e.preventDefault();
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()],
            }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove),
        }));
    };

    const handleSelectImage = (imageUrl) => {
        setFormData(prev => ({ ...prev, image: imageUrl }));
        setShowMediaModal(false);
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

    const filteredMedia = mediaSearch ? searchMedia(mediaSearch) : mediaLibrary;

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

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
                <button
                    className={`admin-btn ${activeTab === 'content' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                    onClick={() => setActiveTab('content')}
                >
                    📝 বিষয়বস্তু
                </button>
                <button
                    className={`admin-btn ${activeTab === 'seo' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                    onClick={() => setActiveTab('seo')}
                >
                    🔍 SEO
                </button>
            </div>

            <div className="admin-table-container" style={{ padding: 'var(--space-xl)' }}>
                <form onSubmit={handleSubmit} className="admin-form">

                    {activeTab === 'content' && (
                        <>
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

                            {/* Featured Image with Media Library */}
                            <div className="admin-form-group">
                                <label className="admin-form-label">ফিচার ছবি *</label>
                                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                                    <input
                                        type="url"
                                        name="image"
                                        className="admin-form-input"
                                        placeholder="https://example.com/image.jpg"
                                        value={formData.image}
                                        onChange={handleChange}
                                        required
                                        style={{ flex: 1 }}
                                    />
                                    <button
                                        type="button"
                                        className="admin-btn admin-btn-secondary"
                                        onClick={() => setShowMediaModal(true)}
                                    >
                                        📁 লাইব্রেরি
                                    </button>
                                </div>
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
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                            onLoad={(e) => { e.target.style.display = 'block'; }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Tags */}
                            <div className="admin-form-group">
                                <label className="admin-form-label">ট্যাগসমূহ</label>
                                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                                    <input
                                        type="text"
                                        className="admin-form-input"
                                        placeholder="ট্যাগ লিখুন"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
                                        style={{ flex: 1 }}
                                    />
                                    <button
                                        type="button"
                                        className="admin-btn admin-btn-secondary"
                                        onClick={handleAddTag}
                                    >
                                        যোগ করুন
                                    </button>
                                </div>
                                {formData.tags.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
                                        {formData.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                style={{
                                                    padding: 'var(--space-xs) var(--space-md)',
                                                    background: 'var(--color-accent-secondary)',
                                                    color: 'white',
                                                    borderRadius: 'var(--radius-full)',
                                                    fontSize: 'var(--text-sm)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 'var(--space-xs)',
                                                }}
                                            >
                                                #{tag}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTag(tag)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: 'white',
                                                        cursor: 'pointer',
                                                        padding: 0,
                                                        fontSize: 'var(--text-xs)',
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            </span>
                                        ))}
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
                        </>
                    )}

                    {activeTab === 'seo' && (
                        <>
                            <div style={{
                                padding: 'var(--space-md)',
                                background: 'rgba(124, 58, 237, 0.1)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: 'var(--space-lg)',
                                border: '1px solid rgba(124, 58, 237, 0.3)',
                            }}>
                                <strong>💡 SEO টিপস:</strong> সার্চ ইঞ্জিনে ভালো র‍্যাংকিং এর জন্য সঠিকভাবে SEO ফিল্ড পূরণ করুন।
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">মেটা শিরোনাম (Meta Title)</label>
                                <input
                                    type="text"
                                    name="metaTitle"
                                    className="admin-form-input"
                                    placeholder="SEO এর জন্য শিরোনাম (৬০ অক্ষরের মধ্যে)"
                                    value={formData.seo.metaTitle}
                                    onChange={handleSeoChange}
                                    maxLength={60}
                                />
                                <small style={{ color: 'var(--color-text-muted)' }}>
                                    {formData.seo.metaTitle.length}/60 অক্ষর
                                </small>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">মেটা বিবরণ (Meta Description)</label>
                                <textarea
                                    name="metaDescription"
                                    className="admin-form-textarea"
                                    placeholder="SEO এর জন্য সংক্ষিপ্ত বিবরণ (১৬০ অক্ষরের মধ্যে)"
                                    value={formData.seo.metaDescription}
                                    onChange={handleSeoChange}
                                    style={{ minHeight: '80px' }}
                                    maxLength={160}
                                />
                                <small style={{ color: 'var(--color-text-muted)' }}>
                                    {formData.seo.metaDescription.length}/160 অক্ষর
                                </small>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">কীওয়ার্ডস (Keywords)</label>
                                <input
                                    type="text"
                                    name="keywords"
                                    className="admin-form-input"
                                    placeholder="কমা দিয়ে আলাদা কীওয়ার্ড লিখুন"
                                    value={formData.seo.keywords}
                                    onChange={handleSeoChange}
                                />
                            </div>

                            <div style={{
                                padding: 'var(--space-md)',
                                background: 'rgba(220, 38, 38, 0.1)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: 'var(--space-lg)',
                                border: '1px solid rgba(220, 38, 38, 0.3)',
                            }}>
                                <strong>📰 Google News SEO</strong>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">Google News কীওয়ার্ডস</label>
                                <input
                                    type="text"
                                    name="googleNewsKeywords"
                                    className="admin-form-input"
                                    placeholder="Google News এর জন্য কীওয়ার্ড (কমা দিয়ে আলাদা)"
                                    value={formData.seo.googleNewsKeywords}
                                    onChange={handleSeoChange}
                                />
                                <small style={{ color: 'var(--color-text-muted)' }}>
                                    Google News এ দৃশ্যমানতার জন্য সংবাদ সম্পর্কিত কীওয়ার্ড ব্যবহার করুন
                                </small>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">Canonical URL</label>
                                <input
                                    type="url"
                                    name="canonical"
                                    className="admin-form-input"
                                    placeholder="https://example.com/original-article"
                                    value={formData.seo.canonical}
                                    onChange={handleSeoChange}
                                />
                                <small style={{ color: 'var(--color-text-muted)' }}>
                                    যদি এই কন্টেন্ট অন্য কোথাও প্রথম প্রকাশিত হয়ে থাকে
                                </small>
                            </div>
                        </>
                    )}

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

            {/* Media Library Modal */}
            {showMediaModal && (
                <div className="admin-modal-overlay" onClick={() => setShowMediaModal(false)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title">মিডিয়া লাইব্রেরি</h3>
                            <button className="admin-modal-close" onClick={() => setShowMediaModal(false)}>
                                ✕
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            <div style={{ marginBottom: 'var(--space-lg)' }}>
                                <input
                                    type="text"
                                    className="admin-form-input"
                                    placeholder="ছবি খুঁজুন..."
                                    value={mediaSearch}
                                    onChange={(e) => setMediaSearch(e.target.value)}
                                />
                            </div>

                            {filteredMedia.length > 0 ? (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(4, 1fr)',
                                    gap: 'var(--space-md)',
                                    maxHeight: '400px',
                                    overflowY: 'auto',
                                }}>
                                    {filteredMedia.map((media) => (
                                        <div
                                            key={media.id}
                                            style={{
                                                cursor: 'pointer',
                                                borderRadius: 'var(--radius-md)',
                                                overflow: 'hidden',
                                                border: '2px solid transparent',
                                                transition: 'all var(--transition-fast)',
                                            }}
                                            onClick={() => handleSelectImage(media.url)}
                                            onMouseEnter={(e) => e.target.style.borderColor = 'var(--color-accent-primary)'}
                                            onMouseLeave={(e) => e.target.style.borderColor = 'transparent'}
                                        >
                                            <img
                                                src={media.url}
                                                alt={media.alt || media.name}
                                                style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--color-text-muted)' }}>
                                    <p>কোনো ছবি পাওয়া যায়নি।</p>
                                    <Link to="/admin/media" className="admin-btn admin-btn-primary" style={{ marginTop: 'var(--space-md)' }}>
                                        📤 ছবি আপলোড করুন
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ArticleForm;
