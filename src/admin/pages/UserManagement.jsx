import { useState } from 'react';
import { useData } from '../DataContext';
import '../admin.css';

function UserManagement() {
    const { users, addUser, updateUser, deleteUser } = useData();
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        email: '',
        role: 'author',
    });

    const roles = [
        { value: 'admin', label: 'অ্যাডমিন', description: 'সম্পূর্ণ অ্যাক্সেস' },
        { value: 'editor', label: 'সম্পাদক', description: 'প্রবন্ধ সম্পাদনা ও প্রকাশ' },
        { value: 'author', label: 'লেখক', description: 'শুধু প্রবন্ধ লেখা' },
    ];

    const showSuccess = (msg) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const openAddModal = () => {
        setEditingUser(null);
        setFormData({
            username: '',
            password: '',
            name: '',
            email: '',
            role: 'author',
        });
        setShowModal(true);
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            password: '',
            name: user.name,
            email: user.email,
            role: user.role,
        });
        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingUser) {
            const updates = { ...formData };
            if (!updates.password) delete updates.password;
            updateUser(editingUser.id, updates);
            showSuccess('ব্যবহারকারী আপডেট হয়েছে!');
        } else {
            addUser(formData);
            showSuccess('নতুন ব্যবহারকারী যোগ হয়েছে!');
        }

        setShowModal(false);
    };

    const handleDelete = (id) => {
        deleteUser(id);
        setShowDeleteConfirm(null);
        showSuccess('ব্যবহারকারী মুছে ফেলা হয়েছে!');
    };

    const getRoleLabel = (role) => roles.find(r => r.value === role)?.label || role;
    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin': return '#ef4444';
            case 'editor': return '#f59e0b';
            case 'author': return '#22c55e';
            default: return '#6b7280';
        }
    };

    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1 className="admin-page-title">ব্যবহারকারী ম্যানেজমেন্ট</h1>
                    <p className="admin-breadcrumb">অ্যাডমিন / ব্যবহারকারী</p>
                </div>
                <button className="admin-btn admin-btn-primary" onClick={openAddModal}>
                    ➕ নতুন ব্যবহারকারী
                </button>
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

            {/* Roles Legend */}
            <div style={{
                display: 'flex',
                gap: 'var(--space-lg)',
                marginBottom: 'var(--space-xl)',
                flexWrap: 'wrap',
            }}>
                {roles.map(role => (
                    <div key={role.value} style={{
                        padding: 'var(--space-md)',
                        background: 'var(--color-bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-md)',
                    }}>
                        <span style={{
                            padding: 'var(--space-xs) var(--space-md)',
                            background: getRoleBadgeColor(role.value),
                            borderRadius: 'var(--radius-full)',
                            color: 'white',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 500,
                        }}>
                            {role.label}
                        </span>
                        <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                            {role.description}
                        </span>
                    </div>
                ))}
            </div>

            {/* Users Table */}
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>নাম</th>
                            <th>ইউজারনেম</th>
                            <th>ইমেইল</th>
                            <th>ভূমিকা</th>
                            <th>অ্যাকশন</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: 'var(--radius-full)',
                                            background: 'var(--gradient-primary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: 'bold',
                                        }}>
                                            {user.name?.charAt(0) || 'U'}
                                        </div>
                                        {user.name}
                                    </div>
                                </td>
                                <td style={{ fontFamily: 'monospace' }}>{user.username}</td>
                                <td>{user.email}</td>
                                <td>
                                    <span style={{
                                        padding: 'var(--space-xs) var(--space-md)',
                                        background: getRoleBadgeColor(user.role),
                                        borderRadius: 'var(--radius-full)',
                                        color: 'white',
                                        fontSize: 'var(--text-sm)',
                                    }}>
                                        {getRoleLabel(user.role)}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                                        <button
                                            className="admin-btn admin-btn-icon"
                                            onClick={() => openEditModal(user)}
                                        >
                                            ✏️
                                        </button>
                                        {user.id !== 1 && (
                                            <button
                                                className="admin-btn admin-btn-icon"
                                                onClick={() => setShowDeleteConfirm(user.id)}
                                                style={{ color: '#ef4444' }}
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title">
                                {editingUser ? 'ব্যবহারকারী সম্পাদনা' : 'নতুন ব্যবহারকারী'}
                            </h3>
                            <button className="admin-modal-close" onClick={() => setShowModal(false)}>
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="admin-modal-body">
                                <div className="admin-form-group">
                                    <label className="admin-form-label">নাম *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="admin-form-input"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="admin-form-group">
                                    <label className="admin-form-label">ইউজারনেম *</label>
                                    <input
                                        type="text"
                                        name="username"
                                        className="admin-form-input"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                        disabled={editingUser}
                                    />
                                </div>

                                <div className="admin-form-group">
                                    <label className="admin-form-label">
                                        পাসওয়ার্ড {editingUser ? '(খালি রাখলে পরিবর্তন হবে না)' : '*'}
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        className="admin-form-input"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required={!editingUser}
                                    />
                                </div>

                                <div className="admin-form-group">
                                    <label className="admin-form-label">ইমেইল *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="admin-form-input"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="admin-form-group">
                                    <label className="admin-form-label">ভূমিকা *</label>
                                    <select
                                        name="role"
                                        className="admin-form-select"
                                        value={formData.role}
                                        onChange={handleChange}
                                        disabled={editingUser?.id === 1}
                                    >
                                        {roles.map(role => (
                                            <option key={role.value} value={role.value}>
                                                {role.label} - {role.description}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="admin-modal-footer">
                                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>
                                    বাতিল
                                </button>
                                <button type="submit" className="admin-btn admin-btn-primary">
                                    {editingUser ? '💾 আপডেট' : '➕ যোগ করুন'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
                <div className="admin-modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title">ব্যবহারকারী মুছুন?</h3>
                            <button className="admin-modal-close" onClick={() => setShowDeleteConfirm(null)}>
                                ✕
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            <p>আপনি কি নিশ্চিত এই ব্যবহারকারী মুছতে চান?</p>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="admin-btn admin-btn-secondary" onClick={() => setShowDeleteConfirm(null)}>
                                বাতিল
                            </button>
                            <button
                                className="admin-btn"
                                style={{ background: '#ef4444', color: 'white' }}
                                onClick={() => handleDelete(showDeleteConfirm)}
                            >
                                🗑️ মুছে ফেলুন
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserManagement;
