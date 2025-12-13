import { useState } from 'react';
import { useData } from '../DataContext';
import '../admin.css';

function MediaLibrary() {
    const { mediaLibrary, addMedia, deleteMedia, searchMedia } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [newMedia, setNewMedia] = useState({ url: '', name: '', alt: '' });
    const [uploadStatus, setUploadStatus] = useState('');

    const filteredMedia = searchQuery ? searchMedia(searchQuery) : mediaLibrary;

    const handleUpload = (e) => {
        e.preventDefault();
        if (newMedia.url) {
            addMedia(newMedia);
            setNewMedia({ url: '', name: '', alt: '' });
            setShowUploadModal(false);
            setUploadStatus('ছবি সফলভাবে যোগ করা হয়েছে!');
            setTimeout(() => setUploadStatus(''), 3000);
        }
    };

    const handleDelete = (id) => {
        deleteMedia(id);
        setDeleteConfirm(null);
    };

    const copyUrl = async (url) => {
        try {
            await navigator.clipboard.writeText(url);
            setUploadStatus('URL কপি করা হয়েছে!');
            setTimeout(() => setUploadStatus(''), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1 className="admin-page-title">মিডিয়া লাইব্রেরি</h1>
                    <p className="admin-breadcrumb">অ্যাডমিন / মিডিয়া</p>
                </div>
                <button className="admin-btn admin-btn-primary" onClick={() => setShowUploadModal(true)}>
                    📤 ছবি যোগ করুন
                </button>
            </div>

            {uploadStatus && (
                <div style={{
                    padding: 'var(--space-md)',
                    background: 'rgba(34, 197, 94, 0.2)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--space-lg)',
                    border: '1px solid rgba(34, 197, 94, 0.5)',
                    color: '#22c55e',
                }}>
                    ✓ {uploadStatus}
                </div>
            )}

            <div className="admin-table-container">
                <div className="admin-table-header">
                    <div className="admin-search">
                        <span className="admin-search-icon">🔍</span>
                        <input
                            type="text"
                            className="admin-search-input"
                            placeholder="ছবি খুঁজুন..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                        মোট: {filteredMedia.length}টি ছবি
                    </span>
                </div>

                {filteredMedia.length > 0 ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: 'var(--space-lg)',
                        padding: 'var(--space-lg)',
                    }}>
                        {filteredMedia.map((media) => (
                            <div
                                key={media.id}
                                style={{
                                    background: 'var(--color-bg-tertiary)',
                                    borderRadius: 'var(--radius-lg)',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                }}
                            >
                                <div style={{ position: 'relative' }}>
                                    <img
                                        src={media.url}
                                        alt={media.alt || media.name}
                                        style={{
                                            width: '100%',
                                            height: '150px',
                                            objectFit: 'cover',
                                        }}
                                    />
                                </div>
                                <div style={{ padding: 'var(--space-md)' }}>
                                    <p style={{
                                        fontSize: 'var(--text-sm)',
                                        color: 'var(--color-text-primary)',
                                        marginBottom: 'var(--space-xs)',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {media.name || 'Untitled'}
                                    </p>
                                    <p style={{
                                        fontSize: 'var(--text-xs)',
                                        color: 'var(--color-text-muted)',
                                        marginBottom: 'var(--space-sm)',
                                    }}>
                                        {new Date(media.uploadedAt).toLocaleDateString('bn-BD')}
                                    </p>
                                    <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                                        <button
                                            className="admin-btn admin-btn-icon"
                                            onClick={() => copyUrl(media.url)}
                                            title="URL কপি করুন"
                                        >
                                            📋
                                        </button>
                                        <button
                                            className="admin-btn admin-btn-icon"
                                            onClick={() => setDeleteConfirm(media.id)}
                                            title="মুছুন"
                                            style={{ color: '#ef4444' }}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{
                        padding: 'var(--space-3xl)',
                        textAlign: 'center',
                        color: 'var(--color-text-muted)'
                    }}>
                        <p style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-md)' }}>📷</p>
                        <p>কোনো ছবি পাওয়া যায়নি</p>
                        <button
                            className="admin-btn admin-btn-primary"
                            style={{ marginTop: 'var(--space-lg)' }}
                            onClick={() => setShowUploadModal(true)}
                        >
                            📤 প্রথম ছবি যোগ করুন
                        </button>
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="admin-modal-overlay" onClick={() => setShowUploadModal(false)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title">ছবি যোগ করুন</h3>
                            <button className="admin-modal-close" onClick={() => setShowUploadModal(false)}>
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleUpload}>
                            <div className="admin-modal-body">
                                <div className="admin-form-group">
                                    <label className="admin-form-label">ছবির URL *</label>
                                    <input
                                        type="url"
                                        className="admin-form-input"
                                        placeholder="https://example.com/image.jpg"
                                        value={newMedia.url}
                                        onChange={(e) => setNewMedia({ ...newMedia, url: e.target.value })}
                                        required
                                    />
                                    {newMedia.url && (
                                        <div style={{ marginTop: 'var(--space-md)' }}>
                                            <img
                                                src={newMedia.url}
                                                alt="Preview"
                                                style={{
                                                    maxWidth: '100%',
                                                    maxHeight: '200px',
                                                    borderRadius: 'var(--radius-md)',
                                                    objectFit: 'cover',
                                                }}
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                                onLoad={(e) => { e.target.style.display = 'block'; }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="admin-form-group">
                                    <label className="admin-form-label">ছবির নাম</label>
                                    <input
                                        type="text"
                                        className="admin-form-input"
                                        placeholder="ছবির নাম লিখুন"
                                        value={newMedia.name}
                                        onChange={(e) => setNewMedia({ ...newMedia, name: e.target.value })}
                                    />
                                </div>

                                <div className="admin-form-group">
                                    <label className="admin-form-label">Alt টেক্সট (SEO)</label>
                                    <input
                                        type="text"
                                        className="admin-form-input"
                                        placeholder="ছবির বিষয়বস্তু বর্ণনা করুন"
                                        value={newMedia.alt}
                                        onChange={(e) => setNewMedia({ ...newMedia, alt: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="admin-modal-footer">
                                <button
                                    type="button"
                                    className="admin-btn admin-btn-secondary"
                                    onClick={() => setShowUploadModal(false)}
                                >
                                    বাতিল
                                </button>
                                <button type="submit" className="admin-btn admin-btn-primary">
                                    📤 যোগ করুন
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title">ছবি মুছুন</h3>
                            <button className="admin-modal-close" onClick={() => setDeleteConfirm(null)}>
                                ✕
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            <p style={{ color: 'var(--color-text-secondary)' }}>
                                আপনি কি নিশ্চিত যে এই ছবিটি মুছে ফেলতে চান?
                            </p>
                        </div>
                        <div className="admin-modal-footer">
                            <button
                                className="admin-btn admin-btn-secondary"
                                onClick={() => setDeleteConfirm(null)}
                            >
                                বাতিল
                            </button>
                            <button
                                className="admin-btn admin-btn-danger"
                                onClick={() => handleDelete(deleteConfirm)}
                            >
                                মুছে ফেলুন
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MediaLibrary;
