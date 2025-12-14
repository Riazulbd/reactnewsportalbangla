import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useData } from '../DataContext';
import '../admin.css';

// SEO Score Gauge Component
function SEOGauge({ score }) {
    const getColor = () => {
        if (score >= 80) return '#22c55e';
        if (score >= 60) return '#f59e0b';
        if (score >= 40) return '#f97316';
        return '#ef4444';
    };

    const getLabel = () => {
        if (score >= 80) return 'চমৎকার';
        if (score >= 60) return 'ভালো';
        if (score >= 40) return 'মধ্যম';
        return 'দুর্বল';
    };

    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div style={{ textAlign: 'center' }}>
            <svg width="120" height="120" viewBox="0 0 120 120">
                <circle
                    cx="60" cy="60" r="45"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="10"
                />
                <circle
                    cx="60" cy="60" r="45"
                    fill="none"
                    stroke={getColor()}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
                <text x="60" y="55" textAnchor="middle" fill={getColor()} fontSize="24" fontWeight="bold">
                    {score}
                </text>
                <text x="60" y="75" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="12">
                    {getLabel()}
                </text>
            </svg>
        </div>
    );
}

function ArticleForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const {
        articles, categories, mediaLibrary, settings,
        addArticle, updateArticle, searchMedia, addMedia,
        generateSlug, generateSlugWithAI, generateSEOWithAI
    } = useData();
    const isEditing = Boolean(id);
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [mediaSearch, setMediaSearch] = useState('');
    const [activeTab, setActiveTab] = useState('content');
    const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);
    const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);
    const [seoError, setSeoError] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
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

    // Quill editor modules
    const quillModules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'align': [] }],
            ['blockquote', 'code-block'],
            ['link', 'image', 'video'],
            ['clean']
        ],
        clipboard: {
            matchVisual: false,
        }
    }), []);

    const quillFormats = [
        'header', 'bold', 'italic', 'underline', 'strike',
        'color', 'background', 'list', 'bullet', 'align',
        'blockquote', 'code-block', 'link', 'image', 'video'
    ];

    // Calculate SEO Score
    const seoScore = useMemo(() => {
        let score = 0;
        const seo = formData.seo;

        // Title checks (20 points)
        if (formData.title) {
            score += 5;
            if (formData.title.length >= 30 && formData.title.length <= 70) score += 10;
            if (formData.title.length > 10) score += 5;
        }

        // Meta Title (15 points)
        if (seo.metaTitle) {
            score += 5;
            if (seo.metaTitle.length >= 30 && seo.metaTitle.length <= 60) score += 10;
        }

        // Meta Description (20 points)
        if (seo.metaDescription) {
            score += 5;
            if (seo.metaDescription.length >= 120 && seo.metaDescription.length <= 160) score += 15;
            else if (seo.metaDescription.length >= 80) score += 10;
        }

        // Keywords (15 points)
        if (seo.keywords) {
            score += 10;
            const keywordCount = seo.keywords.split(',').filter(k => k.trim()).length;
            if (keywordCount >= 3 && keywordCount <= 8) score += 5;
        }

        // Google News Keywords (10 points)
        if (seo.googleNewsKeywords) score += 10;

        // Slug (10 points)
        if (formData.slug) {
            score += 5;
            if (/^[a-z0-9-]+$/.test(formData.slug)) score += 5;
        }

        // Featured Image (10 points)
        if (formData.image) score += 10;

        return Math.min(score, 100);
    }, [formData]);

    useEffect(() => {
        if (isEditing) {
            const article = articles.find(a => a.id === parseInt(id));
            if (article) {
                setFormData({
                    title: article.title,
                    slug: article.slug || '',
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

    // Generate AI slug when title changes (for new articles)
    const handleGenerateSlug = async () => {
        if (!formData.title) return;

        setIsGeneratingSlug(true);
        try {
            if (settings.openaiApiKey && generateSlugWithAI) {
                const slug = await generateSlugWithAI(formData.title);
                setFormData(prev => ({ ...prev, slug }));
            } else {
                setFormData(prev => ({ ...prev, slug: generateSlug(formData.title) }));
            }
        } catch (error) {
            console.error('Slug generation error:', error);
            setFormData(prev => ({ ...prev, slug: generateSlug(formData.title) }));
        } finally {
            setIsGeneratingSlug(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleContentChange = (content) => {
        setFormData(prev => ({ ...prev, content }));
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

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result;
                addMedia({
                    url: base64,
                    name: file.name,
                    alt: file.name.split('.')[0],
                    type: file.type,
                    size: file.size,
                });
                setFormData(prev => ({ ...prev, image: base64 }));
                setUploadingImage(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Upload error:', error);
            setUploadingImage(false);
        }
    };

    const handleGenerateSEO = async () => {
        if (!settings.openaiApiKey) {
            setSeoError('সেটিংসে OpenAI API কী যোগ করুন');
            return;
        }

        // Strip HTML from content for SEO analysis
        const plainContent = formData.content.replace(/<[^>]*>/g, '');

        if (!plainContent || !formData.title) {
            setSeoError('SEO জেনারেট করতে শিরোনাম ও বিষয়বস্তু প্রয়োজন');
            return;
        }

        setIsGeneratingSEO(true);
        setSeoError('');

        try {
            const seoData = await generateSEOWithAI(plainContent, formData.title);
            setFormData(prev => ({
                ...prev,
                seo: { ...prev.seo, ...seoData },
            }));
        } catch (error) {
            setSeoError('SEO জেনারেট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
        } finally {
            setIsGeneratingSEO(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Strip HTML for excerpt if it contains HTML
        const plainContent = formData.content.replace(/<[^>]*>/g, '');
        const articleData = {
            ...formData,
            excerpt: formData.excerpt || plainContent.substring(0, 200) + '...',
        };

        if (isEditing) {
            updateArticle(parseInt(id), articleData);
        } else {
            addArticle(articleData);
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

                            {/* Slug with AI Generate */}
                            <div className="admin-form-group">
                                <label className="admin-form-label">স্লাগ (URL) - SEO Friendly</label>
                                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                                    <input
                                        type="text"
                                        name="slug"
                                        className="admin-form-input"
                                        placeholder="seo-friendly-english-slug"
                                        value={formData.slug}
                                        onChange={handleChange}
                                        style={{ flex: 1, fontFamily: 'monospace' }}
                                    />
                                    <button
                                        type="button"
                                        className="admin-btn admin-btn-primary"
                                        onClick={handleGenerateSlug}
                                        disabled={isGeneratingSlug || !formData.title}
                                    >
                                        {isGeneratingSlug ? '⏳' : '🤖'} AI স্লাগ
                                    </button>
                                </div>
                                <small style={{ color: 'var(--color-text-muted)' }}>
                                    {settings.openaiApiKey
                                        ? '✓ AI বাংলা শিরোনাম থেকে ইংরেজি SEO স্লাগ তৈরি করবে'
                                        : '⚠️ AI স্লাগের জন্য সেটিংসে OpenAI কী যোগ করুন'}
                                </small>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">সংক্ষেপ</label>
                                <textarea
                                    name="excerpt"
                                    className="admin-form-textarea"
                                    placeholder="প্রবন্ধের সংক্ষিপ্ত বিবরণ (খালি রাখলে স্বয়ংক্রিয়)"
                                    value={formData.excerpt}
                                    onChange={handleChange}
                                    style={{ minHeight: '80px' }}
                                />
                            </div>

                            {/* Rich Text Editor */}
                            <div className="admin-form-group">
                                <label className="admin-form-label">বিস্তারিত *</label>
                                <div style={{
                                    background: 'var(--color-bg-primary)',
                                    borderRadius: 'var(--radius-md)',
                                    overflow: 'hidden',
                                }}>
                                    <ReactQuill
                                        theme="snow"
                                        value={formData.content}
                                        onChange={handleContentChange}
                                        modules={quillModules}
                                        formats={quillFormats}
                                        placeholder="প্রবন্ধের পূর্ণ বিষয়বস্তু লিখুন... (বোল্ড, ইটালিক, ছবি, ভিডিও যোগ করতে পারবেন)"
                                        style={{ minHeight: '300px' }}
                                    />
                                </div>
                                <small style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-sm)', display: 'block' }}>
                                    💡 টিপ: অন্য ওয়েবসাইট থেকে কপি-পেস্ট করলে ছবি ও ফরম্যাটিং অটো আসবে
                                </small>
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

                            {/* Featured Image */}
                            <div className="admin-form-group">
                                <label className="admin-form-label">ফিচার ছবি *</label>
                                <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        style={{ display: 'none' }}
                                    />
                                    <button
                                        type="button"
                                        className="admin-btn admin-btn-primary"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingImage}
                                    >
                                        {uploadingImage ? '⏳ আপলোড হচ্ছে...' : '📤 ছবি আপলোড'}
                                    </button>
                                    <button
                                        type="button"
                                        className="admin-btn admin-btn-secondary"
                                        onClick={() => setShowMediaModal(true)}
                                    >
                                        📁 লাইব্রেরি থেকে
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    name="image"
                                    className="admin-form-input"
                                    placeholder="অথবা URL পেস্ট করুন"
                                    value={formData.image?.startsWith('data:') ? 'আপলোড করা ছবি' : formData.image}
                                    onChange={handleChange}
                                    style={{ marginTop: 'var(--space-sm)' }}
                                    disabled={formData.image?.startsWith('data:')}
                                />
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
                            {/* SEO Score Gauge */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-xl)',
                                padding: 'var(--space-lg)',
                                background: 'var(--color-bg-tertiary)',
                                borderRadius: 'var(--radius-lg)',
                                marginBottom: 'var(--space-xl)',
                            }}>
                                <SEOGauge score={seoScore} />
                                <div>
                                    <h3 style={{ marginBottom: 'var(--space-sm)' }}>SEO স্কোর</h3>
                                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                                        {seoScore < 40 && '⚠️ SEO উন্নত করুন - মেটা ফিল্ড পূরণ করুন'}
                                        {seoScore >= 40 && seoScore < 60 && '📊 SEO মধ্যম - আরও উন্নতি সম্ভব'}
                                        {seoScore >= 60 && seoScore < 80 && '👍 SEO ভালো - কিছু উন্নতি বাকি'}
                                        {seoScore >= 80 && '✅ SEO চমৎকার! গুগলে ভালো র‍্যাংক পাবে'}
                                    </p>
                                </div>
                            </div>

                            {/* AI Generate Button */}
                            <div style={{
                                padding: 'var(--space-lg)',
                                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(236, 72, 153, 0.2))',
                                borderRadius: 'var(--radius-lg)',
                                marginBottom: 'var(--space-xl)',
                                border: '1px solid rgba(124, 58, 237, 0.3)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                                    <div>
                                        <strong style={{ color: 'var(--color-text-primary)' }}>🤖 AI দিয়ে SEO অটো-জেনারেট</strong>
                                        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-xs)' }}>
                                            ChatGPT বিষয়বস্তু বিশ্লেষণ করে SEO ফিল্ড পূরণ করবে
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        className="admin-btn admin-btn-primary"
                                        onClick={handleGenerateSEO}
                                        disabled={isGeneratingSEO || !settings.openaiApiKey}
                                    >
                                        {isGeneratingSEO ? '⏳ জেনারেট হচ্ছে...' : '✨ AI দিয়ে জেনারেট'}
                                    </button>
                                </div>
                                {seoError && (
                                    <p style={{ color: '#ef4444', marginTop: 'var(--space-sm)', fontSize: 'var(--text-sm)' }}>
                                        ⚠️ {seoError}
                                    </p>
                                )}
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">মেটা শিরোনাম (Meta Title)</label>
                                <input
                                    type="text"
                                    name="metaTitle"
                                    className="admin-form-input"
                                    placeholder="SEO এর জন্য শিরোনাম (৩০-৬০ অক্ষর আদর্শ)"
                                    value={formData.seo.metaTitle}
                                    onChange={handleSeoChange}
                                    maxLength={60}
                                />
                                <small style={{ color: formData.seo.metaTitle.length >= 30 && formData.seo.metaTitle.length <= 60 ? '#22c55e' : 'var(--color-text-muted)' }}>
                                    {formData.seo.metaTitle.length}/60 অক্ষর {formData.seo.metaTitle.length >= 30 && formData.seo.metaTitle.length <= 60 && '✓'}
                                </small>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">মেটা বিবরণ (Meta Description)</label>
                                <textarea
                                    name="metaDescription"
                                    className="admin-form-textarea"
                                    placeholder="SEO এর জন্য সংক্ষিপ্ত বিবরণ (১২০-১৬০ অক্ষর আদর্শ)"
                                    value={formData.seo.metaDescription}
                                    onChange={handleSeoChange}
                                    style={{ minHeight: '80px' }}
                                    maxLength={160}
                                />
                                <small style={{ color: formData.seo.metaDescription.length >= 120 && formData.seo.metaDescription.length <= 160 ? '#22c55e' : 'var(--color-text-muted)' }}>
                                    {formData.seo.metaDescription.length}/160 অক্ষর {formData.seo.metaDescription.length >= 120 && '✓'}
                                </small>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">কীওয়ার্ডস (Keywords)</label>
                                <input
                                    type="text"
                                    name="keywords"
                                    className="admin-form-input"
                                    placeholder="কমা দিয়ে আলাদা কীওয়ার্ড (৩-৮টি আদর্শ)"
                                    value={formData.seo.keywords}
                                    onChange={handleSeoChange}
                                />
                            </div>

                            <div style={{
                                padding: 'var(--space-md)',
                                background: 'rgba(220, 38, 38, 0.1)',
                                borderRadius: 'var(--radius-md)',
                                marginTop: 'var(--space-xl)',
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
                                    placeholder="Google News এর জন্য কীওয়ার্ড"
                                    value={formData.seo.googleNewsKeywords}
                                    onChange={handleSeoChange}
                                />
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
                                            }}
                                            onClick={() => handleSelectImage(media.url)}
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
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .ql-container {
                    min-height: 250px;
                    font-size: 16px;
                    font-family: inherit;
                }
                .ql-editor {
                    min-height: 250px;
                }
                .ql-toolbar {
                    background: var(--color-bg-secondary);
                    border-color: rgba(255,255,255,0.1) !important;
                    border-radius: var(--radius-md) var(--radius-md) 0 0;
                }
                .ql-container {
                    border-color: rgba(255,255,255,0.1) !important;
                    border-radius: 0 0 var(--radius-md) var(--radius-md);
                    background: var(--color-bg-secondary);
                    color: var(--color-text-primary);
                }
                .ql-editor.ql-blank::before {
                    color: var(--color-text-muted);
                    font-style: normal;
                }
                .ql-snow .ql-stroke {
                    stroke: var(--color-text-secondary);
                }
                .ql-snow .ql-fill {
                    fill: var(--color-text-secondary);
                }
                .ql-snow .ql-picker {
                    color: var(--color-text-secondary);
                }
                .ql-snow .ql-picker-options {
                    background: var(--color-bg-tertiary);
                }
            `}</style>
        </div>
    );
}

export default ArticleForm;
