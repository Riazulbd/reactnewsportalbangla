import { useState } from 'react';
import { useData } from '../DataContext';
import RichTextEditor from '../../components/RichTextEditor';
import '../admin.css';

function WritersPage() {
    const { writers, addWriter, updateWriter, deleteWriter } = useData();
    const [isEditing, setIsEditing] = useState(false);
    const [editingWriter, setEditingWriter] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        image_url: '',
        description: '',
        is_visible: true
    });

    const resetForm = () => {
        setFormData({
            name: '',
            image_url: '',
            description: '',
            is_visible: true
        });
        setIsEditing(false);
        setEditingWriter(null);
    };

    const handleEdit = (writer) => {
        setFormData({
            name: writer.name,
            image_url: writer.image_url || '',
            description: writer.description || '',
            is_visible: writer.is_visible !== false
        });
        setEditingWriter(writer);
        setIsEditing(true);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image_url: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            alert('লেখকের নাম আবশ্যক');
            return;
        }

        const writerData = {
            ...formData,
            created_at: editingWriter?.created_at || new Date().toISOString().split('T')[0]
        };

        if (editingWriter) {
            updateWriter(editingWriter.id, writerData);
        } else {
            addWriter(writerData);
        }

        resetForm();
    };

    const handleDelete = (writerId) => {
        deleteWriter(writerId);
        setShowDeleteConfirm(null);
    };

    const handleToggleVisibility = (writer) => {
        updateWriter(writer.id, { ...writer, is_visible: !writer.is_visible });
    };

    return (
        <div className="admin-page writers-page">
            <div className="admin-page-header">
                <div>
                    <h1>প্রবন্ধ লেখক</h1>
                    <p>লেখকদের যোগ করুন, সম্পাদনা করুন এবং পরিচালনা করুন</p>
                </div>
                {!isEditing && (
                    <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                        ➕ নতুন লেখক
                    </button>
                )}
            </div>

            {/* Add/Edit Form */}
            {isEditing && (
                <div className="admin-card writer-form-card">
                    <h2>{editingWriter ? 'লেখক সম্পাদনা' : 'নতুন লেখক যোগ করুন'}</h2>
                    <form onSubmit={handleSubmit} className="writer-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>লেখকের নাম *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="লেখকের নাম লিখুন"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>দৃশ্যমানতা</label>
                                <div className="toggle-switch-wrapper">
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_visible}
                                            onChange={(e) => setFormData(prev => ({ ...prev, is_visible: e.target.checked }))}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                    <span className="toggle-label">
                                        {formData.is_visible ? '✅ দৃশ্যমান' : '🚫 লুকানো'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>লেখকের ছবি</label>
                            <div className="image-upload-area">
                                {formData.image_url && (
                                    <div className="image-preview">
                                        <img src={formData.image_url} alt="Preview" />
                                        <button
                                            type="button"
                                            className="remove-image-btn"
                                            onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                                <label className="upload-btn">
                                    📷 ছবি আপলোড করুন
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        hidden
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>লেখকের বিবরণ</label>
                            <RichTextEditor
                                content={formData.description}
                                onChange={(html) => setFormData(prev => ({ ...prev, description: html }))}
                                placeholder="লেখকের সম্পর্কে বিস্তারিত লিখুন..."
                            />
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn btn-secondary" onClick={resetForm}>
                                বাতিল
                            </button>
                            <button type="submit" className="btn btn-primary">
                                {editingWriter ? '💾 আপডেট করুন' : '➕ লেখক যোগ করুন'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Writers List */}
            <div className="admin-card">
                <h2>সকল লেখক ({writers?.length || 0})</h2>

                {(!writers || writers.length === 0) ? (
                    <div className="empty-state">
                        <p>এখনো কোনো লেখক যোগ করা হয়নি</p>
                        <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                            প্রথম লেখক যোগ করুন
                        </button>
                    </div>
                ) : (
                    <div className="writers-grid">
                        {writers.map(writer => (
                            <div key={writer.id} className={`writer-card ${!writer.is_visible ? 'hidden-writer' : ''}`}>
                                <div className="writer-card-header">
                                    <div className="writer-avatar">
                                        {writer.image_url ? (
                                            <img src={writer.image_url} alt={writer.name} />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                {writer.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="writer-info">
                                        <h3>{writer.name}</h3>
                                        <span className={`visibility-badge ${writer.is_visible ? 'visible' : 'hidden'}`}>
                                            {writer.is_visible ? '✅ দৃশ্যমান' : '🚫 লুকানো'}
                                        </span>
                                    </div>
                                </div>

                                {writer.description && (
                                    <div
                                        className="writer-description-preview"
                                        dangerouslySetInnerHTML={{
                                            __html: writer.description.substring(0, 150) + (writer.description.length > 150 ? '...' : '')
                                        }}
                                    />
                                )}

                                <div className="writer-card-actions">
                                    <button
                                        className="btn-icon"
                                        onClick={() => handleToggleVisibility(writer)}
                                        title={writer.is_visible ? 'লুকান' : 'দেখান'}
                                    >
                                        {writer.is_visible ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                    <button
                                        className="btn-icon"
                                        onClick={() => handleEdit(writer)}
                                        title="সম্পাদনা"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="btn-icon btn-danger"
                                        onClick={() => setShowDeleteConfirm(writer.id)}
                                        title="মুছুন"
                                    >
                                        🗑️
                                    </button>
                                </div>

                                {/* Delete Confirmation */}
                                {showDeleteConfirm === writer.id && (
                                    <div className="delete-confirm-overlay">
                                        <div className="delete-confirm-box">
                                            <p>আপনি কি নিশ্চিত?</p>
                                            <div className="delete-confirm-actions">
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() => setShowDeleteConfirm(null)}
                                                >
                                                    না
                                                </button>
                                                <button
                                                    className="btn btn-danger"
                                                    onClick={() => handleDelete(writer.id)}
                                                >
                                                    হ্যাঁ, মুছুন
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default WritersPage;
