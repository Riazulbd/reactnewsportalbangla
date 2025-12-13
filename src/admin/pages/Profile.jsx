import { useState } from 'react';
import { useData } from '../DataContext';
import { useAuth } from '../AuthContext';
import '../admin.css';

function Profile() {
    const { user, updateUserPassword, saveUser } = useData();
    const { user: authUser } = useAuth();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [profileName, setProfileName] = useState(authUser?.name || 'অ্যাডমিন');

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            showMessage('error', 'নতুন পাসওয়ার্ড মিলছে না');
            return;
        }

        if (newPassword.length < 6) {
            showMessage('error', 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
            return;
        }

        const result = updateUserPassword(currentPassword, newPassword);

        if (result.success) {
            showMessage('success', 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } else {
            showMessage('error', result.error || 'পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে');
        }
    };

    const handleProfileUpdate = (e) => {
        e.preventDefault();
        saveUser({ ...user, name: profileName });
        showMessage('success', 'প্রোফাইল আপডেট হয়েছে');
    };

    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1 className="admin-page-title">প্রোফাইল</h1>
                    <p className="admin-breadcrumb">অ্যাডমিন / প্রোফাইল</p>
                </div>
            </div>

            {message.text && (
                <div style={{
                    padding: 'var(--space-md)',
                    background: message.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--space-lg)',
                    border: `1px solid ${message.type === 'success' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
                    color: message.type === 'success' ? '#22c55e' : '#ef4444',
                }}>
                    {message.type === 'success' ? '✓' : '⚠️'} {message.text}
                </div>
            )}

            {/* Profile Info */}
            <div className="admin-table-container" style={{ marginBottom: 'var(--space-xl)' }}>
                <div className="admin-table-header">
                    <h3 className="admin-table-title">👤 প্রোফাইল তথ্য</h3>
                </div>
                <div style={{ padding: 'var(--space-lg)' }}>
                    <form onSubmit={handleProfileUpdate}>
                        <div className="admin-form-group">
                            <label className="admin-form-label">নাম</label>
                            <input
                                type="text"
                                className="admin-form-input"
                                value={profileName}
                                onChange={(e) => setProfileName(e.target.value)}
                                placeholder="আপনার নাম"
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">ইমেইল</label>
                            <input
                                type="email"
                                className="admin-form-input"
                                value={authUser?.email || 'admin@example.com'}
                                disabled
                                style={{ opacity: 0.7 }}
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">ভূমিকা</label>
                            <input
                                type="text"
                                className="admin-form-input"
                                value={authUser?.role || 'অ্যাডমিনিস্ট্রেটর'}
                                disabled
                                style={{ opacity: 0.7 }}
                            />
                        </div>

                        <button type="submit" className="admin-btn admin-btn-primary">
                            💾 প্রোফাইল আপডেট
                        </button>
                    </form>
                </div>
            </div>

            {/* Password Change */}
            <div className="admin-table-container">
                <div className="admin-table-header">
                    <h3 className="admin-table-title">🔐 পাসওয়ার্ড পরিবর্তন</h3>
                </div>
                <div style={{ padding: 'var(--space-lg)' }}>
                    <form onSubmit={handlePasswordChange}>
                        <div className="admin-form-group">
                            <label className="admin-form-label">বর্তমান পাসওয়ার্ড</label>
                            <input
                                type="password"
                                className="admin-form-input"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="বর্তমান পাসওয়ার্ড লিখুন"
                                required
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">নতুন পাসওয়ার্ড</label>
                            <input
                                type="password"
                                className="admin-form-input"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="নতুন পাসওয়ার্ড লিখুন"
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">নতুন পাসওয়ার্ড নিশ্চিত করুন</label>
                            <input
                                type="password"
                                className="admin-form-input"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="আবার নতুন পাসওয়ার্ড লিখুন"
                                required
                            />
                        </div>

                        <button type="submit" className="admin-btn admin-btn-primary">
                            🔒 পাসওয়ার্ড পরিবর্তন
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Profile;
