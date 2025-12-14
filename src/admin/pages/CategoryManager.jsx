import { useState } from 'react';
import { useData } from '../DataContext';
import '../admin.css';

function CategoryManager() {
    const { categories, addCategory, updateCategory, deleteCategory, getMainCategories } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [formData, setFormData] = useState({ name: '', color: '#ef4444', parentId: '' });

    const mainCategories = getMainCategories();

    const openAddModal = () => {
        setEditingCategory(null);
        setFormData({ name: '', color: '#ef4444', parentId: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            color: category.color,
            parentId: category.parentId || ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const categoryData = {
            name: formData.name,
            color: formData.color,
            parentId: formData.parentId || null,
        };

        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, categoryData);
            } else {
                await addCategory(categoryData);
            }

            setIsModalOpen(false);
            setFormData({ name: '', color: '#ef4444', parentId: '' });
        } catch (error) {
            console.error('Category save error:', error);
        }
    };

    const handleDelete = (id) => {
        deleteCategory(id);
        setDeleteConfirm(null);
    };

    const colorOptions = [
        '#ef4444', '#f59e0b', '#22c55e', '#06b6d4',
        '#3b82f6', '#a855f7', '#ec4899', '#6366f1'
    ];

    // Get parent category name
    const getParentName = (parentId) => {
        if (!parentId) return '—';
        const parent = categories.find(c => c.id === parentId);
        return parent ? parent.name : '—';
    };

    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1 className="admin-page-title">বিভাগ ব্যবস্থাপনা</h1>
                    <p className="admin-breadcrumb">অ্যাডমিন / বিভাগ</p>
                </div>
                <button className="admin-btn admin-btn-primary" onClick={openAddModal}>
                    ➕ নতুন বিভাগ
                </button>
            </div>

            <div className="admin-table-container">
                <div className="admin-table-header">
                    <h3 className="admin-table-title">সকল বিভাগ</h3>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                        মোট: {categories.length}টি বিভাগ
                    </span>
                </div>

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>রঙ</th>
                            <th>নাম</th>
                            <th>মূল বিভাগ</th>
                            <th>ID</th>
                            <th>অ্যাকশন</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category.id}>
                                <td>
                                    <div
                                        style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: 'var(--radius-sm)',
                                            background: category.color
                                        }}
                                    />
                                </td>
                                <td style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                                    {category.parentId && <span style={{ color: 'var(--color-text-muted)' }}>↳ </span>}
                                    {category.name}
                                </td>
                                <td>{getParentName(category.parentId)}</td>
                                <td style={{ fontFamily: 'monospace' }}>{category.id}</td>
                                <td>
                                    <div className="admin-table-actions-cell">
                                        <button
                                            className="admin-btn admin-btn-icon"
                                            onClick={() => openEditModal(category)}
                                            title="সম্পাদনা"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="admin-btn admin-btn-icon"
                                            onClick={() => setDeleteConfirm(category.id)}
                                            title="মুছুন"
                                            style={{ color: '#ef4444' }}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title">
                                {editingCategory ? 'বিভাগ সম্পাদনা' : 'নতুন বিভাগ'}
                            </h3>
                            <button className="admin-modal-close" onClick={() => setIsModalOpen(false)}>
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="admin-modal-body">
                                <div className="admin-form-group">
                                    <label className="admin-form-label">বিভাগের নাম *</label>
                                    <input
                                        type="text"
                                        className="admin-form-input"
                                        placeholder="বিভাগের নাম লিখুন"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="admin-form-group">
                                    <label className="admin-form-label">মূল বিভাগ (উপবিভাগের জন্য)</label>
                                    <select
                                        className="admin-form-select"
                                        value={formData.parentId}
                                        onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                                    >
                                        <option value="">কোনো মূল বিভাগ নেই (প্রধান বিভাগ)</option>
                                        {mainCategories
                                            .filter(c => editingCategory ? c.id !== editingCategory.id : true)
                                            .map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))
                                        }
                                    </select>
                                </div>

                                <div className="admin-form-group">
                                    <label className="admin-form-label">রঙ নির্বাচন করুন</label>
                                    <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                                        {colorOptions.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, color })}
                                                style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: 'var(--radius-md)',
                                                    background: color,
                                                    border: formData.color === color ? '3px solid white' : '3px solid transparent',
                                                    cursor: 'pointer',
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="admin-modal-footer">
                                <button
                                    type="button"
                                    className="admin-btn admin-btn-secondary"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    বাতিল
                                </button>
                                <button type="submit" className="admin-btn admin-btn-primary">
                                    {editingCategory ? 'আপডেট করুন' : 'যোগ করুন'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title">বিভাগ মুছুন</h3>
                            <button className="admin-modal-close" onClick={() => setDeleteConfirm(null)}>
                                ✕
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            <p style={{ color: 'var(--color-text-secondary)' }}>
                                আপনি কি নিশ্চিত যে এই বিভাগটি মুছে ফেলতে চান? এই বিভাগের উপবিভাগ ও প্রবন্ধগুলো প্রভাবিত হতে পারে।
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

export default CategoryManager;
