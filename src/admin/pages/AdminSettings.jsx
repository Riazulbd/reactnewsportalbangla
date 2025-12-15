import { useState, useRef } from 'react';
import { useData } from '../DataContext';
import DatabaseSettings from './DatabaseSettings';
import '../admin.css';

function AdminSettings() {
    const {
        articles,
        categories,
        settings,
        saveSettings,
        getMainCategories,
        reorderCategories,
        getFeaturedArticles,
        setFeaturedArticles,
        generateWebhookApiKey,
    } = useData();

    const [draggedCategory, setDraggedCategory] = useState(null);
    const [showFeaturedModal, setShowFeaturedModal] = useState(false);
    const [selectedFeatured, setSelectedFeatured] = useState([]);
    const mainCategories = getMainCategories();
    const featuredArticles = getFeaturedArticles();
    const [successMessage, setSuccessMessage] = useState('');
    const [openaiKey, setOpenaiKey] = useState(settings.openaiApiKey || '');
    const [openaiModel, setOpenaiModel] = useState(settings.openaiModel || 'gpt-3.5-turbo');
    const logoInputRef = useRef(null);

    const showSuccess = (msg) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleSaveOpenAI = () => {
        saveSettings({
            openaiApiKey: openaiKey,
            openaiModel: openaiModel
        });
        showSuccess('OpenAI সেটিংস সংরক্ষণ হয়েছে!');
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            saveSettings({ siteLogo: reader.result });
            showSuccess('লোগো আপলোড হয়েছে!');
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveLogo = () => {
        saveSettings({ siteLogo: '' });
        showSuccess('লোগো সরানো হয়েছে!');
    };

    const handleDragStart = (e, category) => {
        setDraggedCategory(category);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, targetCategory) => {
        e.preventDefault();
        if (draggedCategory && draggedCategory.id !== targetCategory.id) {
            const currentOrder = mainCategories.map(c => c.id);
            const draggedIndex = currentOrder.indexOf(draggedCategory.id);
            const targetIndex = currentOrder.indexOf(targetCategory.id);

            currentOrder.splice(draggedIndex, 1);
            currentOrder.splice(targetIndex, 0, draggedCategory.id);

            reorderCategories(currentOrder);
            showSuccess('বিভাগের ক্রম আপডেট হয়েছে!');
        }
        setDraggedCategory(null);
    };

    const openFeaturedModal = () => {
        setSelectedFeatured(settings.featuredArticleIds || featuredArticles.map(a => a.id));
        setShowFeaturedModal(true);
    };

    const toggleFeaturedArticle = (articleId) => {
        setSelectedFeatured(prev => {
            if (prev.includes(articleId)) {
                return prev.filter(id => id !== articleId);
            } else if (prev.length < 5) {
                return [...prev, articleId];
            }
            return prev;
        });
    };

    const saveFeaturedArticles = () => {
        setFeaturedArticles(selectedFeatured);
        setShowFeaturedModal(false);
        showSuccess('ফিচার্ড স্লাইডার আপডেট হয়েছে!');
    };

    const modelOptions = [
        { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (দ্রুত, সাশ্রয়ী)' },
        { value: 'gpt-4', label: 'GPT-4 (উন্নত, ধীর)' },
        { value: 'gpt-4-turbo', label: 'GPT-4 Turbo (দ্রুত GPT-4)' },
        { value: 'gpt-4o', label: 'GPT-4o (সর্বশেষ)' },
    ];

    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1 className="admin-page-title">সেটিংস</h1>
                    <p className="admin-breadcrumb">অ্যাডমিন / সেটিংস</p>
                </div>
            </div>

            {successMessage && (
                <div style={{
                    padding: 'var(--space-md)',
                    background: 'rgba(34, 197, 94, 0.2)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--space-lg)',
                    border: '1px solid rgba(34, 197, 94, 0.5)',
                    color: '#22c55e',
                }}>
                    ✓ {successMessage}
                </div>
            )}

            {/* Database Configuration - First Priority */}
            <DatabaseSettings />

            {/* Site Logo */}
            <div className="admin-table-container" style={{ marginBottom: 'var(--space-xl)' }}>
                <div className="admin-table-header">
                    <h3 className="admin-table-title">🏷️ সাইট লোগো</h3>
                </div>
                <div style={{ padding: 'var(--space-lg)' }}>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)' }}>
                        হেডারে প্রদর্শিত হবে যে লোগো আপলোড করুন।
                    </p>

                    <input
                        type="file"
                        ref={logoInputRef}
                        accept="image/*"
                        onChange={handleLogoUpload}
                        style={{ display: 'none' }}
                    />

                    <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', flexWrap: 'wrap' }}>
                        {settings.siteLogo ? (
                            <div style={{
                                padding: 'var(--space-md)',
                                background: 'var(--color-bg-tertiary)',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-md)',
                            }}>
                                <img
                                    src={settings.siteLogo}
                                    alt="Logo"
                                    style={{ height: '40px', maxWidth: '200px', objectFit: 'contain' }}
                                />
                                <button
                                    className="admin-btn admin-btn-icon"
                                    onClick={handleRemoveLogo}
                                    style={{ color: '#ef4444' }}
                                >
                                    🗑️
                                </button>
                            </div>
                        ) : (
                            <p style={{ color: 'var(--color-text-muted)' }}>কোনো লোগো নেই</p>
                        )}
                        <button
                            className="admin-btn admin-btn-primary"
                            onClick={() => logoInputRef.current?.click()}
                        >
                            📤 লোগো আপলোড
                        </button>
                    </div>
                </div>
            </div>

            {/* OpenAI Settings */}
            <div className="admin-table-container" style={{ marginBottom: 'var(--space-xl)' }}>
                <div className="admin-table-header">
                    <h3 className="admin-table-title">🤖 OpenAI / ChatGPT সেটিংস</h3>
                </div>
                <div style={{ padding: 'var(--space-lg)' }}>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)' }}>
                        AI দিয়ে SEO অটো-জেনারেট করতে OpenAI API কী যোগ করুন।
                    </p>

                    <div className="admin-form-group">
                        <label className="admin-form-label">OpenAI API কী</label>
                        <input
                            type="password"
                            className="admin-form-input"
                            placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                            value={openaiKey}
                            onChange={(e) => setOpenaiKey(e.target.value)}
                        />
                        <small style={{ color: 'var(--color-text-muted)' }}>
                            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent-primary)' }}>
                                OpenAI থেকে API কী পান →
                            </a>
                        </small>
                    </div>

                    <div className="admin-form-group">
                        <label className="admin-form-label">মডেল নির্বাচন</label>
                        <select
                            className="admin-form-select"
                            value={openaiModel}
                            onChange={(e) => setOpenaiModel(e.target.value)}
                        >
                            {modelOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <button className="admin-btn admin-btn-primary" onClick={handleSaveOpenAI}>
                        💾 সংরক্ষণ করুন
                    </button>
                </div>
            </div>

            {/* Webhook API */}
            <div className="admin-table-container" style={{ marginBottom: 'var(--space-xl)' }}>
                <div className="admin-table-header">
                    <h3 className="admin-table-title">🔗 Webhook API</h3>
                </div>
                <div style={{ padding: 'var(--space-lg)' }}>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)' }}>
                        বাইরের সার্ভিস (n8n, Make, Zapier) থেকে প্রবন্ধ যোগ করতে API কী ব্যবহার করুন।
                    </p>

                    <div className="admin-form-group">
                        <label className="admin-form-label">API কী</label>
                        <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                            <input
                                type="text"
                                className="admin-form-input"
                                value={settings.webhookApiKey || ''}
                                readOnly
                                style={{
                                    fontFamily: 'monospace',
                                    flex: 1,
                                    background: 'var(--color-bg-tertiary)',
                                }}
                                placeholder="API কী জেনারেট করুন"
                            />
                            <button
                                className="admin-btn admin-btn-secondary"
                                onClick={() => {
                                    if (settings.webhookApiKey) {
                                        navigator.clipboard.writeText(settings.webhookApiKey);
                                        showSuccess('API কী কপি হয়েছে!');
                                    }
                                }}
                                disabled={!settings.webhookApiKey}
                                title="কপি করুন"
                            >
                                📋
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
                        <button
                            className="admin-btn admin-btn-primary"
                            onClick={() => {
                                generateWebhookApiKey();
                                showSuccess('নতুন API কী জেনারেট হয়েছে!');
                            }}
                        >
                            {settings.webhookApiKey ? '🔄 রিজেনারেট' : '✨ জেনারেট করুন'}
                        </button>
                    </div>

                    {/* API Documentation */}
                    <div style={{
                        background: 'var(--color-bg-tertiary)',
                        padding: 'var(--space-lg)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(255,255,255,0.1)',
                    }}>
                        <h4 style={{ marginBottom: 'var(--space-md)', color: 'var(--color-text-primary)' }}>📚 API ব্যবহার</h4>

                        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-md)' }}>
                            <strong>Endpoint:</strong> <code style={{ color: 'var(--color-accent-primary)' }}>{window.location.origin}/api/webhook/article</code>
                        </p>

                        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-md)' }}>
                            <strong>Method:</strong> POST
                        </p>

                        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-md)' }}>
                            <strong>Headers:</strong>
                        </p>
                        <pre style={{
                            background: 'var(--color-bg-primary)',
                            padding: 'var(--space-md)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: 'var(--text-xs)',
                            overflow: 'auto',
                            marginBottom: 'var(--space-md)',
                        }}>
                            {`Content-Type: application/json
X-API-Key: ${settings.webhookApiKey || 'YOUR_API_KEY'}`}
                        </pre>

                        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-md)' }}>
                            <strong>Body (JSON):</strong>
                        </p>
                        <pre style={{
                            background: 'var(--color-bg-primary)',
                            padding: 'var(--space-md)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: 'var(--text-xs)',
                            overflow: 'auto',
                        }}>
                            {`{
  "title": "প্রবন্ধের শিরোনাম",
  "content": "প্রবন্ধের বিস্তারিত...",
  "excerpt": "সংক্ষেপ",
  "category": "politics",
  "author": "লেখক নাম",
  "image": "https://example.com/image.jpg",
  "featured": false,
  "tags": ["ট্যাগ১", "ট্যাগ২"]
}`}
                        </pre>

                        <div style={{
                            marginTop: 'var(--space-md)',
                            padding: 'var(--space-md)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                        }}>
                            <p style={{ color: '#ef4444', fontSize: 'var(--text-sm)' }}>
                                ⚠️ <strong>সতর্কতা:</strong> API কী গোপন রাখুন। কেউ কী পেলে প্রবন্ধ যোগ করতে পারবে।
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Slider */}
            <div className="admin-table-container" style={{ marginBottom: 'var(--space-xl)' }}>
                <div className="admin-table-header">
                    <h3 className="admin-table-title">🌟 ফিচার্ড স্লাইডার (সর্বোচ্চ ৫টি)</h3>
                </div>
                <div style={{ padding: 'var(--space-lg)' }}>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)' }}>
                        হোমপেজের হিরো স্লাইডারে প্রদর্শিত হবে যে ৫টি প্রবন্ধ নির্বাচন করুন।
                    </p>

                    {featuredArticles.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
                            {featuredArticles.map((article, index) => (
                                <div
                                    key={article.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-md)',
                                        padding: 'var(--space-md)',
                                        background: 'var(--color-bg-tertiary)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                >
                                    <span style={{
                                        background: 'var(--gradient-primary)',
                                        color: 'white',
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: 'var(--radius-sm)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 'var(--text-sm)',
                                        fontWeight: 'bold',
                                    }}>
                                        {index + 1}
                                    </span>
                                    <img
                                        src={article.image}
                                        alt=""
                                        style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                                    />
                                    <span style={{ flex: 1, color: 'var(--color-text-primary)' }}>
                                        {article.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-lg)' }}>
                            কোনো ফিচার্ড প্রবন্ধ নির্বাচিত নেই
                        </p>
                    )}

                    <button className="admin-btn admin-btn-primary" onClick={openFeaturedModal}>
                        ✏️ ফিচার্ড নির্বাচন করুন
                    </button>
                </div>
            </div>

            {/* Category Order */}
            <div className="admin-table-container">
                <div className="admin-table-header">
                    <h3 className="admin-table-title">📁 বিভাগের ক্রম</h3>
                </div>
                <div style={{ padding: 'var(--space-lg)' }}>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)' }}>
                        ড্র্যাগ করে বিভাগের ক্রম পরিবর্তন করুন।
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                        {mainCategories.map((category, index) => (
                            <div
                                key={category.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, category)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, category)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-md)',
                                    padding: 'var(--space-md)',
                                    background: draggedCategory?.id === category.id
                                        ? 'rgba(124, 58, 237, 0.2)'
                                        : 'var(--color-bg-tertiary)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    cursor: 'grab',
                                }}
                            >
                                <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)' }}>⋮⋮</span>
                                <span style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: 'var(--radius-sm)',
                                    background: category.color,
                                }} />
                                <span style={{ color: 'var(--color-text-primary)', fontWeight: 500, flex: 1 }}>
                                    {category.name}
                                </span>
                                <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                                    #{index + 1}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Featured Selection Modal */}
            {showFeaturedModal && (
                <div className="admin-modal-overlay" onClick={() => setShowFeaturedModal(false)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title">ফিচার্ড প্রবন্ধ নির্বাচন ({selectedFeatured.length}/5)</h3>
                            <button className="admin-modal-close" onClick={() => setShowFeaturedModal(false)}>✕</button>
                        </div>
                        <div className="admin-modal-body" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)' }}>
                                সর্বোচ্চ ৫টি প্রবন্ধ নির্বাচন করুন। এগুলো হোমপেজের স্লাইডারে প্রদর্শিত হবে।
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                {articles.map((article) => (
                                    <div
                                        key={article.id}
                                        onClick={() => toggleFeaturedArticle(article.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--space-md)',
                                            padding: 'var(--space-md)',
                                            background: selectedFeatured.includes(article.id)
                                                ? 'rgba(124, 58, 237, 0.2)'
                                                : 'var(--color-bg-tertiary)',
                                            borderRadius: 'var(--radius-md)',
                                            border: selectedFeatured.includes(article.id)
                                                ? '2px solid var(--color-accent-primary)'
                                                : '1px solid rgba(255,255,255,0.1)',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <span style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: 'var(--radius-sm)',
                                            background: selectedFeatured.includes(article.id) ? 'var(--color-accent-primary)' : 'transparent',
                                            border: '2px solid var(--color-accent-primary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                        }}>
                                            {selectedFeatured.includes(article.id) && '✓'}
                                        </span>
                                        <img
                                            src={article.image}
                                            alt=""
                                            style={{ width: '50px', height: '35px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                                        />
                                        <span style={{ flex: 1, color: 'var(--color-text-primary)' }}>
                                            {article.title}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="admin-btn admin-btn-secondary" onClick={() => setShowFeaturedModal(false)}>
                                বাতিল
                            </button>
                            <button className="admin-btn admin-btn-primary" onClick={saveFeaturedArticles}>
                                💾 সংরক্ষণ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminSettings;
