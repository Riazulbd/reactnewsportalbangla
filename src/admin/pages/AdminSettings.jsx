import { useState } from 'react';
import { useData } from '../DataContext';
import '../admin.css';

function AdminSettings() {
    const {
        articles,
        categories,
        settings,
        getHeroArticle,
        setHeroArticle,
        getMainCategories,
        reorderCategories,
    } = useData();

    const [draggedCategory, setDraggedCategory] = useState(null);
    const mainCategories = getMainCategories();
    const heroArticle = getHeroArticle();
    const [successMessage, setSuccessMessage] = useState('');

    const handleHeroChange = (articleId) => {
        setHeroArticle(parseInt(articleId));
        setSuccessMessage('হিরো প্রবন্ধ সফলভাবে আপডেট হয়েছে!');
        setTimeout(() => setSuccessMessage(''), 3000);
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
            setSuccessMessage('বিভাগের ক্রম আপডেট হয়েছে!');
            setTimeout(() => setSuccessMessage(''), 3000);
        }
        setDraggedCategory(null);
    };

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

            {/* Hero Article Selection */}
            <div className="admin-table-container" style={{ marginBottom: 'var(--space-xl)' }}>
                <div className="admin-table-header">
                    <h3 className="admin-table-title">🌟 হিরো প্রবন্ধ নির্বাচন</h3>
                </div>
                <div style={{ padding: 'var(--space-lg)' }}>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)' }}>
                        হোমপেজের শীর্ষে প্রদর্শিত হবে যে প্রবন্ধটি নির্বাচন করুন।
                    </p>

                    <div className="admin-form-group">
                        <label className="admin-form-label">বর্তমান হিরো প্রবন্ধ</label>
                        <select
                            className="admin-form-select"
                            value={settings.heroArticleId || ''}
                            onChange={(e) => handleHeroChange(e.target.value)}
                        >
                            <option value="">স্বয়ংক্রিয় (প্রথম ফিচার্ড প্রবন্ধ)</option>
                            {articles.map(article => (
                                <option key={article.id} value={article.id}>
                                    {article.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {heroArticle && (
                        <div style={{
                            marginTop: 'var(--space-lg)',
                            padding: 'var(--space-md)',
                            background: 'var(--color-bg-tertiary)',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            gap: 'var(--space-md)',
                            alignItems: 'center',
                        }}>
                            <img
                                src={heroArticle.image}
                                alt=""
                                style={{
                                    width: '100px',
                                    height: '60px',
                                    objectFit: 'cover',
                                    borderRadius: 'var(--radius-sm)',
                                }}
                            />
                            <div>
                                <p style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                                    {heroArticle.title}
                                </p>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                                    {heroArticle.date}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Category Order */}
            <div className="admin-table-container">
                <div className="admin-table-header">
                    <h3 className="admin-table-title">📁 বিভাগের ক্রম</h3>
                </div>
                <div style={{ padding: 'var(--space-lg)' }}>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)' }}>
                        ড্র্যাগ করে বিভাগের ক্রম পরিবর্তন করুন। এই ক্রমে হোমপেজে বিভাগগুলো প্রদর্শিত হবে।
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
                                    transition: 'all var(--transition-fast)',
                                }}
                            >
                                <span style={{
                                    color: 'var(--color-text-muted)',
                                    fontSize: 'var(--text-lg)',
                                }}>
                                    ⋮⋮
                                </span>
                                <span style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: 'var(--radius-sm)',
                                    background: category.color,
                                    flexShrink: 0,
                                }} />
                                <span style={{
                                    color: 'var(--color-text-primary)',
                                    fontWeight: 500,
                                    flex: 1,
                                }}>
                                    {category.name}
                                </span>
                                <span style={{
                                    color: 'var(--color-text-muted)',
                                    fontSize: 'var(--text-sm)',
                                }}>
                                    #{index + 1}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminSettings;
