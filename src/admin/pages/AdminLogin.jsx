import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import '../admin.css';

function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        const result = login(username, password);
        if (result.success) {
            navigate('/admin');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-card">
                <div className="admin-login-header">
                    <div className="admin-login-logo">স</div>
                    <h1 className="admin-login-title">অ্যাডমিন প্যানেল</h1>
                    <p className="admin-login-subtitle">সংবাদপোর্টাল পরিচালনা করতে লগইন করুন</p>
                </div>

                {error && (
                    <div className="admin-login-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="admin-form-group">
                        <label className="admin-form-label">ইউজারনেম</label>
                        <input
                            type="text"
                            className="admin-form-input"
                            placeholder="admin"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="admin-form-group">
                        <label className="admin-form-label">পাসওয়ার্ড</label>
                        <input
                            type="password"
                            className="admin-form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="admin-btn admin-btn-primary admin-login-btn">
                        লগইন করুন
                    </button>
                </form>

                <p style={{ marginTop: 'var(--space-lg)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                    Demo: admin / admin123
                </p>
            </div>
        </div>
    );
}

export default AdminLogin;
